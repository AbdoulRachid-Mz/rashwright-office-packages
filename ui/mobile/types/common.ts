export type ID = string;

export type DateTime = string;

export type Currency = "XOF" | "EUR" | "USD";

export type SortOrder = "asc" | "desc";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface BaseEntity {
  id: ID;
  createdAt: DateTime;
  updatedAt: DateTime;
}
