import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Spacer,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiCheckCircle } from "react-icons/fi";
import { useNotify } from "../../../components/notification/NotifyProvider";
import { useUpdateJob } from "../../job/api/update";
import type { IJob, IJobCandidates } from "../../job/types";
import BaseTable, {
  DefaultTableState,
  type BaseTableState,
  type HeaderTable,
} from "../../../components/common/BaseTable";
import { theme } from "../../../theme";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

type JobCandidateProps = {
  jobCandidates?: IJobCandidates[];
  employeeId?: string;
};

type JobFilterTab = "pending" | "completed";

const isCompletedStatus = (status?: string | null, isActive?: boolean) => {
  if (isActive === false) return true;
  const normalized = (status || "").trim().toLowerCase();
  if (!normalized) return false;

  const completedStatuses = [
    "completed",
    "done",
    "closed",
    "inactive",
    "not suitable",
    "passed",
  ];

  return completedStatuses.includes(normalized);
};

const formatDeadline = (value?: string | Date | null) => {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} - ${hh}:${min}`;
};

const isDueTodayOrOverdue = (value?: string | Date | null) => {
  if (!value) return false;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  // Compare by day (ignore hour/minute) so "today" is treated correctly.
  const deadlineDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return deadlineDate.getTime() <= today.getTime();
};

const shouldHighlightOverdue = (job: IJob) => {
  const completed = isCompletedStatus(job.status, job.is_active);
  if (completed) return false;
  return isDueTodayOrOverdue(job.deadline);
};

export default function JobCandidate({ jobCandidates = [], employeeId }: JobCandidateProps) {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<JobFilterTab>("pending");
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [tableState] = useState<Partial<BaseTableState>>({
    ...DefaultTableState,
    sort_by: "deadline",
    sort_order: "asc",
  });

  const updateJobMutation = useUpdateJob({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  const jobs = useMemo(() => {
    const seen = new Set<string>();
    const rows: IJob[] = [];

    for (const relation of jobCandidates) {
      const job = relation.job;
      if (!job?.id) continue;
      if (seen.has(job.id)) continue;

      if (employeeId) {
        const assignedEmployeeId = job.employee_id || job.employee?.id;
        if (assignedEmployeeId !== employeeId) continue;
      }

      seen.add(job.id);
      rows.push(job);
    }

    return rows;
  }, [jobCandidates, employeeId]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const completed = isCompletedStatus(job.status, job.is_active);
      return activeTab === "completed" ? completed : !completed;
    });
  }, [jobs, activeTab]);

  const columns: HeaderTable[] = [
    { name: "", key: "state", disableSort: true, headerStyle: { width: "56px" } },
    { name: "Job Name", key: "name_job" },
    { name: "Assignee", key: "assignee", disableSort: true },
    { name: "Deadline", key: "deadline" },
    { name: "Actions", key: "actions", disableSort: true, headerStyle: { width: "56px" } },
  ];

  const mappedRows = useMemo(() => {
    return filteredJobs.map((job) => ({
      ...job,
      state: "state",
      assignee: job.employee?.employee_name || "Unassigned",
      actions: "actions",
    }));
  }, [filteredJobs]);

  const customRows = {
    state: (_: any, row: IJob) => (
      <IconButton
        aria-label="Job state"
        icon={<FiCheckCircle />}
        variant="ghost"
        color={isCompletedStatus(row.status, row.is_active) ? "green.500" : "gray.500"}
        size="sm"
        isLoading={updateJobMutation.isPending && updatingJobId === row.id}
        onClick={() => {
          if (!row.id || updateJobMutation.isPending) return;

          const shouldMoveToPending = activeTab === "completed";
          const nextStatusLabel = shouldMoveToPending ? "PENDING" : "COMPLETED";
          const nextBackendStatus = shouldMoveToPending ? "Active" : "Inactive";

          setUpdatingJobId(row.id);
          updateJobMutation.mutate(
            {
              id: row.id,
              data: {
                status: nextBackendStatus,
              },
            },
            {
              onSuccess: () => {
                notify({
                  type: "success",
                  message: "Updated successfully",
                  description: `Job \"${row.name_job || "Untitled job"}\" has been moved to ${nextStatusLabel}.`,
                });
              },
              onError: () => {
                notify({
                  type: "error",
                  message: "Update failed",
                  description: `Could not update status for job \"${row.name_job || "Untitled job"}\".`,
                });
              },
              onSettled: () => {
                setUpdatingJobId(null);
              },
            },
          );
        }}
      />
    ),
    name_job: (_: any, row: IJob) => (
      <Text
        fontWeight="600"
        color={shouldHighlightOverdue(row) ? "red.500" : "black"}
        noOfLines={1}
      >
        {row.name_job || "Untitled job"}
      </Text>
    ),
    assignee: (_: any, row: IJob) => {
      const assigneeName = row.employee?.employee_name || "Unassigned";
      return (
        <HStack spacing={2} justify="center">
          <Avatar size="sm" name={assigneeName} bg="orange.400" color="white" />
          <Text noOfLines={1} maxW="180px">
            {assigneeName}
          </Text>
        </HStack>
      );
    },
    deadline: (_: any, row: IJob) => (
      <Text color={shouldHighlightOverdue(row) ? "red.500" : "black"} fontWeight="600">
        {formatDeadline(row.deadline)}
      </Text>
    ),
    actions: () => (
                <HStack spacing={0} justify="center">
                  <Tooltip label="Edit" hasArrow>
                    <IconButton
                      aria-label="Edit candidate"
                      icon={<FaEdit />}
                      size="sm"
                      variant="ghost"
                      color="blue.600"
                    //   onClick={(e) => {
                    //     e.stopPropagation();
                    //     setSelectedCandidate(row);
                    //     setModalMode("edit");
                    //     setModalOpen(true);
                    //   }}
                    />
                  </Tooltip>

                  <Tooltip label="Delete" hasArrow>
                    <IconButton
                      aria-label="Delete candidate"
                      icon={<FaTrash />}
                      size="sm"
                      variant="ghost"
                      color="red.600"
                    //   onClick={(e) => {
                    //     e.stopPropagation();
                    //     setDeleteTarget(row);
                    //     setDeleteOpen(true);
                    //   }}
                    />
                  </Tooltip>
                </HStack>
    ),
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={1}>
          <Button
            size="sm"
            borderRadius="sm"
            variant={activeTab === "pending" ? "solid" : "outline"}
            background={activeTab === "pending" ? theme.colors.primary : "white"}
            color={activeTab === "pending" ? "white" : theme.colors.primary}
            borderColor={theme.colors.primary}
            _hover={{ bg: activeTab === "pending" ? theme.colors.primary : "gray.50" }}
            onClick={() => setActiveTab("pending")}
          >
            PENDING
          </Button>
          <Button
            size="sm"
            borderRadius="sm"
            variant={activeTab === "completed" ? "solid" : "outline"}
            background={activeTab === "completed" ? theme.colors.primary : "white"}
            color={activeTab === "completed" ? "white" : theme.colors.primary}
            borderColor={theme.colors.primary}
            _hover={{ bg: activeTab === "completed" ? theme.colors.primary : "gray.50" }}
            onClick={() => setActiveTab("completed")}
          >
            COMPLETED
          </Button>
        </HStack>

        <Spacer />

        <Button
          size="sm"
          background={theme.colors.primary}
          color="white"
          _hover={{ bg: theme.colors.primary }}
        >
          ADD
        </Button>
      </Flex>

      <BaseTable
        columns={columns}
        data={mappedRows}
        tableState={tableState}
        customRows={customRows}
        hideCheckboxes
      />
    </Box>
  );
}
