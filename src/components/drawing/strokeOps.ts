// src/components/drawing/strokeOps.ts
// Ortak çizimin saf (yan etkisiz) çekirdeği: çizim kimlikleri ve uzak bir
// işlemin bir sayfaya nasıl uygulanacağı. Tuval bileşeni bunları kullanır;
// ayrı durmaları hem okunur hem de sınanabilir tutar.
import type { NotebookOp, Stroke } from '../../types';

let counter = 0;

/** Çizime benzersiz kimlik üretir (bir çizgiyi cihazlar arasında adlandırır). */
export const newStrokeId = (): string =>
    `${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Sayfadaki her çizimin benzersiz bir kimliği olmasını sağlar. Eski
 * kayıtlarda kimlik yoktur; piksel silgisi de bir çizgiyi kopyalayarak
 * bölebildiği için aynı kimlik iki kez görünebilir.
 */
export function withIds(strokes: Stroke[], seen = new Set<string>()): Stroke[] {
    return strokes.map((stroke) => {
        if (stroke.id && !seen.has(stroke.id)) {
            seen.add(stroke.id);
            return stroke;
        }
        const id = newStrokeId();
        seen.add(id);
        return { ...stroke, id };
    });
}

/**
 * Uzak bir işlemi sayfanın çizim listesine uygular ve yeni listeyi döner.
 * Değişiklik yoksa aynı liste döner (çağıran taraf bunu tazeleme yapmamak
 * için kullanır). Metin kutusu işlemleri burada değil, editörde işlenir.
 */
export function applyOpToStrokes(list: Stroke[], op: NotebookOp): Stroke[] {
    switch (op.type) {
        case 'add': {
            // Aynı işlem iki kez ulaşırsa çizim çiftlenmemeli.
            const existing = new Set(list.map((st) => st.id));
            const fresh = op.strokes.filter((st) => !st.id || !existing.has(st.id));
            return fresh.length ? [...list, ...fresh] : list;
        }
        case 'remove': {
            const gone = new Set(op.ids);
            const next = list.filter((st) => !st.id || !gone.has(st.id));
            return next.length === list.length ? list : next;
        }
        case 'update': {
            const patch = new Map(
                op.strokes.filter((st) => st.id).map((st) => [st.id as string, st])
            );
            if (patch.size === 0) return list;
            let changed = false;
            const next = list.map((st) => {
                const replacement = st.id ? patch.get(st.id) : undefined;
                if (!replacement) return st;
                changed = true;
                return replacement;
            });
            return changed ? next : list;
        }
        case 'page_set':
            return withIds(op.strokes);
        default:
            return list;
    }
}
