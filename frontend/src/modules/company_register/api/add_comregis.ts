import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_COMPANY_REGISTER } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ICompanyRegistrationRequest } from "../types";

export const createCompanyRegister = async (data: ICompanyRegistrationRequest): Promise<any> => {
    const res = await apiClient.post(URL_API_COMPANY_REGISTER, data);
    return res.data.data;
}

type UseCreateCompanyRegisterOptions = {
    config?: MutationConfig<typeof createCompanyRegister>;
}

export const useCreateCompanyRegister = ({config}: UseCreateCompanyRegisterOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCompanyRegister,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-register']})
        },
        ...config
    })
}