import {
  Box,
  Text,
  Flex,
  VStack,
  Badge,
  Spacer,
  InputGroup,
  InputLeftElement,
  Input,
  HStack,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { ButtonConfig } from "../../../../components/common/Button";
import { useNotify } from "../../../../components/notification/NotifyProvider";
import { PaginationBar } from "../../../../components/common/PaginationBar";
import { ModalConfirm } from "../../../../components/common/ModalConfirm";
import BaseTable, {
  DefaultTableState,
  type BaseTableState,
  type HeaderTable,
} from "../../../../components/common/BaseTable";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { IPositionPost } from "../types";
import { useGetPositionPosts } from "../api/get";
import { useDeletePositionPost } from "../api/delete";
import PositionPostModal from "../components/PositionPostModal";
import { POSITION_POST_STATUS } from "../../../../constant";

export function PositionPost() {
  const notify = useNotify();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 600);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<IPositionPost | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IPositionPost | null>(null);

  const [tableState] = useState<Partial<BaseTableState>>({
    ...DefaultTableState,
    page_size: 10,
    sort_order: "desc",
    sort_by: "created_at",
  });

  const { data: postsRes, refetch } = useGetPositionPosts({
    pages: page,
    items_per_pages: limit,
    search: debouncedSearch,
  });

  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePositionPost();

  const items = postsRes?.data ?? [];
  const pagination = postsRes?.pagination ?? {
    totalItems: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 1,
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const columns: HeaderTable[] = [
    { name: "Code", key: "position_code" },
    { name: "Position name", key: "name_post" },
    { name: "Status", key: "status", disableSort: true },
    { name: "Auto settings", key: "auto_settings", disableSort: true },
  ];

  const mappedItems = useMemo(
    () => items.map((i) => ({ ...i, auto_settings: "auto" })),
    [items],
  );

  const customRows = {
    name_post: (_: any, row: IPositionPost) => (
      <Box minW={0}>
        <Text fontWeight="600" noOfLines={1}>
          {row.name_post || "—"}
        </Text>
        {row.inforCompany?.full_name && (
          <Text fontSize="xs" color="gray.500" noOfLines={1}>
            {row.inforCompany.full_name}
          </Text>
        )}
      </Box>
    ),
    status: (_: any, row: IPositionPost) => {
      const active = row.status === POSITION_POST_STATUS.ACTIVE;
      return (
        <Badge
          borderRadius="lg"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
          color={active ? "green.700" : "gray.600"}
          bg={active ? "green.100" : "gray.100"}
        >
          {row.status || "—"}
        </Badge>
      );
    },
    auto_settings: (_: any, row: IPositionPost) => (
      <HStack spacing={1} flexWrap="wrap">
        {row.auto_rotation && (
          <Badge colorScheme="blue"           px={3}
          py={1} borderRadius="md" fontSize="xs">
            Rotation
          </Badge>
        )}
        {row.auto_eli_candidate && (
          <Badge colorScheme="orange"           px={3}
          py={1} borderRadius="md" fontSize="xs">
            Eliminate
          </Badge>
        )}
        {row.auto_near && (
          <Badge colorScheme="purple"           px={3}
          py={1} borderRadius="md" fontSize="xs">
            Near
          </Badge>
        )}
        {!row.auto_rotation && !row.auto_eli_candidate && !row.auto_near && (
          <Text fontSize="xs" color="gray.400">
            None
          </Text>
        )}
      </HStack>
    ),
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deletePost(deleteTarget.id);
      notify({
        type: "success",
        message: "Deleted",
        description: `Position "${deleteTarget.name_post || ""}" has been removed.`,
      });
    } catch {
      notify({ type: "error", message: "Delete failed", description: "Could not delete this position." });
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Flex align="center" gap={4}>
        <ButtonConfig
          onClick={() => {
            setModalMode("add");
            setSelected(undefined);
            setModalOpen(true);
          }}
        >
          ADD
        </ButtonConfig>
        <Spacer />
        <InputGroup w={{ base: "100%", md: "360px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon />
          </InputLeftElement>
          <Input
            placeholder="Search by position name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Flex>

      <Box
        overflowY="auto"
        sx={{
          table: { borderCollapse: "separate", borderSpacing: 0 },
          "& thead": {
            position: "sticky",
            top: 0,
            zIndex: 11,
            bg: "#334371",
            color: "white",
            backgroundClip: "padding-box",
          },
        }}
      >
        <BaseTable
          columns={columns}
          data={mappedItems}
          tableState={tableState}
          customRows={customRows}
          renderRowActions={(row: IPositionPost) => (
            <HStack spacing={1} justify="center">
              <Tooltip label="Edit" hasArrow>
                <IconButton
                  aria-label="Edit"
                  icon={<FaEdit />}
                  size="sm"
                  variant="ghost"
                  color="blue.600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(row);
                    setModalMode("edit");
                    setModalOpen(true);
                  }}
                />
              </Tooltip>
              <Tooltip label="Delete" hasArrow>
                <IconButton
                  aria-label="Delete"
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
          )}
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
        title="Delete Position Post"
        message={`Are you sure you want to delete "${deleteTarget?.name_post ?? ""}"? This action cannot be undone.`}
        titleButton="DELETE"
        cancelButtonText="CANCEL"
        confirmButtonProps={{ background: "#8B0000", isLoading: isDeleting }}
        onClick={handleDelete}
      />

      <PositionPostModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(undefined);
        }}
        mode={modalMode}
        data={selected}
        onSuccess={() => refetch?.()}
      />
    </VStack>
  );
}