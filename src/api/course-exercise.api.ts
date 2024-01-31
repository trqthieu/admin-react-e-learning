import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse, UpdatedResponse } from './pagination.api';
import { CourseUnitResponse } from './course-unit.api';
export interface AddCourseExerciseRequest {
  title: string;
  description: string;
  order: number;
  content: string;
  video: string;
  banner: string;
  attachments: string[];
  courseUnitId: number;
}

export interface CourseExerciseResponse {
  id: number;
  title: string;
  description: string;
  order: number;
  content: string;
  video: string;
  banner: string;
  attachments: string[];
  courseUnit: CourseUnitResponse;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addCourseExercise = (
  addCourseExercisePayload: AddCourseExerciseRequest,
): Promise<CourseExerciseResponse> =>
  httpApi.post<CourseExerciseResponse>('exercises', { ...addCourseExercisePayload }).then((res) => {
    return res?.data;
  });
interface GetCourseExerciseRequest extends PaginationRequest {
  courseUnitId: number;
}
interface OrderCourseExerciseRequest {
  activeId: number;
  overId: number;
}
export const getCourseExercises = (
  getCourseExerciseRequest: GetCourseExerciseRequest,
): Promise<PaginationResponse<CourseExerciseResponse>> =>
  httpApi
    .get<PaginationResponse<CourseExerciseResponse>>('exercises', {
      params: { ...getCourseExerciseRequest },
    })
    .then((res) => {
      return res?.data;
    });

export const changeOrderCourseExercises = (
  orderCourseExerciseRequest: OrderCourseExerciseRequest,
): Promise<UpdatedResponse> =>
  httpApi.post<UpdatedResponse>('exercises/changeOrder', { ...orderCourseExerciseRequest }).then((res) => {
    return res?.data;
  });

export const deleteCourseExercise = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`exercises/${id}`).then((res) => {
    return res?.data;
  });

export const getCourseExercise = (id: number): Promise<CourseExerciseResponse> =>
  httpApi.get<CourseExerciseResponse>(`exercises/${id}`).then((res) => {
    return res?.data;
  });

export const updateCourseExercise = (
  id: number,
  coursePayload: AddCourseExerciseRequest,
): Promise<CourseExerciseResponse> =>
  httpApi.patch<CourseExerciseResponse>(`exercises/${id}`, { ...coursePayload }).then((res) => {
    return res?.data;
  });
