import { httpApi } from '@app/api/http.api';
import { CourseExerciseResponse } from './course-exercise.api';
import { DeletedResponse, PaginationRequest, PaginationResponse, UpdatedResponse } from './pagination.api';
export interface AddQuestionSelectRequest {
  id?: number;
  key: string;
  isCorrect: boolean;
  order: number;
}
export interface QuestionSelectResponse {
  id: number;
  key: string;
  isCorrect: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
export interface AddQuestionRequest {
  title: string;
  name?: string;
  description?: string;
  order: number;
  content: string;
  video?: string;
  image?: string;
  audio?: string;
  answerType: string;
  questionType: string;
  attachments?: string[];
  exerciseId?: number;
  examId?: number;
  selections?: AddQuestionSelectRequest[];
}

export interface QuestionResponse {
  id: number;
  title: string;
  name: string;
  description: string;
  order: number;
  content: string;
  video: string;
  image: string;
  audio: string;
  answerType: string;
  questionType: string;
  attachments: string[];
  exercise: CourseExerciseResponse;
  //   examId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  questionSelects: QuestionSelectResponse[];
}

export const addQuestion = (addQuestionPayload: AddQuestionRequest): Promise<QuestionResponse> =>
  httpApi.post<QuestionResponse>('questions', { ...addQuestionPayload }).then((res) => {
    return res?.data;
  });
interface GetQuestionRequest extends PaginationRequest {
  exerciseId: number;
}
interface OrderQuestionRequest {
  activeId: number;
  overId: number;
}
export const getQuestions = (getQuestionRequest: GetQuestionRequest): Promise<PaginationResponse<QuestionResponse>> =>
  httpApi
    .get<PaginationResponse<QuestionResponse>>('questions', {
      params: { ...getQuestionRequest },
    })
    .then((res) => {
      return res?.data;
    });

export const changeOrderQuestions = (orderQuestionRequest: OrderQuestionRequest): Promise<UpdatedResponse> =>
  httpApi.post<UpdatedResponse>('questions/changeOrder', { ...orderQuestionRequest }).then((res) => {
    return res?.data;
  });

export const deleteQuestion = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`questions/${id}`).then((res) => {
    return res?.data;
  });

export const getQuestion = (id: number): Promise<QuestionResponse> =>
  httpApi.get<QuestionResponse>(`questions/${id}`).then((res) => {
    return res?.data;
  });

export const updateQuestion = (id: number, coursePayload: AddQuestionRequest): Promise<QuestionResponse> =>
  httpApi.patch<QuestionResponse>(`questions/${id}`, { ...coursePayload }).then((res) => {
    return res?.data;
  });
