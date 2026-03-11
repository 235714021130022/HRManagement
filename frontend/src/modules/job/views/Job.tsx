import { Box, Select, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobCandidate, {
    getJobCompanyName,
} from "../../candidate/components/JobCandidate";
import { RECRUIT_BASE_ROLE } from "../../../constant/roles";
import { useAuthStore } from "../../auth/store/auth.store";
import { useGetJob } from "../api/get";
import { useDeleteJob } from "../api/delete";
import type { IJob } from "../types";
import JobModal from "../components/JobModal";
import { ModalConfirm } from "../../../components/common/ModalConfirm";
import { useNotify } from "../../../components/notification/NotifyProvider";

export function Job() {
    const notify = useNotify();
    const navigate = useNavigate();
    const hasRole = useAuthStore((s) => s.hasRole);
    const isAdmin = hasRole(RECRUIT_BASE_ROLE.Admin);
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [jobModalMode, setJobModalMode] = useState<"add" | "edit">("add");
    const [selectedJob, setSelectedJob] = useState<IJob | undefined>(undefined);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<IJob | undefined>(undefined);

    const { mutateAsync: deleteJob, isPending: isDeleting } = useDeleteJob();

    const { data, isLoading, isError } = useGetJob({
        pages: 1,
        limit: 100,
        sortBy: "deadline",
        sortOrder: "asc",
    });

    const jobs = data?.data ?? [];

    const companyOptions = useMemo(() => {
        if (!isAdmin) {
            return [];
        }

        return Array.from(new Set(jobs.map(getJobCompanyName))).sort((a, b) =>
            a.localeCompare(b),
        );
    }, [isAdmin, jobs]);

    const filteredJobs = useMemo(() => {
        if (!isAdmin || selectedCompany === "all") {
            return jobs;
        }

        return jobs.filter((job) => getJobCompanyName(job) === selectedCompany);
    }, [isAdmin, jobs, selectedCompany]);

    const openAddModal = () => {
        setSelectedJob(undefined);
        setJobModalMode("add");
        setIsJobModalOpen(true);
    };

    const openEditModal = (job: IJob) => {
        setSelectedJob(job);
        setJobModalMode("edit");
        setIsJobModalOpen(true);
    };

    const openDeleteModal = (job: IJob) => {
        setDeleteTarget(job);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget?.id) return;

        try {
            await deleteJob(deleteTarget.id);
            notify({
                type: "success",
                message: "Deleted successfully",
                description: `Job "${deleteTarget.name_job || "Untitled job"}" has been removed.`,
            });
            setIsDeleteOpen(false);
            setDeleteTarget(undefined);
        } catch (error: any) {
            const rawMessage = error?.response?.data?.message;
            const message = Array.isArray(rawMessage)
                ? rawMessage.join(", ")
                : typeof rawMessage === "string"
                    ? rawMessage
                    : "Could not delete this job.";

            notify({
                type: "error",
                message: "Delete failed",
                description: message,
            });
        }
    };

    const goToDetail = (job: IJob) => {
        if (!job.id) return;
        navigate(`/jobs/${job.id}`);
    };

    if (isLoading) {
        return (
            <VStack py={10} spacing={3}>
                <Spinner size="lg" color="#334371" />
                <Text color="gray.600">Loading jobs...</Text>
            </VStack>
        );
    }

    if (isError) {
        return (
            <VStack py={10} spacing={3}>
                <Text color="red.500" fontWeight="600">
                    Failed to load jobs
                </Text>
                <Text color="gray.600">Please try again.</Text>
            </VStack>
        );
    }

    return (
        <Box>
            <JobCandidate
                jobs={filteredJobs}
                onAddClick={openAddModal}
                onViewClick={goToDetail}
                onEditClick={openEditModal}
                onDeleteClick={openDeleteModal}
                toolbarRight={
                    isAdmin ? (
                        <Select
                            w={{ base: "220px", md: "280px" }}
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                        >
                            <option value="all">All companies</option>
                            {companyOptions.map((company) => (
                                <option key={company} value={company}>
                                    {company}
                                </option>
                            ))}
                        </Select>
                    ) : null
                }
            />

            <JobModal
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
                mode={jobModalMode}
                data={selectedJob}
                onSuccess={() => {
                    setIsJobModalOpen(false);
                    setSelectedJob(undefined);
                }}
            />

            <ModalConfirm
                open={isDeleteOpen}
                setOpen={setIsDeleteOpen}
                title="Delete job"
                message={`Are you sure you want to delete \"${deleteTarget?.name_job || "this job"}\"?`}
                titleButton="Delete"
                onClick={handleDelete}
                confirmButtonProps={{ isLoading: isDeleting }}
            />
        </Box>
    );
}