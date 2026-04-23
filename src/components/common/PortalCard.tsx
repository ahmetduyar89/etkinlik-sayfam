import React from 'react';
import { cn } from '../../utils/cn';

interface PortalCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function PortalCard({ children, className, onClick }: PortalCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn('portal-card overflow-hidden relative group', className)}
        >
            {children}
        </div>
    );
}
