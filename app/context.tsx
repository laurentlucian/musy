import { createContext } from 'react';

export interface ServerStyleContextData {
  css: string;
  ids: Array<string>;
  key: string;
}

export const ServerStyleContext = createContext<ServerStyleContextData[] | null>(null);

export interface ClientStyleContextData {
  reset: () => void;
}
export const ClientStyleContext = createContext<ClientStyleContextData | null>(null);
