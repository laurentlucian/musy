export type NumberString = number | string;
export type BooleanString = boolean | string;
export type TypeOrArrayOf<T> = T | T[];
export type PromiseOrType<T> = T | Promise<T>;

export interface ExternalUrls {
  spotify?: string;
}

export interface Copyright {
  text?: string;
  type?: string;
}

export interface ExternalIds {
  upc?: string;
  ean?: string;
  isrc?: string;
}

export interface Image {
  height: number | null;
  url: string;
  width: number | null;
}

export interface Followers {
  href: string | null;
  total: number;
}
export interface Restrictions {
  reason?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface OptionalParams {
  market?: string;
}

export interface ResumePoint {
  fully_played?: boolean;
  resume_position_ms?: number;
}

export interface CursorProps {
  after?: string;
  before?: string;
}

export type RequestQuery = Record<
  string,
  string | number | boolean | string[] | undefined
>;

export interface PaginationResponseProps {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface PageResult<T> extends PaginationResponseProps {
  items: T[];
}
