// src/components/chess/ChessPiece.tsx — Taş çizimi
// Taşların vektör çizimi satranç uygulamasından gelir (src/lib/chess/engine).
// Orası düz DOM ile çalıştığı için çizimi işaretleme dizesi olarak verir;
// burada tek bir yerde React'e bağlanır.
import { useMemo } from 'react';
import { pieceSvg } from '../../lib/chess/engine/PieceGlyph';
import type { PieceColor, PieceType } from '../../lib/chess/engine/Chess';

interface ChessPieceProps {
    type: PieceType;
    color: PieceColor;
    className?: string;
}

export function ChessPiece({ type, color, className }: ChessPieceProps) {
    const markup = useMemo(() => pieceSvg(type, color), [type, color]);
    return (
        <span
            className={className}
            aria-hidden="true"
            // Çizim kendi kodumuzdan gelir; kullanıcı girdisi içermez.
            dangerouslySetInnerHTML={{ __html: markup }}
        />
    );
}
