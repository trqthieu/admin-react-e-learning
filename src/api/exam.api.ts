import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse } from './pagination.api';
import { UserResponse } from './users.api';
export interface AddExamRequest {
  title: string;
  description: string;
  content: string;
  time: number;
  category: string;
  authorId: number;
}

export interface ExamResponse {
  id: number;
  title: string;
  description: string;
  time: number;
  content: string;
  category: string;
  author: UserResponse;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addExam = (addExamPayload: AddExamRequest): Promise<ExamResponse> =>
  httpApi.post<ExamResponse>('exams', { ...addExamPayload }).then((res) => {
    return res?.data;
  });

export const getExams = (paginationPayload: PaginationRequest): Promise<PaginationResponse<ExamResponse>> =>
  httpApi
    .get<PaginationResponse<ExamResponse>>('exams', {
      params: { ...paginationPayload },
    })
    .then((res) => {
      return res?.data;
    });

export const deleteExam = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`exams/${id}`).then((res) => {
    return res?.data;
  });

export const getExam = (id: number): Promise<ExamResponse> =>
  httpApi.get<ExamResponse>(`exams/${id}`).then((res) => {
    return res?.data;
  });

export const updateExam = (id: number, examPayload: AddExamRequest): Promise<ExamResponse> =>
  httpApi.patch<ExamResponse>(`exams/${id}`, { ...examPayload }).then((res) => {
    return res?.data;
  });
