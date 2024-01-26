import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse } from './pagination.api';
import { UserResponse } from './users.api';
import { CourseGroupResponse } from './course-group.api';
export interface AddCourseRequest {
  name: string;
  description: string[];
  target: string[];
  guideline: string;
  duration: 0;
  banner: string;
  level: string;
  status: string;
  teacherId: number;
  courseGroupId: number;
  category: string;
  price: number;
  discount: number;
  timeDiscountStart: string;
  timeDiscountEnd: string;
}

export interface CourseResponse {
  id: number;
  name: string;
  description: string[];
  target: string[];
  guideline: string;
  duration: number;
  banner: string;
  level: string;
  status: string;
  category: string;
  price: 0;
  discount: 0;
  timeDiscountStart: string;
  timeDiscountEnd: string;
  teacher: UserResponse;
  courseGroup: CourseGroupResponse;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addCourse = (addCoursePayload: AddCourseRequest): Promise<CourseResponse> =>
  httpApi.post<CourseResponse>('courses', { ...addCoursePayload }).then((res) => {
    return res?.data;
  });

export const getCourses = (paginationPayload: PaginationRequest): Promise<PaginationResponse<CourseResponse>> =>
  httpApi
    .get<PaginationResponse<CourseResponse>>('courses', {
      params: { ...paginationPayload },
    })
    .then((res) => {
      return res?.data;
    });

export const deleteCourse = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`courses/${id}`).then((res) => {
    return res?.data;
  });

export const getCourse = (id: number): Promise<CourseResponse> =>
  httpApi.get<CourseResponse>(`courses/${id}`).then((res) => {
    return res?.data;
  });

export const updateCourse = (id: number, coursePayload: AddCourseRequest): Promise<CourseResponse> =>
  httpApi.patch<CourseResponse>(`courses/${id}`, { ...coursePayload }).then((res) => {
    return res?.data;
  });
