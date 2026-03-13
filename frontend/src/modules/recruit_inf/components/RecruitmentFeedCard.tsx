import {
    Button,
    Box,
    Divider,
    Flex,
    HStack,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { IRecruitmentInfor } from "../types";
import { daysLeft, formatCompactMoney, formatDeadlineBadge, formatDateShort } from "../../../types";
import {
    FiChevronDown,
    FiClock,
    FiCopy,
    FiDollarSign,
    FiEdit2,
    FiExternalLink,
    FiMoreVertical,
    FiShare2,
    FiTrash2,
} from "react-icons/fi";
import Metric from "./Metric";
import { ActivityDot } from "./ActivityDot";
import { buildRecruitmentActivities, RECRUITMENT_ACTIVITY_DISPLAY } from "../utils";
import { useNavigate } from "react-router-dom";
import { recruitmentInforDetailUrl } from "../../../routes/urls";
import { useNotify } from "../../../components/notification/NotifyProvider";
import { useDeleteRecInform } from "../api/delete";
import { useUpdateRecInform } from "../api/update";
import { RecruitmentStatus, type RecruitmentStatusType } from "../../../constant";
import { ModalConfirm } from "../../../components/common/ModalConfirm";

type StatusOption = {
    value: RecruitmentStatusType;
    label: string;
    description: string;
    dotColor: string;
    borderColor: string;
    textColor: string;
    confirmTitle?: string;
    confirmDescription?: string;
};

const STATUS_OPTIONS: StatusOption[] = [
    {
        value: RecruitmentStatus.Public,
        label: "Public",
        description: "Visible publicly on configured recruitment channels.",
        dotColor: "green.400",
        borderColor: "green.400",
        textColor: "green.500",
    },
    {
        value: RecruitmentStatus.Internal,
        label: "Internal",
        description: "Accessible via direct link but hidden from recruitment channels.",
        dotColor: "blue.400",
        borderColor: "blue.400",
        textColor: "blue.500",
        confirmTitle: "Change recruitment status",
        confirmDescription:
            "This posting will be hidden from the website and configured recruitment channels. Only internal members can view it via direct link. Do you want to continue?",
    },
    {
        value: RecruitmentStatus.StopReceiving,
        label: "Stop Receiving",
        description: "This posting will be removed from recruitment channels. Applications will be disabled.",
        dotColor: "red.400",
        borderColor: "red.300",
        textColor: "red.500",
        confirmTitle: "Change recruitment status",
        confirmDescription:
            "This posting will be removed from configured recruitment channels. Candidates can no longer apply. Do you want to continue?",
    },
    {
        value: RecruitmentStatus.Closed,
        label: "Closed",
        description: "This recruitment posting has been completed.",
        dotColor: "gray.500",
        borderColor: "gray.300",
        textColor: "gray.700",
        confirmTitle: "Change recruitment status",
        confirmDescription:
            "This posting will be closed and will no longer accept new applications. Do you want to continue?",
    },
];

export default function RecruitmentFeedCard({item}: {item: IRecruitmentInfor}){
        const navigate = useNavigate();
        const notify = useNotify();
        const { mutateAsync: deleteRecInform, isPending: isDeleting } = useDeleteRecInform();
        const { mutateAsync: updateRecInform, isPending: isUpdatingStatus } = useUpdateRecInform();
        const [pendingStatus, setPendingStatus] = useState<RecruitmentStatusType | null>(null);

    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const subtle = useColorModeValue("gray.600", "gray.300");
    const title = useColorModeValue("gray.900", "white");
    const hoverBg = useColorModeValue("gray.50", "gray.750");

    const left = daysLeft(item.application_deadline);
    const deadLineValue = formatDeadlineBadge(item.application_deadline);
    const deadlineTone = left != null && left < 0 ? "red.500" : undefined;
    const detailPath = recruitmentInforDetailUrl.replace(":id", item.id);
    const meta = [
    item.department_name ?? item.department?.full_name ?? "No department",
    item.work_location_name ?? item.workLocation?.full_name ?? "No location",
    item.type_of_job ?? "-",
        ].join(" • ");

        const latestActivities = (item.activities?.length
            ? item.activities
            : buildRecruitmentActivities(item)
        ).slice(0, 2);

        const currentStatusOption = useMemo(
            () => STATUS_OPTIONS.find((option) => option.value === item.status) ?? STATUS_OPTIONS[0],
            [item.status],
        );

        const availableStatusOptions = useMemo(
            () => STATUS_OPTIONS.filter((option) => option.value !== item.status),
            [item.status],
        );

        const handleCopyShareLink = async () => {
            const shareLink = `${window.location.origin}${detailPath}`;
            try {
                await navigator.clipboard.writeText(shareLink);
                notify({ message: "Share link copied", type: "success" });
            } catch {
                notify({ message: "Unable to copy share link", description: shareLink, type: "warning" });
            }
        };

        const handleDelete = async () => {
            const ok = window.confirm("Are you sure you want to delete this recruitment posting?");
            if (!ok) return;

            try {
                await deleteRecInform(item.id);
                notify({ message: "Recruitment posting deleted", type: "success" });
            } catch (err: any) {
                const msg = Array.isArray(err?.response?.data?.message)
                    ? err.response.data.message.join(", ")
                    : err?.response?.data?.message || "Failed to delete recruitment posting";
                notify({ message: msg, type: "error" });
            }
        };

        const applyStatusChange = async (nextStatus: RecruitmentStatusType) => {
            try {
                await updateRecInform({
                    id: item.id,
                    data: { status: nextStatus },
                });
                notify({ message: "Status updated successfully", type: "success" });
                setPendingStatus(null);
            } catch (err: any) {
                const msg = Array.isArray(err?.response?.data?.message)
                    ? err.response.data.message.join(", ")
                    : err?.response?.data?.message || "Failed to update status";
                notify({ message: msg, type: "error" });
            }
        };

        const handleStatusSelect = async (nextStatus: RecruitmentStatusType) => {
            const option = STATUS_OPTIONS.find((status) => status.value === nextStatus);
            if (!option) return;

            if (option.confirmDescription) {
                setPendingStatus(nextStatus);
                return;
            }

            await applyStatusChange(nextStatus);
        };

        const pendingStatusOption = pendingStatus
            ? STATUS_OPTIONS.find((option) => option.value === pendingStatus) ?? null
            : null;

    return (
        <Box
            bg={bg}
            border={'1px solid'}
            borderColor={border}
            borderRadius={'14px'}
            px={4}
            py={3}
            _hover={{ bg: hoverBg }}
            transition="background 0.12s ease"
        >
            <Flex align={'start'} gap={3}>
                <Box minW={0} flex={1}>
                    <HStack spacing={2} minW={0}>
                        <Text fontSize="md" fontWeight="800" color={title} noOfLines={1}>
                        {item.post_title || "Untitled recruitment"}
                        </Text>
                        {item.recruitment_code && (
                        <Text fontSize="sm" color={subtle} whiteSpace="nowrap">
                            • {item.recruitment_code}
                        </Text>
                        )}
                    </HStack>
                    <Text fontSize="sm" color={subtle} noOfLines={1} mt={0.5}>
                        {meta}
                    </Text>
                </Box>
                <HStack spacing={2}>
                    <Menu placement="bottom-end">
                        <MenuButton
                            as={Button}
                            size="sm"
                            variant="outline"
                            rightIcon={<FiChevronDown />}
                            borderColor={currentStatusOption.borderColor}
                            color={currentStatusOption.textColor}
                            fontWeight="600"
                            isLoading={isUpdatingStatus}
                            loadingText={currentStatusOption.label}
                            h="36px"
                            px={3}
                            borderRadius="10px"
                            _hover={{ bg: "transparent" }}
                            _active={{ bg: "transparent" }}
                        >
                            <HStack spacing={2}>
                                <Box boxSize="10px" borderRadius="full" bg={currentStatusOption.dotColor} />
                                <Text fontSize="sm">{currentStatusOption.label}</Text>
                            </HStack>
                        </MenuButton>
                        <MenuList w="320px" maxW="320px" py={1.5}>
                            {availableStatusOptions.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    borderRadius="md"
                                    py={2.5}
                                    alignItems="flex-start"
                                    whiteSpace="normal"
                                    onClick={() => {
                                        void handleStatusSelect(option.value);
                                    }}
                                >
                                    <HStack align="start" spacing={3}>
                                        <Box
                                            mt="7px"
                                            boxSize="10px"
                                            borderRadius="full"
                                            bg={option.dotColor}
                                            flexShrink={0}
                                        />
                                        <Box maxW="250px">
                                            <Text fontSize="sm" fontWeight="700" lineHeight="1.2">
                                                {option.label}
                                            </Text>
                                            <Text mt={1} fontSize="sm" color="gray.500" whiteSpace="normal">
                                                {option.description}
                                            </Text>
                                        </Box>
                                    </HStack>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>

                    <Menu placement="bottom-end">
                        <MenuButton
                            as={IconButton}
                            aria-label="More actions"
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                        />
                        <MenuList w="fit-content" minW="fit-content" py={1.5}>
                            <MenuItem icon={<Icon as={FiEdit2} boxSize={5} />} fontSize="md" onClick={() => navigate(detailPath)}>
                                Edit posting
                            </MenuItem>

                            <MenuItem
                                icon={<Icon as={FiCopy} boxSize={5} />}
                                fontSize="md"
                                onClick={() => notify({ message: "Duplicate feature will be available soon", type: "info" })}
                            >
                                Duplicate
                            </MenuItem>

                            <MenuItem icon={<Icon as={FiShare2} boxSize={5} />} fontSize="md" onClick={handleCopyShareLink}>
                                Share
                            </MenuItem>

                            <MenuItem
                                icon={<Icon as={FiExternalLink} boxSize={5} />}
                                fontSize="md"
                                onClick={() => window.open(detailPath, "_blank", "noopener,noreferrer")}
                            >
                                View posting
                            </MenuItem>

                            <MenuItem
                                icon={<Icon as={FiTrash2} boxSize={5} color="red.500" />}
                                color="red.500"
                                fontSize="md"
                                onClick={() => {
                                    void handleDelete();
                                }}
                                isDisabled={isDeleting}
                            >
                                Delete
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>
            <HStack spacing={6} mt={3} flexWrap={'wrap'}>
                <Metric icon={<FiClock/>} label="Deadline" value={deadLineValue} tone={deadlineTone}/>
                <Metric
                icon={<FiDollarSign />}
                label="Cost"
                value={formatCompactMoney(item.total_cost, item.cost_currency)}
                />
                {item.updated_at && (
                <Text fontSize="sm" color={subtle}>
                                        Updated <b>{formatDateShort(item.updated_at)}</b>
                </Text>
                )}
            </HStack>
            <Divider mt={3} mb={3} opacity={0.5}/>

            <VStack align={'stretch'} spacing={2}>
                                {latestActivities.length > 0 ? (
                                    latestActivities.map((activity, idx) => (
                                        <Flex key={`${activity.type}-${activity.at ?? "-"}-${idx}`} gap={3}>
                                            <ActivityDot muted={idx > 0} />
                                            <Box minW={0} flex={1}>
                                                <Text fontSize="sm" noOfLines={1}>
                                                    {activity.text}
                                                </Text>
                                                <Text fontSize="xs" color={subtle} mt={0.5}>
                                                    {RECRUITMENT_ACTIVITY_DISPLAY[activity.type]}
                                                    {activity.at ? ` • ${formatDateShort(activity.at)}` : ""}
                                                </Text>
                                            </Box>
                                        </Flex>
                                    ))
                                ) : (
                                    <Text fontSize="sm" color={subtle}>
                                        No recent activity yet.
                                    </Text>
                                )}
            </VStack>

            <ModalConfirm
                open={Boolean(pendingStatusOption)}
                setOpen={(open) => {
                    if (!open) setPendingStatus(null);
                }}
                title={pendingStatusOption?.confirmTitle}
                message={pendingStatusOption?.confirmDescription}
                titleButton="Yes"
                cancelButtonText="No"
                onClick={() => {
                    if (!pendingStatus) return;
                    void applyStatusChange(pendingStatus);
                }}
                confirmButtonProps={{ isLoading: isUpdatingStatus, background: "#ef4444", _hover: { background: "#dc2626" } }}
                cancelButtonProps={{ background: "transparent", _hover: { background: "gray.100" } }}
            />
        </Box>
    )
}