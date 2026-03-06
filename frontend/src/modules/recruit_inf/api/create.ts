import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_RECRUITEMENT_INFOR } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IRecruitmentInfor } from "../types";

export const createRecInform = async (data: IRecruitmentInfor): Promise<any> => {
    const res = await apiClient.post(URL_API_RECRUITEMENT_INFOR, data);
    return res.data.data;
}

type UseCreateRecInformOptions = {
    config?: MutationConfig<typeof createRecInform>;
}

export const useCreateRecInform = ({config}: UseCreateRecInformOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRecInform,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['recinform']})
        },
        ...config
    })
}