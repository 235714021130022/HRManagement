import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

import BaseTable, {
  DefaultTableState,
  type BaseTableState,
  type HeaderTable,
} from "../../../components/common/BaseTable";
import { ButtonConfig } from "../../../components/common/Button";
import { PaginationBar } from "../../../components/common/PaginationBar";
import { ModalConfirm } from "../../../components/common/ModalConfirm";
import { useNotify } from "../../../components/notification/NotifyProvider";

import { useGetCandidate } from "../api/get";
import type { ICandidate } from "../types";
import { formatDateShort } from "../../../types";
import CandidateModal from "../components/CandidateModal";
import { CANDIDATE_STATUS_DISPLAY, CandidateStatus, type CandidateStatusType } from "../../../constant";

const CANDIDATE_STATUS_FILTER = {
  All: "All",
  Active: "Active",
  Inactive: "Inactive",
} as const;

export function Candidates() {
  const notify = useNotify();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 1000);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [statusFilter, setStatusFilter] = useState<
    keyof typeof CANDIDATE_STATUS_FILTER
  >("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCandidate, setSelectedCandidate] = useState<
    ICandidate | undefined
  >(undefined);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ICandidate | null>(null);

  const [tableState] = useState<Partial<BaseTableState>>({
    ...DefaultTableState,
    page_size: 10,
    sort_order: "desc",
    sort_by: "created_at",
  });

  const sortBy = tableState.sort_by;
  const sortOrder = tableState.sort_order;

  // map filter -> API params.status (string)
  const apiStatus =
    statusFilter === "All"
      ? undefined
      : statusFilter === "Active"
        ? "active"
        : "inactive";

  const { data: candidateRes, refetch } = useGetCandidate({
    pages: page,
    limit,
    search: debouncedSearch ?? "",
    status: apiStatus,
    sortBy,
    sortOrder,
  });

  const items = Array.isArray(candidateRes?.data) ? candidateRes.data : [];
  const pagination = candidateRes?.pagination ?? {
    totalItems: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 1,
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

    const columns: HeaderTable[] = [
    { name: "Candidate", key: "candidate_name" },
    { name: "Contact", key: "contact", disableSort: true },
    { name: "Applied", key: "date_applied" },
    { name: "Status", key: "status" },
    ];

  const mappedItems = useMemo(() => {
    return items?.map((i) => ({ ...i })) ?? [];
  }, [items]);

  const customRows = {
    candidate_name: (_: any, row: ICandidate) => {
  return (
    <Box>
      <Text fontWeight="600">{row.candidate_name || "N/A"}</Text>
      <Text fontSize="sm" color="gray.500">
        {row.candidate_code || ""}
      </Text>
    </Box>
  );
},

   contact: (_: any, row: ICandidate) => {
  return (
    <Box>
      <Text fontSize="sm">{row.phone_number || ""}</Text>
      <Text fontSize="sm" color="gray.500">
        {row.email || ""}
      </Text>
    </Box>
  );
}, 
status: (_: any, row: ICandidate & { id: string }) => {
      const active = row.status === CandidateStatus.Active;
      return (
        <Badge
          borderRadius="lg"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
          color={active ? "green.700" : "gray.600"}
          borderColor={active ? "green.300" : "gray.300"}
          bg={active ? "green.100" : "gray.100"}
        >
          {CANDIDATE_STATUS_DISPLAY[row.status as CandidateStatusType] ??
            row.status ??
            "N/A"}
        </Badge>
      );
    },
  };


  return (
    <>
      <VStack align={"stretch"} spacing={4}>
        <Flex align={"center"} gap={4}>
          <ButtonConfig
            onClick={() => {
              setModalMode("add");
              setSelectedCandidate(undefined);
              setModalOpen(true);
            }}
          >
            ADD
          </ButtonConfig>

          <Spacer />

          <InputGroup w={{ base: "100%", md: "400px" }}>
            <InputLeftElement pointerEvents={"none"}>
              <SearchIcon />
            </InputLeftElement>
            <Input
              placeholder="Search by candidate name, code, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Flex flexDirection={"column"} mt={-6}>
            <Text fontSize={"md"} color={"gray.700"}>
              Status
            </Text>
            <Select
              w="180px"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
            >
              {Object.entries(CANDIDATE_STATUS_FILTER).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>

        <Box
          overflowY={"auto"}
          border={'1px solid #E2E8F0"'}
          sx={{
            table: { borderCollapse: "separate", borderSpacing: 0 },
            "& thead": {
              position: "sticky",
              top: 0,
              zIndex: 11,
              bg: "#334371",
              color: "white",
              backgroundClip: "padding-box",
              borderRight: "1px solid white",
            },
            "& thead th:last-child": { borderRight: "none" },
          }}
        >
          <BaseTable
            columns={columns}
            data={mappedItems}
            tableState={tableState}
            customRows={customRows}
            renderRowActions={(row: ICandidate & { id: string }) => {
              return (
                <HStack spacing={2} justify="center">
                  <Tooltip label="View" hasArrow>
                    <IconButton
                      aria-label="View candidate"
                      icon={<FaEye />}
                      size="sm"
                      variant="ghost"
                      color="gray.600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/candidate/${row.id}`, {
                          state: { title: row.candidate_name ?? "Detail" },
                        });
                      }}
                    />
                  </Tooltip>

                  <Tooltip label="Edit" hasArrow>
                    <IconButton
                      aria-label="Edit candidate"
                      icon={<FaEdit />}
                      size="sm"
                      variant="ghost"
                      color="blue.600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(row);
                        setModalMode("edit");
                        setModalOpen(true);
                      }}
                    />
                  </Tooltip>

                  <Tooltip label="Delete" hasArrow>
                    <IconButton
                      aria-label="Delete candidate"
                      icon={<FaTrash />}
                      size="sm"
                      variant="ghost"
                      color="red.600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(row);
                        setDeleteOpen(true);
                      }}
                    />
                  </Tooltip>
                </HStack>
              );
            }}
          />
        </Box>

        <PaginationBar
          total={pagination.totalItems}
          page={page}
          perPage={limit}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(n) => {
            setLimit(n);
            setPage(1);
          }}
        />

        <ModalConfirm
          open={deleteOpen}
          setOpen={setDeleteOpen}
          title="Delete Candidate"
          message={`Are you sure you want to delete "${deleteTarget?.candidate_name ?? ""}"? This action cannot be undone.`}
          titleButton="DELETE"
          cancelButtonText="CANCEL"
          confirmButtonProps={{ background: "#8B0000" }}
          onClick={() => {
            // TODO: Nếu có API delete thì gọi mutation ở đây.
            notify({
              type: "success",
              message: "Deleted",
              description: "The candidate has been successfully deleted.",
            });
            setDeleteOpen(false);
            setDeleteTarget(null);
            refetch?.();
          }}
        />

        {/* <CandidateModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCandidate(undefined);
          }}
          mode={modalMode}
          data={selectedCandidate}
          onSuccess={() => refetch?.()}
        /> */}
      </VStack>
    </>
  );
}