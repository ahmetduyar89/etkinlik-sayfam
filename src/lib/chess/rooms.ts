// src/lib/chess/rooms.ts — Canlı Satranç masalarının ortak hafızası
// ─────────────────────────────────────────────────────────────────────
// Bir masa, Firestore'da tek bir dokümandır: `chess_rooms/{kod}`. İki cihaz
// da bu dokümanı canlı dinler; biri hamle yazdığında diğerinin tahtası anında
// güncellenir. Sunucu tarafı kod yoktur — kuralları iki taraf da kendi
// motoruyla denetler.
//
// NEDEN HAMLE LİSTESİ TUTULUYOR?
// Konumu tek başına FEN de anlatır. Ama "aynı konum üç kez tekrarlandı"
// beraberliği ve hamle geçmişi şeridi için oyunun TAMAMI gerekir. Bu yüzden
// kaynak doğruluk hamle listesidir (UCI: "e2e4", "e7e8q"); FEN yalnızca
// hızlı gösterim ve tutarlılık denetimi için birlikte yazılır.
//
// YARIŞ DURUMU
// İki oyuncunun aynı anda yazması satrançta mümkün değildir (sıra tektir) ama
// "pes et" ile "hamle" çakışabilir. Bu yüzden her yazma bir Firestore işlemi
// (transaction) içinde yapılır: doküman okunur, karar ona bakılarak verilir.
// ─────────────────────────────────────────────────────────────────────
import {
    collection,
    doc,
    getDocs,
    limit as queryLimit,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Chess, DEFAULT_FEN, type PieceColor } from './engine/Chess';

export const ROOMS = 'chess_rooms';

/** Masa durumu: rakip bekleniyor · oynanıyor · bitti. */
export type RoomStatus = 'bekliyor' | 'oynaniyor' | 'bitti';

/** Masanın görünürlüğü: listede herkese açık ya da yalnızca kodu bilene. */
export type RoomKind = 'acik' | 'ozel';

/** Bir koltukta oturan oyuncu. */
export interface Seat {
    id: string;
    name: string;
    /** Oyuncu "Hazırım" dedi mi? İki taraf da hazır olunca oyun başlar. */
    ready: boolean;
    /** Son yaşam sinyali (ms). Sekmesi kapananlar listeden böyle düşer. */
    seen: number;
}

/** Satranç saati. `null` ise süresiz oynanıyor demektir. */
export interface RoomClock {
    /** Başlangıç süresi (ms) — gösterimde kullanılır. */
    initial_ms: number;
    /** Hamle başına eklenen süre (ms). */
    increment_ms: number;
    w_ms: number;
    b_ms: number;
    /** Sıradaki oyuncunun saatinin çalışmaya başladığı an (ms). */
    since: number;
}

export interface RoomResult {
    /** "1-0" | "0-1" | "1/2-1/2" */
    code: string;
    winner: PieceColor | null;
    reason: string;
}

export interface ChessRoom {
    id: string;
    code: string;
    kind: RoomKind;
    status: RoomStatus;
    white: Seat | null;
    black: Seat | null;
    /** Oynanmış hamleler (UCI). Oyunun kaynak doğruluğu budur. */
    moves: string[];
    fen: string;
    last_move: string | null;
    clock: RoomClock | null;
    result: RoomResult | null;
    /** Beraberlik teklif eden rengin kodu; teklif yoksa null. */
    draw_offer: PieceColor | null;
    /** Yeniden oynama isteği: iki taraf da isteyince yeni oyun kurulur. */
    rematch: { w: boolean; b: boolean };
    created_at: number;
    updated_at: number;
}

/** Bir masanın "canlı" sayıldığı süre: bu kadar sessizlikten sonra listeden düşer. */
export const STALE_MS = 90_000;

/** Yaşam sinyali aralığı — oyuncu sayfadayken bu sıklıkla `seen` tazelenir. */
export const HEARTBEAT_MS = 20_000;

/** Seçilebilen süre ayarları. */
export const TIME_CONTROLS = [
    { id: 'suresiz', label: 'Süresiz', initial_ms: 0, increment_ms: 0 },
    { id: 'hizli5', label: '5 dakika', initial_ms: 5 * 60_000, increment_ms: 0 },
    { id: 'artisli10', label: '10 dakika + 5 sn', initial_ms: 10 * 60_000, increment_ms: 5_000 },
    { id: 'uzun25', label: '25 dakika', initial_ms: 25 * 60_000, increment_ms: 0 },
] as const;

export type TimeControlId = (typeof TIME_CONTROLS)[number]['id'];

export function findTimeControl(id: string) {
    return TIME_CONTROLS.find((t) => t.id === id) ?? TIME_CONTROLS[0];
}

/* ------------------------------------------------------------------ *
 * Yardımcılar
 * ------------------------------------------------------------------ */

/** Hamle listesini oynayıp konumu kurar. Bozuk hamlede o noktada durur. */
export function replay(moves: string[]): Chess {
    const chess = new Chess();
    for (const uci of moves) {
        if (!chess.moveUci(uci)) break;
    }
    return chess;
}

/** Oyuncunun bu masadaki rengi; oturmuyorsa null (izleyici). */
export function seatColor(room: ChessRoom, id: string): PieceColor | null {
    if (room.white?.id === id) return 'w';
    if (room.black?.id === id) return 'b';
    return null;
}

export function seatOf(room: ChessRoom, color: PieceColor): Seat | null {
    return color === 'w' ? room.white : room.black;
}

/** Masada boş koltuk var mı? */
export function hasFreeSeat(room: ChessRoom): boolean {
    return !room.white || !room.black;
}

/** Masa hâlâ canlı mı — oturan oyunculardan biri son 90 saniyede görüldü mü? */
export function isFresh(room: ChessRoom, now = Date.now()): boolean {
    const seen = Math.max(room.white?.seen ?? 0, room.black?.seen ?? 0, room.updated_at);
    return now - seen < STALE_MS;
}

/**
 * Saatin şu anki hâli: sıradaki oyuncunun süresi geçen zaman kadar azalmış
 * gösterilir. Ekran her saniye bunu çağırır; doküman yazılmaz.
 */
export function clockNow(room: ChessRoom, now = Date.now()): { w_ms: number; b_ms: number } | null {
    if (!room.clock) return null;
    const { w_ms, b_ms, since } = room.clock;
    if (room.status !== 'oynaniyor') return { w_ms, b_ms };
    const turn = replay(room.moves).turnColor();
    const elapsed = Math.max(0, now - since);
    return turn === 'w'
        ? { w_ms: Math.max(0, w_ms - elapsed), b_ms }
        : { w_ms, b_ms: Math.max(0, b_ms - elapsed) };
}

function emptyRoom(code: string, kind: RoomKind, clock: RoomClock | null): Omit<ChessRoom, 'id'> {
    const now = Date.now();
    return {
        code,
        kind,
        status: 'bekliyor',
        white: null,
        black: null,
        moves: [],
        fen: DEFAULT_FEN,
        last_move: null,
        clock,
        result: null,
        draw_offer: null,
        rematch: { w: false, b: false },
        created_at: now,
        updated_at: now,
    };
}

function newClock(timeControl: TimeControlId): RoomClock | null {
    const tc = findTimeControl(timeControl);
    if (tc.initial_ms === 0) return null;
    return {
        initial_ms: tc.initial_ms,
        increment_ms: tc.increment_ms,
        w_ms: tc.initial_ms,
        b_ms: tc.initial_ms,
        since: Date.now(),
    };
}

/** Dört haneli, akılda kalır masa kodu. */
function randomCode(): string {
    return String(1000 + Math.floor(Math.random() * 9000));
}

/** Firestore dokümanını ChessRoom'a çevirir (eski/eksik alanlara dayanıklı). */
function toRoom(id: string, data: Record<string, unknown>): ChessRoom {
    const raw = data as Partial<ChessRoom>;
    return {
        id,
        code: raw.code ?? id,
        kind: raw.kind ?? 'acik',
        status: raw.status ?? 'bekliyor',
        white: raw.white ?? null,
        black: raw.black ?? null,
        moves: Array.isArray(raw.moves) ? raw.moves : [],
        fen: raw.fen ?? DEFAULT_FEN,
        last_move: raw.last_move ?? null,
        clock: raw.clock ?? null,
        result: raw.result ?? null,
        draw_offer: raw.draw_offer ?? null,
        rematch: raw.rematch ?? { w: false, b: false },
        created_at: raw.created_at ?? 0,
        updated_at: raw.updated_at ?? 0,
    };
}

/**
 * Masayı işlem içinde okur, `build` ile yeni hâlini hesaplar ve yazar.
 * `build` null dönerse hiçbir şey yazılmaz — çağıran taraf bunu "isteğim
 * geçersizdi, ekran zaten doğru" diye yorumlar.
 */
async function editRoom(
    code: string,
    build: (room: ChessRoom) => Partial<ChessRoom> | null
): Promise<ChessRoom | null> {
    const ref = doc(db, ROOMS, code);
    return runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return null;
        const room = toRoom(code, snap.data() as Record<string, unknown>);
        const patch = build(room);
        if (!patch) return null;
        const next = { ...room, ...patch, updated_at: Date.now() };
        const { id: _id, ...payload } = next;
        tx.set(ref, payload);
        return next;
    });
}

/* ------------------------------------------------------------------ *
 * Masa kurma ve katılma
 * ------------------------------------------------------------------ */

export class RoomError extends Error {}

/**
 * Yeni masa kurar ve kuran oyuncuyu koltuğa oturtur.
 * Kod çakışırsa (aynı kodlu canlı masa varsa) başka kod denenir.
 */
export async function createRoom(options: {
    id: string;
    name: string;
    kind: RoomKind;
    timeControl: TimeControlId;
    /** Kuran oyuncunun rengi; 'rastgele' ise para atılır. */
    color: PieceColor | 'rastgele';
}): Promise<ChessRoom> {
    const color: PieceColor =
        options.color === 'rastgele' ? (Math.random() < 0.5 ? 'w' : 'b') : options.color;

    for (let attempt = 0; attempt < 12; attempt += 1) {
        const code = randomCode();
        const ref = doc(db, ROOMS, code);
        const created = await runTransaction(db, async (tx) => {
            const snap = await tx.get(ref);
            if (snap.exists()) {
                const existing = toRoom(code, snap.data() as Record<string, unknown>);
                // Yalnızca terk edilmiş masaların kodu yeniden kullanılabilir.
                if (isFresh(existing)) return null;
            }
            const seat: Seat = { id: options.id, name: options.name, ready: false, seen: Date.now() };
            const base = emptyRoom(code, options.kind, newClock(options.timeControl));
            const payload = { ...base, [color === 'w' ? 'white' : 'black']: seat };
            tx.set(ref, payload);
            return { id: code, ...payload } as ChessRoom;
        });
        if (created) return created;
    }
    throw new RoomError('Masa kurulamadı, birazdan tekrar deneyin.');
}

/**
 * Kodu bilinen masaya katılır.
 *  - Oyuncu zaten oturuyorsa yalnızca adı ve yaşam sinyali tazelenir.
 *  - Boş koltuk yoksa izleyici olarak açılır (masa dokümanı değişmez).
 */
export async function joinRoom(code: string, id: string, name: string): Promise<ChessRoom> {
    const room = await editRoom(code, (current) => {
        const mine = seatColor(current, id);
        if (mine) {
            const seat: Seat = { ...seatOf(current, mine)!, name, seen: Date.now() };
            return mine === 'w' ? { white: seat } : { black: seat };
        }
        const seat: Seat = { id, name, ready: false, seen: Date.now() };
        if (!current.white) return { white: seat };
        if (!current.black) return { black: seat };
        return null; // Masa dolu: izleyici olarak devam.
    });
    if (room) return room;

    const existing = await readRoom(code);
    if (!existing) throw new RoomError('Bu kodla bir masa bulunamadı.');
    return existing;
}

export async function readRoom(code: string): Promise<ChessRoom | null> {
    const ref = doc(db, ROOMS, code);
    return runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        return snap.exists() ? toRoom(code, snap.data() as Record<string, unknown>) : null;
    });
}

/** Masayı canlı dinler. */
export function watchRoom(
    code: string,
    onChange: (room: ChessRoom | null) => void,
    onError?: (e: Error) => void
): () => void {
    return onSnapshot(
        doc(db, ROOMS, code),
        (snap) =>
            onChange(snap.exists() ? toRoom(snap.id, snap.data() as Record<string, unknown>) : null),
        (error) => onError?.(error)
    );
}

/**
 * Açık masaları canlı dinler.
 *
 * Sorgu tek alanda sıralıdır (updated_at); durum ve görünürlük süzgeci
 * tarayıcıda uygulanır. Böylece Firestore'da bileşik dizin kurmak gerekmez —
 * okul hesabında yönetim işi çıkmasın diye bilerek böyle yapıldı.
 */
export function watchOpenRooms(
    onChange: (rooms: ChessRoom[]) => void,
    onError?: (e: Error) => void
): () => void {
    const q = query(collection(db, ROOMS), orderBy('updated_at', 'desc'), queryLimit(60));
    return onSnapshot(
        q,
        (snap) => {
            const now = Date.now();
            const rooms = snap.docs
                .map((d) => toRoom(d.id, d.data() as Record<string, unknown>))
                .filter((r) => r.kind === 'acik' && r.status !== 'bitti' && isFresh(r, now));
            onChange(rooms);
        },
        (error) => onError?.(error)
    );
}

/* ------------------------------------------------------------------ *
 * Masadaki eylemler
 * ------------------------------------------------------------------ */

/** "Hazırım" düğmesi. İki taraf da hazır olduğunda oyun başlar. */
export async function setReady(code: string, id: string, ready: boolean): Promise<void> {
    await editRoom(code, (room) => {
        const color = seatColor(room, id);
        if (!color || room.status === 'oynaniyor') return null;
        const seat: Seat = { ...seatOf(room, color)!, ready, seen: Date.now() };
        const patch: Partial<ChessRoom> = color === 'w' ? { white: seat } : { black: seat };
        const other = color === 'w' ? room.black : room.white;
        if (ready && other?.ready) {
            patch.status = 'oynaniyor';
            patch.result = null;
            patch.moves = [];
            patch.fen = DEFAULT_FEN;
            patch.last_move = null;
            patch.draw_offer = null;
            patch.rematch = { w: false, b: false };
            if (room.clock) {
                patch.clock = {
                    ...room.clock,
                    w_ms: room.clock.initial_ms,
                    b_ms: room.clock.initial_ms,
                    since: Date.now(),
                };
            }
        }
        return patch;
    });
}

/**
 * Hamle yazar.
 *
 * Hamle, masadaki listenin ÜZERİNE oynanarak doğrulanır: sıra gerçekten bu
 * oyuncudaysa ve hamle yasalsa yazılır. Böylece geciken bir istek eski konuma
 * göre yazılmış olmaz.
 *
 * @returns Hamle yazıldıysa true.
 */
export async function playMove(code: string, id: string, uci: string): Promise<boolean> {
    const room = await editRoom(code, (current) => {
        if (current.status !== 'oynaniyor') return null;
        const color = seatColor(current, id);
        if (!color) return null;

        const chess = replay(current.moves);
        if (chess.turnColor() !== color) return null;
        if (!chess.moveUci(uci)) return null;

        const moves = [...current.moves, uci];
        const patch: Partial<ChessRoom> = {
            moves,
            fen: chess.fen(),
            last_move: uci,
            draw_offer: null,
        };

        if (current.clock) {
            const elapsed = Math.max(0, Date.now() - current.clock.since);
            const left = Math.max(0, (color === 'w' ? current.clock.w_ms : current.clock.b_ms) - elapsed);
            const next = left + current.clock.increment_ms;
            patch.clock = {
                ...current.clock,
                [color === 'w' ? 'w_ms' : 'b_ms']: next,
                since: Date.now(),
            } as RoomClock;
        }

        const status = chess.status();
        if (status.over) {
            patch.status = 'bitti';
            patch.result = { code: status.result, winner: status.winner, reason: status.reason };
        }
        return patch;
    });
    return room !== null;
}

/** Pes etme. */
export async function resign(code: string, id: string): Promise<void> {
    await editRoom(code, (room) => {
        const color = seatColor(room, id);
        if (!color || room.status !== 'oynaniyor') return null;
        const winner: PieceColor = color === 'w' ? 'b' : 'w';
        const name = seatOf(room, color)?.name ?? 'Oyuncu';
        return {
            status: 'bitti',
            result: {
                code: winner === 'w' ? '1-0' : '0-1',
                winner,
                reason: `${name} pes etti.`,
            },
        };
    });
}

/** Süre bitti: sıradaki oyuncunun saati sıfırlandığında iki taraf da yazabilir. */
export async function flagTimeout(code: string, loser: PieceColor): Promise<void> {
    await editRoom(code, (room) => {
        if (room.status !== 'oynaniyor' || !room.clock) return null;
        const live = clockNow(room);
        if (!live) return null;
        if ((loser === 'w' ? live.w_ms : live.b_ms) > 0) return null;
        const winner: PieceColor = loser === 'w' ? 'b' : 'w';
        const name = seatOf(room, loser)?.name ?? (loser === 'w' ? 'Beyaz' : 'Siyah');
        return {
            status: 'bitti',
            result: {
                code: winner === 'w' ? '1-0' : '0-1',
                winner,
                reason: `${name} oyununun süresi doldu.`,
            },
        };
    });
}

/** Beraberlik teklif eder ya da teklifi geri çeker. */
export async function offerDraw(code: string, id: string, offering: boolean): Promise<void> {
    await editRoom(code, (room) => {
        const color = seatColor(room, id);
        if (!color || room.status !== 'oynaniyor') return null;
        if (!offering) return room.draw_offer === color ? { draw_offer: null } : null;
        return { draw_offer: color };
    });
}

/** Gelen beraberlik teklifini kabul eder ya da reddeder. */
export async function answerDraw(code: string, id: string, accept: boolean): Promise<void> {
    await editRoom(code, (room) => {
        const color = seatColor(room, id);
        if (!color || room.status !== 'oynaniyor') return null;
        if (!room.draw_offer || room.draw_offer === color) return null;
        if (!accept) return { draw_offer: null };
        return {
            status: 'bitti',
            draw_offer: null,
            result: {
                code: '1/2-1/2',
                winner: null,
                reason: 'İki oyuncu beraberlikte anlaştı.',
            },
        };
    });
}

/**
 * Yeniden oynama isteği. İki taraf da isteyince renkler değişir ve yeni oyun
 * başlar — turnuvalarda olduğu gibi herkes iki renkle de oynamış olur.
 */
export async function requestRematch(code: string, id: string): Promise<void> {
    await editRoom(code, (room) => {
        const color = seatColor(room, id);
        if (!color || room.status !== 'bitti') return null;
        const rematch = { ...room.rematch, [color]: true };
        if (!(rematch.w && rematch.b)) return { rematch };

        const white = room.black ? { ...room.black, ready: true, seen: Date.now() } : null;
        const black = room.white ? { ...room.white, ready: true, seen: Date.now() } : null;
        return {
            status: 'oynaniyor',
            white,
            black,
            moves: [],
            fen: DEFAULT_FEN,
            last_move: null,
            result: null,
            draw_offer: null,
            rematch: { w: false, b: false },
            clock: room.clock
                ? {
                      ...room.clock,
                      w_ms: room.clock.initial_ms,
                      b_ms: room.clock.initial_ms,
                      since: Date.now(),
                  }
                : null,
        };
    });
}

/** Koltuktan kalkar; masada kimse kalmazsa masa kapanır. */
export async function leaveRoom(code: string, id: string): Promise<void> {
    await editRoom(code, (room) => {
        const color = seatColor(room, id);
        if (!color) return null;
        const patch: Partial<ChessRoom> = color === 'w' ? { white: null } : { black: null };
        if (room.status === 'oynaniyor') {
            const winner: PieceColor = color === 'w' ? 'b' : 'w';
            patch.status = 'bitti';
            patch.result = {
                code: winner === 'w' ? '1-0' : '0-1',
                winner,
                reason: `${seatOf(room, color)?.name ?? 'Oyuncu'} masadan ayrıldı.`,
            };
        } else {
            patch.status = 'bekliyor';
        }
        return patch;
    });
}

/**
 * Yaşam sinyali. Doküman okunmadan tek alan güncellenir; ucuzdur ve sık
 * çağrılabilir. Masa silinmişse hata yutulur.
 */
export async function heartbeat(code: string, color: PieceColor): Promise<void> {
    try {
        await updateDoc(doc(db, ROOMS, code), {
            [`${color === 'w' ? 'white' : 'black'}.seen`]: Date.now(),
            updated_at: Date.now(),
        });
    } catch {
        // Masa kapanmış olabilir; ekran zaten dinleyiciden haberdar olur.
    }
}

/**
 * Terk edilmiş masaları temizler (lobide birikmesinler diye).
 * Lobi açıldığında bir kez çağrılır; hata olursa sessizce geçilir.
 */
export async function pruneStaleRooms(): Promise<void> {
    try {
        const snap = await getDocs(
            query(collection(db, ROOMS), orderBy('updated_at', 'asc'), queryLimit(30))
        );
        const now = Date.now();
        const dead = snap.docs
            .map((d) => toRoom(d.id, d.data() as Record<string, unknown>))
            .filter((r) => now - Math.max(r.updated_at, r.created_at) > 6 * 60 * 60_000);
        await Promise.all(
            dead.map((r) =>
                runTransaction(db, async (tx) => {
                    tx.delete(doc(db, ROOMS, r.id));
                })
            )
        );
    } catch {
        // Temizlik bir kolaylıktır; başarısız olması oyunu etkilemez.
    }
}
