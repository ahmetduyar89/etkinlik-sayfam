import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Uygulama hatası:', error, info);
    }

    handleReset = () => {
        this.setState({ error: null });
    };

    render() {
        if (this.state.error) {
            return (
                <div
                    role="alert"
                    className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 bg-slate-50 text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-black">
                        !
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h1 className="text-xl font-bold text-slate-800">
                            Beklenmeyen bir hata oluştu
                        </h1>
                        <p className="text-sm text-slate-500">
                            Uygulama, bu ekrandaki işlemi tamamlayamadı. Sayfayı yenilemeyi
                            veya tekrar denemeyi deneyebilirsiniz.
                        </p>
                        {this.state.error.message && (
                            <pre className="text-[11px] text-left bg-white border border-slate-200 rounded-lg p-3 overflow-auto max-h-40 text-slate-600">
                                {this.state.error.message}
                            </pre>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={this.handleReset}
                            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Tekrar dene
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-slate-200 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-300 transition-colors"
                        >
                            Sayfayı yenile
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
