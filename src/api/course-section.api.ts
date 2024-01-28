import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse } from './pagination.api';
import { CourseResponse } from './courses.api';
export interface AddCourseSectionRequest {
  title: string;
  description: string;
  order: number;
  courseId: number;
}

export interface CourseSectionResponse {
  id: number;
  title: string;
  description: string;
  order: number;
  course: CourseResponse;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addCourseSection = (addCourseSectionPayload: AddCourseSectionRequest): Promise<CourseSectionResponse> =>
  httpApi.post<CourseSectionResponse>('course-sections', { ...addCourseSectionPayload }).then((res) => {
    return res?.data;
  });

export const getCourseSections = (
  paginationPayload: PaginationRequest,
): Promise<PaginationResponse<CourseSectionResponse>> =>
  httpApi
    .get<PaginationResponse<CourseSectionResponse>>('course-sections', {
      params: { ...paginationPayload },
    })
    .then((res) => {
      return res?.data;
    });

export const deleteCourseSection = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`course-sections/${id}`).then((res) => {
    return res?.data;
  });

export const getCourseSection = (id: number): Promise<CourseSectionResponse> =>
  httpApi.get<CourseSectionResponse>(`course-sections/${id}`).then((res) => {
    return res?.data;
  });

export const updateCourseSection = (
  id: number,
  coursePayload: AddCourseSectionRequest,
): Promise<CourseSectionResponse> =>
  httpApi.patch<CourseSectionResponse>(`course-sections/${id}`, { ...coursePayload }).then((res) => {
    return res?.data;
  });
