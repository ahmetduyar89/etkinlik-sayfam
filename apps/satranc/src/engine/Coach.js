/**
 * Coach.js — Konumu çocuk diline çeviren analiz katmanı.
 *
 * Yapay Zeka Öğretmeni ekranının beynidir. Motorun sayısal çıktısını
 * ("+2.4 santipiyon") bir ilkokul öğrencisinin anlayacağı cümlelere dönüştürür
 * ve tahtada GERÇEKTEN olan biteni anlatır:
 *
 *  - Şah var mı, mat tehdidi var mı?
 *  - Hangi taşların korumasız (asılı) duruyor?
 *  - Rakibin hangi taşını bedavaya alabilirsin?
 *  - Motorun önerdiği hamle ve NEDEN iyi olduğu.
 *
 * Buradaki hiçbir gözlem uydurma değildir; hepsi kural motorunun saldırı
 * hesaplarından ve arama sonuçlarından üretilir.
 */

import { SQUARE_LIST, toAlgebraic, PIECE_NAMES_TR, PAWN, KING, sanTr } from "./Chess.js";
import { analysePosition, scoreToText } from "./Ai.js";
import { SIMPLE_VALUES, materialSummary } from "./Evaluator.js";

/**
 * Gözlem önem sırası — arayüz en önemliyi en üste koyar.
 * "win" (hemen mat edebilme) her şeyin önüne geçer: çocuk o an oyunu bitirebiliyorsa
 * materyal dengesini okumasının bir anlamı yoktur.
 */
const PRIORITY = { win: -1, danger: 0, chance: 1, info: 2, tip: 3 };

const other = (color) => (color === "w" ? "b" : "w");
const colorName = (color) => (color === "w" ? "Beyaz" : "Siyah");

/**
 * Bir karedeki taşın korumasız olup olmadığını söyler.
 * "Asılı taş" = rakip saldırıyor ama kendi taşların korumuyor.
 *
 * DİKKAT: `index` 0x88 SAYISAL kare indeksidir, "e4" gibi bir metin değil.
 * attacked() indeks aritmetiği yaptığı için metin verilirse ışın döngüsü sonsuza kadar sürer.
 */
function isHanging(chess, index, color) {
  const attackedByEnemy = chess.attacked(other(color), index);
  if (!attackedByEnemy) return false;
  // Kendi rengimizden bir taş bu kareye saldırıyorsa, taş korunuyor demektir.
  return !chess.attacked(color, index);
}

/**
 * Verilen rengin korumasız duran taşlarını bulur (şah hariç; şah "asılı" olmaz,
 * ona şah denir).
 * @returns {Array<{square:string, type:string, name:string, value:number}>}
 */
export function hangingPieces(chess, color) {
  const found = [];
  for (const index of SQUARE_LIST) {
    const piece = chess.board[index];
    if (!piece || piece.color !== color || piece.type === KING) continue;
    if (isHanging(chess, index, color)) {
      found.push({
        square: toAlgebraic(index),
        type: piece.type,
        name: PIECE_NAMES_TR[piece.type],
        value: SIMPLE_VALUES[piece.type]
      });
    }
  }
  // En değerli taş en önemli uyarıdır.
  return found.sort((a, b) => b.value - a.value);
}

/**
 * Konumu inceler ve çocuk diline çevrilmiş gözlemler üretir.
 *
 * @param {import("./Chess.js").Chess} chess
 * @param {"w"|"b"} perspective Kimin gözünden anlatalım (varsayılan: sıradaki oyuncu)
 * @returns {Promise<{observations:Array, best:object|null, bestSan:string|null, summary:string}>}
 */
export async function coachPosition(chess, perspective = chess.turnColor()) {
  const observations = [];
  const turn = chess.turnColor();
  const status = chess.status();

  /** Gözlem ekleme kısayolu. */
  const add = (kind, icon, text) => observations.push({ kind, icon, text, order: PRIORITY[kind] });

  // --- Oyun bitmiş mi? ---
  if (status.over) {
    add("info", "🏁", status.reason);
    return {
      observations,
      best: null,
      bestSan: null,
      summary: status.reason
    };
  }

  // --- Şah durumu ---
  if (chess.inCheck()) {
    add(
      "danger",
      "⚠️",
      `${colorName(turn)} şah tehdit altında! Üç seçeneğin var: şahı kaçır, araya bir taş koy ya da saldıran taşı al.`
    );
  }

  // --- Materyal ---
  const material = materialSummary(chess);
  add("info", "⚖️", material.text);

  // --- Motorun görüşü ---
  const analysis = await analysePosition(chess, "orta");
  const best = analysis.best;
  let bestSan = null;

  if (best) {
    const probe = chess.clone();
    const played = probe.move(best);
    bestSan = played ? played.san : null;

    if (bestSan) {
      const movedPiece = chess.get(best.from);
      const pieceName = movedPiece ? PIECE_NAMES_TR[movedPiece.type] : "taş";
      let why = `${best.from.toUpperCase()} karesindeki ${pieceName} taşını ${best.to.toUpperCase()} karesine oynamak.`;
      let kind = "tip";
      let symbol = "💡";

      if (probe.isCheckmate()) {
        // Hemen mat edilebiliyorsa bu, tahtadaki her şeyden önemlidir.
        why = `${sanTr(bestSan)} ile MAT edebilirsin! Oyun hemen biter.`;
        kind = "win";
        symbol = "👑";
      } else if (played.captured) {
        why += ` Böylece rakibin ${PIECE_NAMES_TR[played.captured]} taşını alırsın.`;
      } else if (probe.inCheck()) {
        why += " Bu hamle şah çekiyor ve rakibi zorlar.";
      }

      add(kind, symbol, `En iyi hamle: ${sanTr(bestSan)}. ${why}`);
    }
  }

  // --- Kendi korumasız taşların ---
  const myHanging = hangingPieces(chess, perspective);
  if (myHanging.length > 0) {
    const list = myHanging
      .slice(0, 3)
      .map((piece) => `${piece.square.toUpperCase()} (${piece.name})`)
      .join(", ");
    add(
      "danger",
      "🛡️",
      `Dikkat! Şu taşların korumasız ve saldırı altında: ${list}. Ya kaçır, ya koru, ya da saldıranı al.`
    );
  }

  // --- Rakibin korumasız taşları ---
  const theirHanging = hangingPieces(chess, other(perspective));
  if (theirHanging.length > 0) {
    const top = theirHanging[0];
    add(
      "chance",
      "🎯",
      `Fırsat! Rakibin ${top.square.toUpperCase()} karesindeki ${top.name} taşı korumasız. Ona saldırabilir misin?`
    );
  }

  // --- Genel değerlendirme ---
  const fromPerspective = turn === perspective ? analysis.score : -analysis.score;
  const summary = scoreToText(fromPerspective);
  add("info", "📊", summary);

  observations.sort((a, b) => a.order - b.order);
  return { observations, best, bestSan, summary };
}

/**
 * Serbest yazılan soruyu, GEÇERLİ KONUMU da dikkate alarak yanıtlar.
 * Anahtar kelime bulunamazsa konumun kendisi hakkında konuşur.
 *
 * @returns {Promise<string>}
 */
export async function answerQuestion(chess, question) {
  // Türkçe küçültme ŞART: düz toLowerCase() "İ" harfini "i̇" (i + birleşen nokta)
  // yapar; çocuklar sık sık büyük harfle yazdığı için "TEHLİKEDE MİYİM" sorusu
  // "tehli̇kede mi̇yi̇m" olur ve "tehlike" kelimesi hiç yakalanmazdı.
  const text = String(question || "").toLocaleLowerCase("tr");
  const has = (...words) => words.some((word) => text.includes(word));

  if (has("mat", "kazan")) {
    const analysis = await coachPosition(chess);
    if (analysis.bestSan && analysis.bestSan.includes("#")) {
      return `Evet! ${sanTr(analysis.bestSan)} ile hemen mat edebilirsin. Şahın kaçacak yeri kalmıyor.`;
    }
    return "Şu an zorunlu bir mat göremiyorum. Mat için önce rakip şahın kaçış karelerini azaltmalısın: taşlarını şaha doğru getir ve kaçış karelerini tek tek kapat.";
  }

  if (has("tehlike", "risk", "kaybed", "korum")) {
    const mine = hangingPieces(chess, chess.turnColor());
    if (mine.length === 0) return "Şu anda korumasız taşın yok, aferin! Yine de her hamleden sonra tekrar kontrol et.";
    const list = mine.map((piece) => `${piece.square.toUpperCase()} (${piece.name})`).join(", ");
    return `Şu taşların korumasız: ${list}. Satrançta altın kural: hamle yapmadan önce "rakip beni nerede yakalayabilir?" diye sor.`;
  }

  if (has("açılış", "acilis", "başla")) {
    return "Açılışta üç işi yap: (1) merkezi bir piyonla tut, (2) atlarını ve fillerini çıkar, (3) rok yaparak şahını güvene al. Aynı taşı gereksiz yere tekrar tekrar oynama ve vezirini çok erken çıkarma.";
  }

  if (has("çatal", "catal")) {
    return "Çatal, tek taşın aynı anda iki hedefe saldırmasıdır. En sevileni at çatalıdır çünkü at taşların üzerinden atlar. Rakibin şahı ile veziri aynı 'at hamlesi' mesafesindeyse orada çatal arayabilirsin!";
  }

  if (has("rok")) {
    return "Rok, şahı güvene alan özel hamledir. Şah iki kare kaleye doğru gider, kale de şahın diğer yanına geçer. Şart: şah ve kale hiç oynamamış olmalı, araları boş olmalı ve şah tehdit altındaki karelerden geçmemeli.";
  }

  if (has("piyon")) {
    return "Piyon düz ilerler ama çapraz alır — bu en çok karıştırılan kuraldır! İlk hamlesinde iki kare gidebilir ve son yatağa ulaşırsa vezire terfi eder.";
  }

  if (has("değer", "deger", "puan", "hangi taş güçlü")) {
    return "Taş değerleri: piyon 1, at 3, fil 3, kale 5, vezir 9. Şahın değeri yoktur çünkü paha biçilemez. Bu sayılar takas yaparken 'kârlı mıyım?' sorusuna cevap verir.";
  }

  // GENEL dal EN SONA konur: "Açılışta ne YAPMALIyım?" sorusu hem "açılış" hem
  // "yapmal" içerir. Genel dal önce gelirse konuya özel cevap hiç çalışmaz —
  // üstelik uygulamanın kendi hazır soru düğmesi tam da bu cümleyi kullanıyor
  // ve çocuk açılış ilkeleri yerine hamle önerisi alıyordu.
  if (has("hamle", "oyna", "yapmal", "öner", "tavsiye", "fikir")) {
    const analysis = await coachPosition(chess);
    return analysis.bestSan
      ? `Ben ${sanTr(analysis.bestSan)} oynardım. ${analysis.observations.find((item) => item.kind === "tip")?.text || ""}`
      : "Bu konumda oynanacak hamle kalmamış görünüyor.";
  }

  // Anahtar kelime yoksa konum hakkında konuşuruz.
  const analysis = await coachPosition(chess);
  const primary = analysis.observations[0];
  return `${primary ? primary.text : analysis.summary} Başka bir şey merak edersen "en iyi hamle ne?", "tehlikede miyim?" ya da "açılışta ne yapmalıyım?" diye sorabilirsin.`;
}
