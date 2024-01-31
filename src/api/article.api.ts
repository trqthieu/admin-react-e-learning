import { httpApi } from '@app/api/http.api';
import { DeletedResponse, PaginationRequest, PaginationResponse } from './pagination.api';
import { UserResponse } from './users.api';
export interface AddArticleRequest {
  title: string;
  tags: string[];
  banner: string;
  video: string;
  content: string;
  authorId: number;
}

export interface ArticleResponse {
  id: number;
  title: string;
  tags: string[];
  banner: string;
  video: string;
  content: string;
  author: UserResponse;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const addArticle = (addArticlePayload: AddArticleRequest): Promise<ArticleResponse> =>
  httpApi.post<ArticleResponse>('articles', { ...addArticlePayload }).then((res) => {
    return res?.data;
  });

export const getArticles = (paginationPayload: PaginationRequest): Promise<PaginationResponse<ArticleResponse>> =>
  httpApi
    .get<PaginationResponse<ArticleResponse>>('articles', {
      params: { ...paginationPayload },
    })
    .then((res) => {
      return res?.data;
    });

export const deleteArticle = (id: number): Promise<DeletedResponse> =>
  httpApi.delete<DeletedResponse>(`articles/${id}`).then((res) => {
    return res?.data;
  });

export const getArticle = (id: number): Promise<ArticleResponse> =>
  httpApi.get<ArticleResponse>(`articles/${id}`).then((res) => {
    return res?.data;
  });

export const updateArticle = (id: number, articlePayload: AddArticleRequest): Promise<ArticleResponse> =>
  httpApi.patch<ArticleResponse>(`articles/${id}`, { ...articlePayload }).then((res) => {
    return res?.data;
  });
