import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_CANDIDATE } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { ICandidate } from "../types";

export const createCandidate = async (data: ICandidate): Promise<any> => {
    const res = await apiClient.post(URL_API_CANDIDATE, data);
    return res.data.data;
}

type UseCreateCandidateOptions = {
    config?: MutationConfig<typeof createCandidate>;
}

export const useCreateCandidate = ({config}: UseCreateCandidateOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCandidate,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['candidate']})
        },
        ...config
    })
}

