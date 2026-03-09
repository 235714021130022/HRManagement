import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_INTERVIEW_SCHE } from "../../../constant/config";
import apiClient from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";

export interface CreateInterviewScheduleDto {
	interview_date?: string | null;
	interview_location?: string | null;
	interview_room?: string | null;
	time_duration: number;
	times?: string | null;
	meeting_link?: string | null;
	candidate_ids?: string[];
}

export const createInterviewSchedule = async (
	data: CreateInterviewScheduleDto,
): Promise<any> => {
	const res = await apiClient.post(URL_API_INTERVIEW_SCHE, data);
	return res.data?.data ?? res.data;
};

type UseCreateInterviewScheduleOptions = {
	config?: MutationConfig<typeof createInterviewSchedule>;
};

export const useCreateInterviewSchedule = (
	{ config }: UseCreateInterviewScheduleOptions = {},
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createInterviewSchedule,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interview-sche"] });
		},
		...config,
	});
};
