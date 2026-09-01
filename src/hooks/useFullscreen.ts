// src/hooks/useFullscreen.ts — Tam ekran (Fullscreen API) yardımcısı
// Tarayıcı tam ekran durumunu izler ve aç/kapat (toggle) fonksiyonu döner.
// Safari/eski WebKit için ön ekli (webkit*) API'ler de desteklenir.
import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface FullscreenDocument extends Document {
    webkitFullscreenElement?: Element | null;
    webkitFullscreenEnabled?: boolean;
    webkitExitFullscreen?: () => Promise<void> | void;
}

interface FullscreenElement extends HTMLElement {
    webkitRequestFullscreen?: () => Promise<void> | void;
}

function getFullscreenElement(): Element | null {
    const doc = document as FullscreenDocument;
    return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function isFullscreenEnabled(): boolean {
    const doc = document as FullscreenDocument;
    return Boolean(doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled);
}

// Dokunmatik olmayan, fare ile kullanılan geniş ekranlar = bilgisayar.
const DESKTOP_QUERY = '(min-width: 900px) and (pointer: fine)';

export function useFullscreen(target?: RefObject<HTMLElement>) {
    const [isFullscreen, setIsFullscreen] = useState(() => !!getFullscreenElement());
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
    );

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!getFullscreenElement());
        document.addEventListener('fullscreenchange', onChange);
        document.addEventListener('webkitfullscreenchange', onChange);
        return () => {
            document.removeEventListener('fullscreenchange', onChange);
            document.removeEventListener('webkitfullscreenchange', onChange);
        };
    }, []);

    useEffect(() => {
        const mql = window.matchMedia(DESKTOP_QUERY);
        const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    const enter = useCallback(async () => {
        const el = (target?.current || document.documentElement) as FullscreenElement;
        try {
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        } catch {
            // Tarayıcı izin vermezse (ör. kullanıcı hareketi olmadan) sessizce yoksay.
        }
    }, [target]);

    const exit = useCallback(async () => {
        const doc = document as FullscreenDocument;
        try {
            if (doc.exitFullscreen) await doc.exitFullscreen();
            else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        } catch {
            // Yoksay.
        }
    }, []);

    const toggle = useCallback(() => {
        if (getFullscreenElement()) void exit();
        else void enter();
    }, [enter, exit]);

    return {
        isFullscreen,
        // Yalnızca bilgisayarda ve tarayıcı destekliyorsa seçeneği göster.
        isSupported: isDesktop && isFullscreenEnabled(),
        enter,
        exit,
        toggle,
    };
}
