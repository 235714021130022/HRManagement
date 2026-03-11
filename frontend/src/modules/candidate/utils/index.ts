import { APPLICATION_STATUS_STEPS } from "../../../constant";
import type { ICandidate } from "../types";

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

const parseRating = (value: number | string | undefined | null) => {
	const numeric = Number(value ?? 0);
	return Number.isFinite(numeric) ? numeric : 0;
};

export const getLatestCandidateApplication = (candidate: ICandidate) => {
	return candidate.statusApplication?.[0] ?? null;
};

export const getCandidateRecruitmentPosition = (candidate: ICandidate) => {
	const latest = getLatestCandidateApplication(candidate);
	return latest?.recruitment_infor?.positionPost?.name_post ?? "-";
};

export const getCandidateRecruitmentPost = (candidate: ICandidate) => {
	const latest = getLatestCandidateApplication(candidate);
	return (
		latest?.recruitment_infor?.post_title ??
		latest?.recruitment_infor?.internal_title ??
		latest?.recruitment_infor?.recruitment_code ??
		"-"
	);
};

export const getCandidateAppliedDate = (candidate: ICandidate) => {
	const latest = getLatestCandidateApplication(candidate);
	return latest?.created_at ?? candidate.date_applied ?? null;
};

export const getCandidateAverageRating = (candidate: ICandidate) => {
	const reviews = candidate.reviewCandidate ?? [];
	if (!reviews.length) {
		return { average: 0, count: 0 };
	}

	const total = reviews.reduce((acc, item) => acc + parseRating(item.rating), 0);
	const average = Math.round((total / reviews.length) * 10) / 10;

	return { average, count: reviews.length };
};

export const getApplicationStatusLabel = (status?: string | null) => {
	const normalized = normalizeStatus(status ?? "");
	if (!normalized) return "-";

	const match = APPLICATION_STATUS_STEPS.find(
		(step) => normalizeStatus(step.value) === normalized,
	);

	return match?.label ?? status?.trim() ?? "-";
};

export const getApplicationStatusBadgeStyle = (status?: string | null) => {
  const normalized = normalizeStatus(status ?? "");

  switch (normalized) {
    case "applied":
      return { bg: "#E4E7F2", color: "#334371" };

    case "reviewing":
      return { bg: "#DCE6FA", color: "#2F4DB8" };

    case "contacted":
      return { bg: "#D9EFFF", color: "#2B6CB0" };

    case "interviewing":
      return { bg: "#E6E0FA", color: "#553C9A" };

    case "waiting_response":
      return { bg: "#FFECCF", color: "#B7791F" };

    case "accepted":
      return { bg: "#DDF5E9", color: "#2F855A" };

    case "rejected":
      return { bg: "#FADADD", color: "#C53030" };

    default:
      return { bg: "#E4E7F2", color: "#334371" };
  }
};