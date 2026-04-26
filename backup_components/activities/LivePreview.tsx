import { memo } from 'react';
import { getFormattedHtml } from '../../utils/format-html';
import type { Activity } from '../../types';

interface LivePreviewProps {
    act: Activity;
}

function LivePreviewBase({ act }: LivePreviewProps) {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none bg-white overflow-hidden rounded-2xl">
            <iframe
                srcDoc={getFormattedHtml(act)}
                className="w-[1000px] h-[625px] border-0 origin-top-left scale-[0.28] sm:scale-[0.32] lg:scale-[0.35]"
                title={`${act.title} önizleme`}
                loading="lazy"
                sandbox="allow-scripts"
            />
            <div className="absolute inset-0 bg-transparent" />
        </div>
    );
}

export const LivePreview = memo(LivePreviewBase);
