import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { URL_API_EMPLOYEE, URL_API_RECRUITEMENT_INFOR } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { IRecruitmentInfor } from "../types";

export type IRecInformData = IRecruitmentInfor;
export type Pagination = {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number
}

export type GetRecInfromParams = {
    pages?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | string;
}

export type GetRecInformResponse = {
    data: IRecruitmentInfor[];
    pagination: Pagination
}

export const getAllRecInform = async (params: GetRecInfromParams) => {
  const res = await apiClient.get(URL_API_RECRUITEMENT_INFOR, {
    params: {
      pages: params.pages,
      items_per_pages: params.limit, // IMPORTANT: map đúng tên backend
      search: params.search,
    },
  });

  const raw = res.data;
  const list = Array.isArray(raw?.data) ? raw.data : [];

  const totalItems = raw?.total_items ?? 0;
  const currentPage = raw?.current_pages ?? 1;
  const limit = raw?.items_per_pages ?? (params.limit ?? 10);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: list,
    pagination: { totalItems, totalPages, currentPage, limit },
  };
};
export const useGetInform = (
    params: GetRecInfromParams,
    config?: Omit<
    UseQueryOptions<GetRecInformResponse, Error, GetRecInformResponse, [string, GetRecInfromParams]>,
    "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: ['recinform', params],
        queryFn: () => getAllRecInform(params),
        placeholderData: keepPreviousData,
        ...config
    })
}

export const getRecInformByID = async (id: string) => {
  const res = await apiClient.get(`${URL_API_RECRUITEMENT_INFOR}/${id}`);
  const raw = res.data;

  if (!raw) throw new Error("Recinform not found");
  return raw;
};

export const useRecInformID = (
    id: string,
    config?: Omit<
    UseQueryOptions<IRecInformData, Error, IRecInformData, [string, string]>,
    "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: ['recinform', id],
        enabled: !!id,
        queryFn: () => getRecInformByID(id),
        ...config
    })
}