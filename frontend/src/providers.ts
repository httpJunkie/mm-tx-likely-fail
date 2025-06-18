// src/providers.ts

export interface EIP6963ProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

export interface EIP1193Provider {
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  send?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  request: (request: {
    method: string;
    params?: Array<unknown>;
  }) => Promise<unknown>;
}

// Simplified provider detection function
export function detectProviders(): Promise<EIP6963ProviderDetail[]> {
  return new Promise((resolve) => {
    const providers: EIP6963ProviderDetail[] = [];
    
    // Listen for provider announcements
    const handleProvider = (event: CustomEvent) => {
      const { info, provider } = event.detail;
      providers.push({ info, provider });
    };

    window.addEventListener('eip6963:announceProvider', handleProvider as EventListener);
    
    // Request providers
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    
    // Give providers time to announce themselves
    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', handleProvider as EventListener);
      resolve(providers);
    }, 100);
  });
}