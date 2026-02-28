export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface AmountDTO {
  amount: number;
}

export interface CountDTO {
  label: string;
  count: number;
}

export interface ExistsDTO {
  identifier: string;
  exists: boolean;
}

export interface ResponseDTO<T> {
  error: boolean;
  content: T;
}

