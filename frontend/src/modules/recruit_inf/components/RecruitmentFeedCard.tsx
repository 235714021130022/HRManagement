import { Box, Divider, Flex, HStack,IconButton,Text, useColorModeValue, VStack } from "@chakra-ui/react";
import type { IRecruitmentInfor } from "../types";
import { daysLeft, formatCompactMoney, formatDeadlineBadge } from "../../../types";
import StatusChip from "./StatusChip";
import { FiChevronRight, FiClock, FiDollarSign, FiMoreVertical } from "react-icons/fi";
import Metric from "./Metric";

export default function RecruitmentFeedCard({item}: {item: IRecruitmentInfor}){
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const subtle = useColorModeValue("gray.600", "gray.300");
    const title = useColorModeValue("gray.900", "white");
    const hoverBg = useColorModeValue("gray.50", "gray.750");

    const left = daysLeft(item.application_deadline);
    const deadLineValue = formatDeadlineBadge(item.application_deadline);
    const deadlineTone = left != null && left < 0 ? "red.500" : undefined;
    const meta = [
    item.department_name ?? "No department",
    item.work_location_name ?? "No location",
    item.type_of_job ?? "-",
    ].join(" • ");     
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
                    <StatusChip status={item.status} />
                    <IconButton aria-label="Open" icon={<FiChevronRight />} variant="ghost" size="sm" />
                    <IconButton aria-label="More" icon={<FiMoreVertical />} variant="ghost" size="sm" />
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
                    Updated <b>{item.updated_at}</b>
                </Text>
                )}
            </HStack>
            <Divider mt={3} mb={3} opacity={0.5}/>

            <VStack align={'stretch'} spacing={2}>
                {}
            </VStack>
        </Box>
    )
}