import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse } from './pagination.api';
import { UserResponse } from './users.api';
export interface AddCourseGroupRequest {
  name: string;
  description: string;
  authorId: number;
}

export interface CourseGroupResponse {
  id: number;
  name: string;
  description: string;
  author: UserResponse;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addCourseGroup = (addCourseGroupPayload: AddCourseGroupRequest): Promise<CourseGroupResponse> =>
  httpApi.post<CourseGroupResponse>('course-group', { ...addCourseGroupPayload }).then((res) => {
    return res?.data;
  });

export const getCourseGroups = (
  paginationPayload: PaginationRequest,
): Promise<PaginationResponse<CourseGroupResponse>> =>
  httpApi
    .get<PaginationResponse<CourseGroupResponse>>('course-group', {
      params: { ...paginationPayload },
    })
    .then((res) => {
      return res?.data;
    });

export const deleteCourseGroup = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`course-group/${id}`).then((res) => {
    return res?.data;
  });

export const getCourseGroup = (id: number): Promise<CourseGroupResponse> =>
  httpApi.get<CourseGroupResponse>(`course-group/${id}`).then((res) => {
    return res?.data;
  });

export const updateCourseGroup = (id: number, userPayload: AddCourseGroupRequest): Promise<CourseGroupResponse> =>
  httpApi.patch<CourseGroupResponse>(`course-group/${id}`, { ...userPayload }).then((res) => {
    return res?.data;
  });
