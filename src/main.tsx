import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastProvider';
import { ConfirmDialogProvider } from './components/common/ConfirmDialog';
import { PromptDialogProvider } from './components/common/PromptDialog';

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
                        <App />
                    </PromptDialogProvider>
                </ConfirmDialogProvider>
            </ToastProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
