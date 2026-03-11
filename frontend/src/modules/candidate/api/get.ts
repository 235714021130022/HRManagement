import { useQuery, keepPreviousData, type UseQueryOptions } from "@tanstack/react-query";
import { URL_API_CANDIDATE } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { ICandidate } from "../types";

export type ICandidateData = ICandidate;
export type Pagination = {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number
}
export type GetCandidateParams = {
    pages?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | string;
}

export type GetCandidateResponse = {
    data: ICandidate[];
    pagination: Pagination
}

export const getAllCandidate = async (
    params: GetCandidateParams
): Promise<GetCandidateResponse> => {
    const res = await apiClient.get(URL_API_CANDIDATE, {params});
        const raw =
            res.data?.data && !Array.isArray(res.data.data)
                ? res.data.data
                : res.data;

    const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

    const totalItems = raw?.total_items ?? list.length ?? 0;
    const currentPage = raw?.current_pages ?? raw?.current_page ?? params.pages ?? 1;
    const limit = raw?.total_per_page ?? params.limit ?? 10;
    const totalPages = raw?.total_pages ?? Math.ceil(totalItems / limit);

    return {
        data: list,
        pagination: {
            totalItems, totalPages, currentPage, limit
        }
        
    }
}

export const useGetCandidate = (
    params: GetCandidateParams,
    config?: Omit<
    UseQueryOptions<GetCandidateResponse, Error, GetCandidateResponse, [string, GetCandidateParams]>,
    "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: ["candidate", params],
        queryFn: () => getAllCandidate(params),
        placeholderData: keepPreviousData,
        ...config
    })
}

export const getCandidateByID = async (id: string): Promise<ICandidateData> => {
    const res = await apiClient.get(`${URL_API_CANDIDATE}/${id}`);
    const payload = res.data?.data ?? res.data;

    const raw = payload?.data ?? payload;
    if(!raw) throw new Error('Candidate not found');
    return raw as ICandidateData
}

export const useCandidateByID = (
    id: string,
    config?: Omit<
    UseQueryOptions<ICandidateData, Error, ICandidateData, [string, string]>,
    "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: ['candidate', id],
        enabled: !!id,
        queryFn: () => getCandidateByID(id),
        ...config
    })
}

