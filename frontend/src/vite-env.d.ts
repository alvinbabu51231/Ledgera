/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: string;
    openWhatsApp: (nativeUrl: string, webUrl: string) => Promise<'desktop' | 'web'>;
  };
}
