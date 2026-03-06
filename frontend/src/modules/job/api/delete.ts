import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_JOBS } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { IJob } from "../types";

export const deleteJob = async (id: string): Promise<IJob> => {
	const res = await apiClient.delete(`${URL_API_JOBS}/${id}`);
	const payload = res.data?.data ?? res.data;
	const raw = payload?.data ?? payload;
	return raw as IJob;
};

type UseDeleteJobOptions = {
	config?: MutationConfig<typeof deleteJob>;
};

export const useDeleteJob = ({ config }: UseDeleteJobOptions = {}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteJob,
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			queryClient.removeQueries({ queryKey: ["jobs", id] });
		},
		...config,
	});
};
