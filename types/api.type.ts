export interface ApiResponse<T = any> {
  data: T;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string | any[];
}

export interface QueryParams {
  offset?: number;
  limit?: number;
  sort?: string[][] | { [key: string]: 1 | -1 };
  where?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  select?: string[];
  populate?: string[];
  search?: string;
  data?: Record<string, unknown>;
  pagination?: boolean;
  timezone?: string;
  narrow_search?: string;
}
