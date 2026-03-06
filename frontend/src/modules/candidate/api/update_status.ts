import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_APPLICATION } from "../../../constant/config";
import apiClient from "../../../lib/api";

export const APPLICATION_STATUS_STEPS = [
	{ value: "Applied", label: "Applied" },
	{ value: "Reviewing", label: "Reviewing" },
	{ value: "In Contact", label: "In Contact" },
	{ value: "Waiting Response", label: "Waiting Response" },
	{ value: "Closed", label: "Closed" },
] as const;

const EXTRA_STATUS_TO_INDEX: Record<string, number> = {
	"not suitable": 4,
};

const normalizeStatus = (value?: string) => {
	if (!value) return "";
	return value.trim().toLowerCase();
};

export const getApplicationStatusIndex = (status?: string) => {
	const normalized = normalizeStatus(status);
	if (!normalized) return -1;

	const fromSteps = APPLICATION_STATUS_STEPS.findIndex(
		(step) => normalizeStatus(step.value) === normalized,
	);

	if (fromSteps >= 0) return fromSteps;
	return EXTRA_STATUS_TO_INDEX[normalized] ?? -1;
};

export const getNextApplicationStatus = (status?: string) => {
	const currentIndex = getApplicationStatusIndex(status);
	if (currentIndex < 0) return APPLICATION_STATUS_STEPS[0].value;
	const nextIndex = Math.min(currentIndex + 1, APPLICATION_STATUS_STEPS.length - 1);
	return APPLICATION_STATUS_STEPS[nextIndex].value;
};

export const getPrevApplicationStatus = (status?: string) => {
	const currentIndex = getApplicationStatusIndex(status);
	if (currentIndex < 0) return APPLICATION_STATUS_STEPS[0].value;
	const prevIndex = Math.max(currentIndex - 1, 0);
	return APPLICATION_STATUS_STEPS[prevIndex].value;
};

export type UpdateApplicationStatusDTO = {
	status: string;
	note?: string;
};

interface UpdateApplicationStatusResponse {
	id: string;
	status: string;
	note?: string | null;
}

const updateApplicationStatus = async (
	id: string,
	data: UpdateApplicationStatusDTO,
): Promise<UpdateApplicationStatusResponse> => {
	const res = await apiClient.patch(`${URL_API_APPLICATION}/${id}/status`, data);
	return res.data;
};

type UpdateApplicationStatusMutationOptions = Omit<
	UseMutationOptions<UpdateApplicationStatusResponse, Error, { id: string; data: UpdateApplicationStatusDTO }>,
	"onSuccess"
> & {
	onSuccess?: (
		data: UpdateApplicationStatusResponse,
		variables: { id: string; data: UpdateApplicationStatusDTO },
		context: unknown,
	) => void;
};

export const useUpdateApplicationStatus = (config?: UpdateApplicationStatusMutationOptions) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }) => updateApplicationStatus(id, data),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["candidate"] });
			queryClient.invalidateQueries({ queryKey: ["application"] });
			config?.onSuccess?.(data, variables, context);
		},
		...config,
	});
};
