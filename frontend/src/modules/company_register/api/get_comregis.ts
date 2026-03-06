import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { URL_API_COMPANY_REGISTER } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { ICompanyRegistrationRequest } from "../types";

export type ICompanyRegister = ICompanyRegistrationRequest;
export type Pagination = {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

export type GetCompaniesRegisterParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | string;
}

export type GetCompaniesRegisterResponse = {
    data: ICompanyRegister[];
    pagination: Pagination
}

export const getAllComRegister = async (
    params: GetCompaniesRegisterParams
): Promise<GetCompaniesRegisterResponse> => {
    const res = await apiClient.get(URL_API_COMPANY_REGISTER, {params});
    const raw = res.data?.data ?? res.data;

    const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

    const totalItems = raw?.total_items ?? list.length ?? 0;
    const currentPage = raw?.current_page ?? params.limit ?? 1;
    const limit = raw?.total_per_page ?? params.limit ?? 10;
    const totalPages = raw?.total_pages ?? Math.ceil(totalItems / limit);

    return {
        data: list,
        pagination: {
            totalItems, totalPages, currentPage, limit
        }
        
    }
}

export const useGetCompanyRegister = (
    params: GetCompaniesRegisterParams,
    config?: Omit<
    UseQueryOptions<GetCompaniesRegisterResponse, Error, GetCompaniesRegisterResponse, [string, GetCompaniesRegisterParams]>,
    "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: ["company-register", params],
        queryFn: () => getAllComRegister(params),
        placeholderData: keepPreviousData,
        ...config
    })
}

export const getComRegisterByID = async (id: string): Promise<ICompanyRegister> => {
    const res = await apiClient.get(`${URL_API_COMPANY_REGISTER}/${id}`);
    const payload = res.data?.data ?? res.data;

    const raw = payload?.data ?? payload;
    if(!raw) throw new Error('Company register not found');
    return raw as ICompanyRegister
}

export const useGetComRegisterByID = (
    id: string,
    config?: Omit<
    UseQueryOptions<ICompanyRegister, Error, ICompanyRegister, [string, string]>,
    "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: ['company-register', id],
        enabled: !!id,
        ...config
    })
}