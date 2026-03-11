import { useQuery, keepPreviousData, type UseQueryOptions } from "@tanstack/react-query";
import { URL_API_ROLE } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { IRole } from "../types";

export type Pagination = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

export type GetRoleParams = {
  pages?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
};

export type GetRoleResponse = {
  data: IRole[];
  pagination: Pagination;
};

export const getAllRole = async (params: GetRoleParams): Promise<GetRoleResponse> => {
  const res = await apiClient.get(URL_API_ROLE, { params });

  const raw =
    res.data?.data && !Array.isArray(res.data.data)
      ? res.data.data
      : res.data;

  // list: backend có thể trả { data: [...] } hoặc trả thẳng [...]
  const list: IRole[] =
    Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

  const totalItems = raw?.total_items ?? list.length ?? 0;
  const currentPage = raw?.current_page ?? params.pages ?? 1; // ✅ FIX
  const limit = raw?.total_per_page ?? raw?.items_per_page ?? params.limit ?? 10;
  const totalPages = raw?.total_pages ?? Math.ceil(totalItems / limit);

  return {
    data: list,
    pagination: { totalItems, totalPages, currentPage, limit },
  };
};

export const useGetRoles = (
  params: GetRoleParams = { pages: 1, limit: 100 },
  config?: Omit<
    UseQueryOptions<GetRoleResponse, Error, GetRoleResponse, [string, GetRoleParams]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => getAllRole(params),
    placeholderData: keepPreviousData,
    ...config,
  });
};