import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse } from './pagination.api';
export interface AddUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  EXP: number;
  role: string;
  isVerify: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  EXP: number;
  avatar?: string;
  role: string;
  isVerify: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addUser = (addUserPayload: AddUserRequest): Promise<UserResponse> =>
  httpApi.post<UserResponse>('users', { ...addUserPayload }).then((res) => {
    return res?.data;
  });

export const getUsers = (paginationPayload: PaginationRequest): Promise<PaginationResponse<UserResponse>> =>
  httpApi
    .get<PaginationResponse<UserResponse>>('users', {
      params: { ...paginationPayload },
    })
    .then((res) => {
      return res?.data;
    });

export const deleteUser = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`users/${id}`).then((res) => {
    return res?.data;
  });
