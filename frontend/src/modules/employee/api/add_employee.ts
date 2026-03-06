import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_EMPLOYEE } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IEmployee } from "../types";

export const createEmployee = async (data: IEmployee): Promise<any> => {
    const res = await apiClient.post(URL_API_EMPLOYEE, data);
    return res.data.data;
}

type UseCreateEmployeeOptions = {
    config?: MutationConfig<typeof createEmployee>;
}

export const useCreateEmployee = ({config}: UseCreateEmployeeOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['employee']})
        },
        ...config
    })
}

