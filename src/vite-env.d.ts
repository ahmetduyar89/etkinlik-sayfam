/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
    /** Giriş şifresi (isteğe bağlı; tanımlı değilse varsayılan kullanılır). */
    readonly VITE_APP_PASSWORD?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module 'qrcode.react' {
    import React from 'react';
    export interface QRCodeProps {
        value: string;
        size?: number;
        level?: string;
        bgColor?: string;
        fgColor?: string;
        className?: string;
        includeMargin?: boolean;
    }
    export const QRCodeSVG: React.FC<QRCodeProps>;
    export const QRCodeCanvas: React.FC<QRCodeProps>;
}
