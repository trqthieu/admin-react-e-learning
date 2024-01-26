enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
export interface PaginationRequest {
  order?: Order;
  page?: number;
  take?: number;
}

export interface MetaPaginationResponse {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  take: number;
  totalItem: number;
  totalPage: number;
}

export interface PaginationResponse<T> {
  data: T[];
  meta: MetaPaginationResponse;
}

export interface DeletedResponse {
  affected: number;
}
