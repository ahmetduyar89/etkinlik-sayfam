import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface IconButtonProps {
    icon: LucideIcon;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    title?: string;
    'aria-label'?: string;
}

export function IconButton({
    icon: Icon,
    onClick,
    className,
    title,
    'aria-label': ariaLabel,
}: IconButtonProps) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
            }}
            title={title}
            aria-label={ariaLabel || title}
            className={cn(
                'p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all active:scale-95 group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50',
                className
            )}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}
