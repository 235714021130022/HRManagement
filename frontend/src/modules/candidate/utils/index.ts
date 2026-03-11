import { APPLICATION_STATUS_STEPS } from "../../../constant";

const rejectedIndex = APPLICATION_STATUS_STEPS.findIndex(
	(step) => step.value === "rejected",
);

const acceptedIndex = APPLICATION_STATUS_STEPS.findIndex(
	(step) => step.value === "accepted",
);

const contactedIndex = APPLICATION_STATUS_STEPS.findIndex(
	(step) => step.value === "contacted",
);

export const EXTRA_STATUS_TO_INDEX: Record<string, number> = {
	"not suitable": rejectedIndex,
	"closed": acceptedIndex,
	"in contact": contactedIndex,
};

export const normalizeStatus = (value?: string) => {
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