import * as React from 'react';

export interface ServerStyleContextData {
  css: string;
  ids: Array<string>;
  key: string;
}

export const ServerStyleContext = React.createContext<ServerStyleContextData[] | null>(null);

export interface ClientStyleContextData {
  reset: () => void;
}

export const ClientStyleContext = React.createContext<ClientStyleContextData | null>(null);
