import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_CANDIDATE } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { ICandidateData } from "./get";
                                // biến all field thành optional
export type CandidateUpdateDTO = Partial<ICandidateData>;
interface UpdateCandidateResponse {
    data: ICandidateData;
    count: number;
    error: boolean;
    message: string;
}

const updateCandidate = async(id: string, data: CandidateUpdateDTO): Promise<UpdateCandidateResponse> => {
    const res = await apiClient.put(`${URL_API_CANDIDATE}/${id}`, data);
    return res.data;
}

type updateCandidateMutaionOptions = Omit< // lấy 1 type, bỏ 1 thuộc tính khỏi type      // TVaribales: mutate truyền gì vào: kiểu của “tham số đầu vào” của mutation.
    UseMutationOptions<UpdateCandidateResponse, Error, {id: string, data: CandidateUpdateDTO}>,
    'onSuccess' 
> & {
    onSuccess?: (
        data: UpdateCandidateResponse,
        variables: {id: string; data: CandidateUpdateDTO},
        context: unknown
    ) => void;
}

export const useupdateCandidate = (config?: updateCandidateMutaionOptions) => {
    const queryClient = useQueryClient();
    const { onSuccess, ...restConfig } = config || {};

    return useMutation({
        ...restConfig,
        mutationFn: ({ id, data}) => updateCandidate(id, data),
        onSuccess: (data, variables, _onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: ['candidate']});
            queryClient.invalidateQueries({ queryKey: ['candidate-audit-logs', variables.id] });
            onSuccess?.(data, variables, context);
        },
    })
}