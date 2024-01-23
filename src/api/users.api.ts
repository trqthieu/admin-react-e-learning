import { httpApi } from '@app/api/http.api';
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
