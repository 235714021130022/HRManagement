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
import { FaEdit, FaTrash } from "react-icons/fa";
import { ButtonConfig } from "../../../../components/common/Button";
import { useNotify } from "../../../../components/notification/NotifyProvider";
import { PaginationBar } from "../../../../components/common/PaginationBar";
import { ModalConfirm } from "../../../../components/common/ModalConfirm";
import BaseTable, {
    DefaultTableState,
    type BaseTableState,
    type HeaderTable,
} from "../../../../components/common/BaseTable";
import { TYPE_POTENTIAL_STATUS } from "../../../../constant";
import type { ITypePotential } from "../types";
import { useGetTypePotential } from "../api/get";
import { useDeleteTypePotential } from "../api/delete";
import TypePotentialModal from "../components/TypePotentialModal";

export function TypePotential() {
    const notify = useNotify();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 600);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selected, setSelected] = useState<ITypePotential | undefined>(undefined);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ITypePotential | null>(null);

    const [tableState] = useState<Partial<BaseTableState>>({
        ...DefaultTableState,
        page_size: 10,
        sort_order: "desc",
        sort_by: "created_at",
    });

    const { data: potentialRes, refetch } = useGetTypePotential({
        pages: page,
        items_per_pages: limit,
        search: debouncedSearch,
    });

    const { mutateAsync: deleteTypePotential, isPending: isDeleting } = useDeleteTypePotential();

    const items = potentialRes?.data ?? [];
    const pagination = potentialRes?.pagination ?? {
        totalItems: 0,
        currentPage: 1,
        limit: 10,
        totalPages: 1,
    };

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const columns: HeaderTable[] = [
        { name: "Name", key: "name" },
        { name: "Status", key: "status", disableSort: true },
        { name: "Description", key: "description", disableSort: true },
    ];

    const mappedItems = useMemo(
        () => items.map((i) => ({ ...i })),
        [items],
    );

    const customRows = {
        status: (_: any, row: ITypePotential) => {
            const active = row.is_active;
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
                    {active ? TYPE_POTENTIAL_STATUS.ACTIVE : TYPE_POTENTIAL_STATUS.INACTIVE}
                </Badge>
            );
        },
        description: (_: any, row: ITypePotential) => (
            <Text noOfLines={1}>{row.description || "-"}</Text>
        ),
    };

    const handleDelete = async () => {
        if (!deleteTarget?.id) return;
        try {
            await deleteTypePotential(deleteTarget.id);
            notify({
                type: "success",
                message: "Deleted",
                description: `Type Potential \"${deleteTarget.name || ""}\" has been removed.`,
            });
        } catch {
            notify({ type: "error", message: "Delete failed", description: "Could not delete this type potential." });
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
                        placeholder="Search by name or description..."
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
                    renderRowActions={(row: ITypePotential) => (
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
                title="Delete Type Potential"
                message={`Are you sure you want to delete \"${deleteTarget?.name ?? ""}\"? This action cannot be undone.`}
                titleButton="DELETE"
                cancelButtonText="CANCEL"
                confirmButtonProps={{ background: "#8B0000", isLoading: isDeleting }}
                onClick={handleDelete}
            />

            <TypePotentialModal
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