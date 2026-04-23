interface SpotlightOverlayProps {
    pos: { x: number; y: number };
    radius: number;
}

export function SpotlightOverlay({ pos, radius }: SpotlightOverlayProps) {
    return (
        <div
            aria-hidden="true"
            className="absolute inset-0 z-[3900] pointer-events-none select-none"
            style={{
                background: `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 35%, rgba(0,0,0,0.84) 100%)`,
            }}
        />
    );
}
