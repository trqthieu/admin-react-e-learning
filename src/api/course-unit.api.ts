import { httpApi } from '@app/api/http.api';
import { CourseSectionResponse } from './course-section.api';
import { DeletedResponse, PaginationRequest, PaginationResponse, UpdatedResponse } from './pagination.api';
export interface AddCourseUnitRequest {
  title: string;
  description: string;
  order: number;
  courseSectionId: number;
}

export interface CourseUnitResponse {
  id: number;
  title: string;
  description: string;
  order: number;
  courseSection: CourseSectionResponse;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addCourseUnit = (addCourseUnitPayload: AddCourseUnitRequest): Promise<CourseUnitResponse> =>
  httpApi.post<CourseUnitResponse>('course-units', { ...addCourseUnitPayload }).then((res) => {
    return res?.data;
  });
interface GetCourseUnitRequest extends PaginationRequest {
  courseSectionId: number;
}
interface OrderCourseUnitRequest {
  activeId: number;
  overId: number;
}
export const getCourseUnits = (
  getCourseUnitRequest: GetCourseUnitRequest,
): Promise<PaginationResponse<CourseUnitResponse>> =>
  httpApi
    .get<PaginationResponse<CourseUnitResponse>>('course-units', {
      params: { ...getCourseUnitRequest },
    })
    .then((res) => {
      return res?.data;
    });

export const changeOrderCourseUnits = (orderCourseUnitRequest: OrderCourseUnitRequest): Promise<UpdatedResponse> =>
  httpApi.post<UpdatedResponse>('course-units/changeOrder', { ...orderCourseUnitRequest }).then((res) => {
    return res?.data;
  });

export const deleteCourseUnit = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`course-units/${id}`).then((res) => {
    return res?.data;
  });

export const getCourseUnit = (id: number): Promise<CourseUnitResponse> =>
  httpApi.get<CourseUnitResponse>(`course-units/${id}`).then((res) => {
    return res?.data;
  });

export const updateCourseUnit = (id: number, coursePayload: AddCourseUnitRequest): Promise<CourseUnitResponse> =>
  httpApi.patch<CourseUnitResponse>(`course-units/${id}`, { ...coursePayload }).then((res) => {
    return res?.data;
  });
