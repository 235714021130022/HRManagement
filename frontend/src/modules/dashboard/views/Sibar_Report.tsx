import { DownloadIcon, TimeIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { theme } from "../../../theme";
import CostReport from "../components/CostReport";
import DashboardOverview from "../components/DashboardOverview";
import PerformanceReport from "../components/PerformanceReport";
import PlanReport from "../components/PlanReport";
import RejectedCandidatesReport from "../components/RejectedReport";
import ReportSettings from "../components/ReportSettings";
import { useDashboardOverview } from "../api/get";
import { useDashboardCost } from "../api/get_cost";
import { useDashboardPerformance } from "../api/get_performance";
import type { DashboardPeriod, DashboardScope, ReportTabKey } from "../types";
import { sibarItems } from "../utils";
import { useDashboardPlan } from "../api/get_plan";
import { useDashboardRejected } from "../api/get_rejected";

const { BG_PAGE, BORDER, PRIMARY, PRIMARY_200, PRIMARY_300, PRIMARY_500, PRIMARY_900 } =
  theme.colors.charts;

const periodOptions = ["Tháng này", "Quý này", "Từ đầu năm"] as const;
const scopeOptions = ["Tất cả phòng ban", "Chỉ khối Tech", "Khối vận hành"] as const;

const tabDescriptions: Record<ReportTabKey, string> = {
  dashboard: "Theo dõi toàn bộ chỉ số tuyển dụng theo thời gian thực và phát hiện biến động sớm.",
  performance: "Đo hiệu suất pipeline tuyển dụng theo người phụ trách, vị trí và từng bước xử lý.",
  cost: "Kiểm soát ngân sách theo kênh, phòng ban và chi phí trên mỗi ứng viên trúng tuyển.",
  plan: "Bám sát kế hoạch headcount, số lượng đã tuyển và tiến độ đóng vị trí theo tuần.",
  rejected: "Phân tích lý do bị loại để tối ưu screening, phỏng vấn và chất lượng nguồn ứng viên.",
  settings: "Cấu hình bộ lọc mặc định, quy tắc cập nhật và phạm vi dữ liệu trong báo cáo.",
};

export default function RecruitmentDashboardMockupTSX() {
  const [activeTab, setActiveTab] = React.useState<ReportTabKey>("dashboard");
  const [activePeriod, setActivePeriod] = React.useState<(typeof periodOptions)[number]>(periodOptions[0]);
  const [activeScope, setActiveScope] = React.useState<(typeof scopeOptions)[number]>(scopeOptions[0]);
  const isOverviewTab = activeTab === "dashboard";
  const isPerformanceTab = activeTab === "performance";
  const isCostTab = activeTab === "cost";
  const isPlanTab = activeTab === "plan";
  const isRejectedTab = activeTab === "rejected";

  const periodParam: DashboardPeriod =
    activePeriod === "Tháng này"
      ? "month"
      : activePeriod === "Quý này"
        ? "quarter"
        : "ytd";

  const scopeParam: DashboardScope =
    activeScope === "Chỉ khối Tech"
      ? "tech"
      : activeScope === "Khối vận hành"
        ? "operations"
        : "all";

  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useDashboardOverview({
    enabled: isOverviewTab,
  });

  const {
    data: performanceData,
    isLoading: isPerformanceLoading,
    isError: isPerformanceError,
  } = useDashboardPerformance(
    {
      period: periodParam,
      scope: scopeParam,
    },
    {
      enabled: isPerformanceTab,
    },
  );

  const {
    data: costData,
    isLoading: isCostLoading,
    isError: isCostError,
  } = useDashboardCost(
    {
      period: periodParam,
      scope: scopeParam,
    },
    {
      enabled: isCostTab,
    },
  );

  const {
    data: planData,
    isLoading: isPlanLoading,
    isError: isPlanError,
  } = useDashboardPlan(
    {
      period: periodParam,
      scope: scopeParam,
    },
    {
      enabled: isPlanTab,
    },
  );

  const {
    data: rejectedData,
    isLoading: isRejectedLoading,
    isError: isRejectedError,
  } = useDashboardRejected(
    {
      period: periodParam,
      scope: scopeParam,
    },
    {
      enabled: isRejectedTab,
    },
  );

  const statHighlights = React.useMemo(() => {
    const cardMap = new Map((overviewData?.statCards || []).map((card) => [card.title, card.value]));
    const getValue = (...keys: string[]) => keys.map((key) => cardMap.get(key)).find(Boolean) || "--";

    return [
      { label: "Chiến dịch đang mở", value: getValue("Total Recruitments", "Tổng tin tuyển dụng") },
      { label: "Hồ sơ ứng tuyển", value: getValue("Total Applications", "Tổng hồ sơ ứng tuyển") },
      { label: "Ứng viên đạt", value: getValue("Accepted Candidates", "Ứng viên đạt") },
    ];
  }, [overviewData?.statCards]);

  const activeLabel = sibarItems.find((item) => item.key === activeTab)?.label ?? "Tổng quan";

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            data={overviewData}
            isLoading={isOverviewLoading}
            isError={isOverviewError}
          />
        );
      case "performance":
        return (
          <PerformanceReport
            data={performanceData}
            isLoading={isPerformanceLoading}
            isError={isPerformanceError}
          />
        );
      case "cost":
        return (
          <CostReport
            data={costData}
            isLoading={isCostLoading}
            isError={isCostError}
          />
        );
      case "plan":
        return (
          <PlanReport
            data={planData}
            isLoading={isPlanLoading}
            isError={isPlanError}
          />
        );
      case "rejected":
        return (
          <RejectedCandidatesReport
            data={rejectedData}
            isLoading={isRejectedLoading}
            isError={isRejectedError}
          />
        );
      case "settings":
        return <ReportSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Box minH="100vh" bg={BG_PAGE} position="relative" overflow="hidden">
      <Box
        position="absolute"
        top="-120px"
        right="-120px"
        w="340px"
        h="340px"
        bg="radial-gradient(circle, rgba(90,108,152,0.24) 0%, rgba(90,108,152,0) 70%)"
        pointerEvents="none"
      />

      <Flex maxW="1540px" mx="auto" gap={{ base: 3, md: 5 }} align="stretch" direction={{ base: "column", lg: "row" }}>
        <Box
          w={{ base: "100%", lg: "250px" }}
          bg="white"
          border="1px solid"
          borderColor={BORDER}
          borderRadius="7px"
          boxShadow="0 12px 34px rgba(26, 39, 68, 0.06)"
          py={4}
          px={{ base: 3, lg: 4 }}
          position={{ base: "relative", lg: "sticky" }}
          top={{ base: "auto", lg: "16px" }}
          h={{ base: "auto", lg: "calc(100vh - 32px)" }}
        >
          <VStack align="stretch" spacing={4} h="100%" justify="space-between">
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color={PRIMARY_500} fontWeight="700">
                Điều hướng báo cáo
              </Text>
            </Box>

            <VStack spacing={2} align="stretch" flex="1" overflowY="auto" className="hide-scrollbar">
              {sibarItems.map((item) => {
                const isActive = item.key === activeTab;

                return (
                  <Button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    h="52px"
                    justifyContent={{ base: "center", lg: "flex-start" }}
                    px={{ base: 3, lg: 4 }}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={isActive ? PRIMARY_200 : "transparent"}
                    bg={isActive ? "rgba(51, 67, 113, 0.10)" : "transparent"}
                    color={isActive ? PRIMARY : "gray.500"}
                    _hover={{ bg: isActive ? "rgba(51, 67, 113, 0.12)" : "gray.50" }}
                    _active={{ bg: isActive ? "rgba(51, 67, 113, 0.14)" : "gray.100" }}
                    transition="all 0.2s ease"
                    title={item.label}
                  >
                    <HStack w="full" spacing={3} justify={{ base: "center", lg: "flex-start" }}>
                      <Icon as={item.icon} boxSize={5} />
                      <Text display={{ base: "none", lg: "block" }} fontWeight="700" fontSize="sm">
                        {item.label}
                      </Text>
                    </HStack>
                  </Button>
                );
              })}
            </VStack>

            <Box
              borderRadius="18px"
              p={3}
              bg="rgba(51, 67, 113, 0.06)"
              border="1px solid"
              borderColor={PRIMARY_200}
            >
              <HStack spacing={2} color={PRIMARY}>
                <TimeIcon boxSize={3.5} />
                <Text fontSize="xs" fontWeight="700">
                  Đồng bộ lần cuối: 2 phút trước
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>

        <Box flex="1" minW={0}>
          <VStack spacing={5} align="stretch">
            <Box
              bg="white"
              border="1px solid"
              borderColor={BORDER}
              borderRadius="md"
              px={{ base: 5, md: 7 }}
              py={{ base: 5, md: 6 }}
              boxShadow="0 12px 34px rgba(26, 39, 68, 0.06)"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-60px"
                right="-40px"
                w="220px"
                h="220px"
                borderRadius="full"
                bg="radial-gradient(circle, rgba(126,141,178,0.22) 0%, rgba(126,141,178,0) 68%)"
                pointerEvents="none"
              />

              <Flex
                direction={{ base: "column", xl: "row" }}
                align={{ base: "stretch", xl: "center" }}
                justify="space-between"
                gap={5}
                position="relative"
                zIndex={1}
              >
                <Box>
                  <HStack spacing={2} wrap="wrap">
                    <Badge px={3} py={1} borderRadius="full" bg="rgba(51, 67, 113, 0.10)" color={PRIMARY_900}>
                      Trung tâm báo cáo tuyển dụng
                    </Badge>
                    <Badge px={3} py={1} borderRadius="full" bg="rgba(90, 108, 152, 0.14)" color={PRIMARY_900}>
                      Dữ liệu trực tiếp
                    </Badge>
                  </HStack>

                  <Text mt={3} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color={PRIMARY_900}>
                    {activeLabel}
                  </Text>
                  <Text mt={2} maxW="760px" fontSize="sm" color="gray.500">
                    {tabDescriptions[activeTab]}
                  </Text>

                  <HStack mt={4} spacing={3} wrap="wrap">
                    {statHighlights.map((item) => (
                      <Box
                        key={item.label}
                        px={3.5}
                        py={2}
                        borderRadius="14px"
                        bg="rgba(51, 67, 113, 0.06)"
                        border="1px solid"
                        borderColor={PRIMARY_300}
                      >
                        <Text fontSize="xs" fontWeight="600" color="gray.500">
                          {item.label}
                        </Text>
                        <Text mt={0.5} fontSize="md" fontWeight="800" color={PRIMARY_900}>
                          {item.value}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                </Box>

                <VStack align={{ base: "stretch", xl: "flex-end" }} spacing={3}>
                  <HStack spacing={2} wrap="wrap" justify={{ base: "flex-start", xl: "flex-end" }}>
                    {periodOptions.map((option) => {
                      const isActive = option === activePeriod;
                      return (
                        <Button
                          key={option}
                          size="sm"
                          borderRadius="12px"
                          border="1px solid"
                          borderColor={isActive ? PRIMARY : BORDER}
                          bg={isActive ? "rgba(51, 67, 113, 0.10)" : "white"}
                          color={isActive ? PRIMARY_900 : "gray.600"}
                          onClick={() => setActivePeriod(option)}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </HStack>

                  <HStack spacing={2} wrap="wrap" justify={{ base: "flex-start", xl: "flex-end" }}>
                    {scopeOptions.map((option) => {
                      const isActive = option === activeScope;
                      return (
                        <Button
                          key={option}
                          size="sm"
                          borderRadius="12px"
                          border="1px solid"
                          borderColor={isActive ? PRIMARY : BORDER}
                          bg={isActive ? "rgba(51, 67, 113, 0.10)" : "white"}
                          color={isActive ? PRIMARY_900 : "gray.600"}
                          onClick={() => setActiveScope(option)}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </HStack>

                  <Button
                    leftIcon={<DownloadIcon />}
                    h="42px"
                    px={5}
                    borderRadius="14px"
                    border="1px solid"
                    borderColor={PRIMARY}
                    bg={PRIMARY}
                    color="white"
                    _hover={{ bg: PRIMARY_900 }}
                    _active={{ bg: PRIMARY_900 }}
                  >
                    Xuất báo cáo
                  </Button>
                </VStack>
              </Flex>
            </Box>

            <Box
              maxH={{ base: "none", lg: isOverviewTab ? "calc(100vh - 320px)" : "none" }}
              overflowY={{ base: "visible", lg: isOverviewTab ? "auto" : "visible" }}
              pr={{ base: 0, lg: isOverviewTab ? 1 : 0 }}
              className={isOverviewTab ? "hide-scrollbar" : undefined}
            >
              {renderContent()}
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}