import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse, UpdatedResponse } from './pagination.api';
import { CourseUnitResponse } from './course-unit.api';
export interface AddCourseLessonRequest {
  title: string;
  description: string;
  order: number;
  content: string;
  video: string;
  banner: string;
  attachments: string[];
  courseUnitId: number;
}

export interface CourseLessonResponse {
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

export const addCourseLesson = (addCourseLessonPayload: AddCourseLessonRequest): Promise<CourseLessonResponse> =>
  httpApi.post<CourseLessonResponse>('lessons', { ...addCourseLessonPayload }).then((res) => {
    return res?.data;
  });
interface GetCourseLessonRequest extends PaginationRequest {
  courseUnitId: number;
}
interface OrderCourseLessonRequest {
  activeId: number;
  overId: number;
}
export const getCourseLessons = (
  getCourseLessonRequest: GetCourseLessonRequest,
): Promise<PaginationResponse<CourseLessonResponse>> =>
  httpApi
    .get<PaginationResponse<CourseLessonResponse>>('lessons', {
      params: { ...getCourseLessonRequest },
    })
    .then((res) => {
      return res?.data;
    });

export const changeOrderCourseLessons = (
  orderCourseLessonRequest: OrderCourseLessonRequest,
): Promise<UpdatedResponse> =>
  httpApi.post<UpdatedResponse>('lessons/changeOrder', { ...orderCourseLessonRequest }).then((res) => {
    return res?.data;
  });

export const deleteCourseLesson = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`lessons/${id}`).then((res) => {
    return res?.data;
  });

export const getCourseLesson = (id: number): Promise<CourseLessonResponse> =>
  httpApi.get<CourseLessonResponse>(`lessons/${id}`).then((res) => {
    return res?.data;
  });

export const updateCourseLesson = (id: number, coursePayload: AddCourseLessonRequest): Promise<CourseLessonResponse> =>
  httpApi.patch<CourseLessonResponse>(`lessons/${id}`, { ...coursePayload }).then((res) => {
    return res?.data;
  });
