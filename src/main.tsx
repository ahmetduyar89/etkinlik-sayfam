import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastProvider';
import { ConfirmDialogProvider } from './components/common/ConfirmDialog';
import { PromptDialogProvider } from './components/common/PromptDialog';
import { PasswordGate } from './components/common/PasswordGate';
import { listenForInstallPrompt, registerServiceWorker } from './lib/pwa';

// Uygulama olarak kurulum istemi + otomatik güncelleme (service worker)
listenForInstallPrompt();
registerServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root elementi bulunamadı.');
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ToastProvider>
                <ConfirmDialogProvider>
                    <PromptDialogProvider>
                        <PasswordGate>
                            <App />
                        </PasswordGate>
                    </PromptDialogProvider>
                </ConfirmDialogProvider>
            </ToastProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
