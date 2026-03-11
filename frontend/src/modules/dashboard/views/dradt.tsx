import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Progress,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

type StatCard = {
  title: string;
  value: string;
  change: string;
  note: string;
};

type ApplicationStatusItem = {
  name: string;
  value: number;
  color: string;
};

type TrendItem = {
  month: string;
  applications: number;
};

type CostItem = {
  type: string;
  amount: number;
};

type PlanProgressItem = {
  position: string;
  plan: number;
  hired: number;
};

type RecruitmentItem = {
  code: string;
  title: string;
  department: string;
  applications: number;
  status: "Active" | "Reviewing" | "Paused";
};

const PRIMARY = "#334371";
const PRIMARY_900 = "#243055";
const PRIMARY_700 = "#334371";
const PRIMARY_600 = "#415382";
const PRIMARY_500 = "#5A6C98";
const PRIMARY_400 = "#7E8DB2";
const PRIMARY_300 = "#A6B1CC";
const PRIMARY_200 = "#D9DFEC";
const BG_PAGE = "#F6F8FC";
const BORDER = "#E3E8F2";

const statCards: StatCard[] = [
  {
    title: "Total Recruitments",
    value: "28",
    change: "+12.4%",
    note: "6 campaigns opened this month",
  },
  {
    title: "Total Applications",
    value: "1,284",
    change: "+18.2%",
    note: "Average 45.8 candidates per role",
  },
  {
    title: "Accepted Candidates",
    value: "76",
    change: "+9.1%",
    note: "Hiring rate 5.9% overall",
  },
  {
    title: "Recruitment Cost",
    value: "148.5M",
    change: "-6.3%",
    note: "Average 1.95M per accepted candidate",
  },
];

const applicationStatusData: ApplicationStatusItem[] = [
  { name: "Applied", value: 520, color: PRIMARY_700 },
  { name: "Reviewing", value: 304, color: PRIMARY_600 },
  { name: "Contacted", value: 188, color: PRIMARY_500 },
  { name: "Waiting Response", value: 96, color: PRIMARY_400 },
  { name: "Accepted", value: 76, color: "#6E86B7" },
  { name: "Rejected", value: 100, color: "#B5C0D9" },
];

const applicationTrendData: TrendItem[] = [
  { month: "Jan", applications: 34 },
  { month: "Feb", applications: 52 },
  { month: "Mar", applications: 46 },
  { month: "Apr", applications: 68 },
  { month: "May", applications: 58 },
  { month: "Jun", applications: 74 },
  { month: "Jul", applications: 80 },
  { month: "Aug", applications: 72 },
  { month: "Sep", applications: 90 },
  { month: "Oct", applications: 84 },
  { month: "Nov", applications: 98 },
  { month: "Dec", applications: 110 },
];

const recruitmentCostData: CostItem[] = [
  { type: "Job Boards", amount: 56 },
  { type: "Social Ads", amount: 34 },
  { type: "Referral Bonus", amount: 28 },
  { type: "Events", amount: 18 },
  { type: "Other", amount: 12.5 },
];

const planProgressData: PlanProgressItem[] = [
  { position: "Backend Developer", plan: 12, hired: 8 },
  { position: "Frontend Developer", plan: 10, hired: 7 },
  { position: "UI/UX Designer", plan: 6, hired: 4 },
  { position: "QA Engineer", plan: 8, hired: 5 },
  { position: "Business Analyst", plan: 5, hired: 2 },
];

const recentRecruitments: RecruitmentItem[] = [
  {
    code: "REC-24031",
    title: "Senior Backend Developer",
    department: "Technology",
    applications: 124,
    status: "Active",
  },
  {
    code: "REC-24032",
    title: "UI/UX Designer",
    department: "Product Design",
    applications: 78,
    status: "Active",
  },
  {
    code: "REC-24033",
    title: "HR Executive",
    department: "Human Resources",
    applications: 56,
    status: "Reviewing",
  },
  {
    code: "REC-24034",
    title: "QA Automation Engineer",
    department: "Technology",
    applications: 92,
    status: "Paused",
  },
];

const getStatusBadgeStyles = (status: RecruitmentItem["status"]) => {
  switch (status) {
    case "Active":
      return {
        bg: "rgba(51, 67, 113, 0.10)",
        color: PRIMARY_700,
      };
    case "Reviewing":
      return {
        bg: "rgba(90, 108, 152, 0.12)",
        color: PRIMARY_600,
      };
    case "Paused":
      return {
        bg: "rgba(166, 177, 204, 0.25)",
        color: PRIMARY_500,
      };
    default:
      return {
        bg: "gray.100",
        color: "gray.700",
      };
  }
};

const SectionCard = ({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor={BORDER}
      borderRadius="24px"
      p={{ base: 4, md: 6 }}
      boxShadow="0 10px 30px rgba(26, 39, 68, 0.06)"
    >
      <Flex
        mb={6}
        gap={3}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        direction={{ base: "column", md: "row" }}
      >
        <Box>
          <Text fontSize="lg" fontWeight="700" color="gray.800">
            {title}
          </Text>
          {subtitle && (
            <Text mt={1} fontSize="sm" color="gray.500">
              {subtitle}
            </Text>
          )}
        </Box>
        {right}
      </Flex>
      {children}
    </Box>
  );
};

type ReportTabKey =
  | "dashboard"
  | "performance"
  | "cost"
  | "plan"
  | "rejected"
  | "settings";

const sidebarItems: {
  key: ReportTabKey;
  label: string;
  icon: string;
}[] = [
  { key: "dashboard", label: "Tổng quan", icon: "▥" },
  { key: "performance", label: "Hiệu quả", icon: "◫" },
  { key: "cost", label: "Chi phí", icon: "◌" },
  { key: "plan", label: "Kế hoạch", icon: "◔" },
  { key: "rejected", label: "Ứng viên bị loại", icon: "◡" },
  { key: "settings", label: "Thiết lập dữ liệu", icon: "◫" },
];

const EmptyPlaceholder = ({ title, description }: { title: string; description: string }) => (
  <Box
    bg="white"
    border="1px solid"
    borderColor={BORDER}
    borderRadius="24px"
    p={{ base: 6, md: 8 }}
    boxShadow="0 10px 30px rgba(26, 39, 68, 0.06)"
  >
    <VStack spacing={3} align="start">
      <Text fontSize="2xl" fontWeight="800" color={PRIMARY_900}>
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="700px">
        {description}
      </Text>
      <Box
        mt={4}
        w="full"
        minH="260px"
        borderRadius="20px"
        border="1px dashed"
        borderColor={PRIMARY_200}
        bg="rgba(51, 67, 113, 0.03)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color={PRIMARY_500} fontWeight="700">
          Khu vực nội dung báo cáo
        </Text>
      </Box>
    </VStack>
  </Box>
);

const DashboardOverview = () => {
  const totalApplications = applicationStatusData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <VStack spacing={5} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5}>
        {statCards.map((item, index) => (
          <Box
            key={item.title}
            bg="white"
            border="1px solid"
            borderColor={index === 0 ? PRIMARY_200 : BORDER}
            borderRadius="24px"
            p={5}
            boxShadow="0 10px 24px rgba(26, 39, 68, 0.05)"
          >
            <Flex justify="space-between" align="flex-start" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="600" color="gray.500">
                  {item.title}
                </Text>
                <Text mt={3} fontSize="3xl" fontWeight="800" color="gray.800">
                  {item.value}
                </Text>
              </Box>

              <Box
                w="46px"
                h="46px"
                borderRadius="18px"
                bg={index % 2 === 0 ? PRIMARY : PRIMARY_500}
                opacity={0.95}
              />
            </Flex>

            <HStack mt={5} justify="space-between" align="flex-start" spacing={3}>
              <Box
                px={3}
                py={1.5}
                borderRadius="full"
                bg="rgba(51, 67, 113, 0.08)"
                color={PRIMARY}
                fontSize="sm"
                fontWeight="700"
              >
                {item.change}
              </Box>
              <Text flex="1" textAlign="right" fontSize="sm" color="gray.400">
                {item.note}
              </Text>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1.3fr 0.9fr" }} gap={5}>
        <GridItem>
          <SectionCard
            title="Application Trend"
            subtitle="Số lượng hồ sơ ứng tuyển theo từng tháng"
            right={
              <Badge
                borderRadius="full"
                px={3}
                py={1.5}
                bg="gray.100"
                color="gray.600"
                fontSize="xs"
              >
                Updated 5 mins ago
              </Badge>
            }
          >
            <Box h="320px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationTrendData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E7ECF4" />
                  <XAxis dataKey="month" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke={PRIMARY}
                    strokeWidth={3}
                    dot={{ r: 4, fill: PRIMARY }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Application Status"
            subtitle="Phân bổ hồ sơ theo trạng thái hiện tại"
          >
            <Box h="250px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={4}
                  >
                    {applicationStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <VStack mt={4} spacing={3} align="stretch">
              {applicationStatusData.map((item) => {
                const percent = ((item.value / totalApplications) * 100).toFixed(1);
                return (
                  <Flex key={item.name} justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Box w="10px" h="10px" borderRadius="full" bg={item.color} />
                      <Text fontSize="sm" fontWeight="600" color="gray.600">
                        {item.name}
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Text fontSize="sm" color="gray.500">
                        {percent}%
                      </Text>
                      <Text minW="44px" textAlign="right" fontSize="sm" fontWeight="700" color="gray.800">
                        {item.value}
                      </Text>
                    </HStack>
                  </Flex>
                );
              })}
            </VStack>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard
            title="Recruitment Cost Breakdown"
            subtitle="Chi phí tuyển dụng theo từng nhóm"
            right={
              <Box
                px={4}
                py={2}
                borderRadius="18px"
                bg="rgba(51, 67, 113, 0.08)"
                color={PRIMARY}
                fontSize="sm"
                fontWeight="700"
              >
                148.5M total
              </Box>
            }
          >
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recruitmentCostData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E7ECF4" />
                  <XAxis dataKey="type" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                    {recruitmentCostData.map((_, index) => {
                      const palette = [PRIMARY_700, PRIMARY_600, PRIMARY_500, PRIMARY_400, PRIMARY_300];
                      return <Cell key={index} fill={palette[index % palette.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Recruitment Plan Progress"
            subtitle="Tiến độ tuyển thực tế so với kế hoạch"
            right={
              <Badge borderRadius="full" px={3} py={1.5} bg="gray.100" color="gray.600">
                5 key roles
              </Badge>
            }
          >
            <VStack spacing={4} align="stretch">
              {planProgressData.map((item) => {
                const percent = Math.round((item.hired / item.plan) * 100);
                return (
                  <Box key={item.position} border="1px solid" borderColor="gray.100" borderRadius="20px" p={4}>
                    <Flex justify="space-between" gap={3} align="flex-start">
                      <Box>
                        <Text fontWeight="700" color="gray.800">
                          {item.position}
                        </Text>
                        <Text mt={1} fontSize="sm" color="gray.500">
                          Plan {item.plan} · Hired {item.hired} · Remaining {item.plan - item.hired}
                        </Text>
                      </Box>
                      <Box
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="rgba(51, 67, 113, 0.08)"
                        color={PRIMARY}
                        fontSize="sm"
                        fontWeight="700"
                      >
                        {percent}%
                      </Box>
                    </Flex>
                    <Progress
                      mt={4}
                      value={percent}
                      borderRadius="full"
                      bg={PRIMARY_200}
                      sx={{
                        '& > div': {
                          background: `linear-gradient(90deg, ${PRIMARY_700} 0%, ${PRIMARY_400} 100%)`,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </VStack>
          </SectionCard>
        </GridItem>
      </Grid>

      <SectionCard
        title="Recent Recruitment Listings"
        subtitle="Danh sách tin tuyển gần đây để theo dõi nhanh tình hình tuyển dụng"
        right={
          <Button
            bg={PRIMARY}
            color="white"
            borderRadius="16px"
            _hover={{ bg: PRIMARY_900 }}
            _active={{ bg: PRIMARY_900 }}
          >
            View all recruitments
          </Button>
        }
      >
        <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="22px">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th color="gray.500">Code</Th>
                <Th color="gray.500">Position</Th>
                <Th color="gray.500">Department</Th>
                <Th color="gray.500">Applications</Th>
                <Th color="gray.500">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentRecruitments.map((item) => {
                const badgeStyle = getStatusBadgeStyles(item.status);
                return (
                  <Tr key={item.code}>
                    <Td fontWeight="700" color="gray.800">
                      {item.code}
                    </Td>
                    <Td color="gray.700">{item.title}</Td>
                    <Td color="gray.600">{item.department}</Td>
                    <Td color="gray.700">{item.applications}</Td>
                    <Td>
                      <Badge
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        bg={badgeStyle.bg}
                        color={badgeStyle.color}
                        textTransform="none"
                        fontSize="xs"
                      >
                        {item.status}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>
    </VStack>
  );
};

const PerformanceReport = () => (
  <EmptyPlaceholder
    title="Hiệu quả tuyển dụng"
    description="Tab này bạn có thể nhét các khối như tỷ lệ accepted, tỷ lệ rejected, số hồ sơ theo vị trí tuyển và xu hướng xử lý hồ sơ theo thời gian."
  />
);

const CostReport = () => (
  <EmptyPlaceholder
    title="Chi phí tuyển dụng"
    description="Tab này dành cho breakdown chi phí theo cost type, theo tin tuyển, theo tháng, và chỉ số cost per accepted candidate."
  />
);

const PlanReport = () => (
  <EmptyPlaceholder
    title="Kế hoạch tuyển dụng"
    description="Tab này dùng để hiển thị số lượng kế hoạch, đã tuyển được bao nhiêu, còn thiếu bao nhiêu và tiến độ theo từng vị trí tuyển."
  />
);

const RejectedCandidatesReport = () => (
  <EmptyPlaceholder
    title="Ứng viên bị loại"
    description="Tab này có thể hiển thị số lượng rejected theo vị trí, theo thời gian, theo recruiter phụ trách hoặc bảng danh sách hồ sơ bị loại gần đây."
  />
);

const ReportSettings = () => (
  <EmptyPlaceholder
    title="Thiết lập dữ liệu"
    description="Tab này phù hợp để cài filter mặc định, khoảng thời gian xem báo cáo, chọn phòng ban, chọn trạng thái cần thống kê hoặc đồng bộ dữ liệu báo cáo."
  />
);

export default function RecruitmentDashboardMockupTSX() {
  const [activeTab, setActiveTab] = React.useState<ReportTabKey>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "performance":
        return <PerformanceReport />;
      case "cost":
        return <CostReport />;
      case "plan":
        return <PlanReport />;
      case "rejected":
        return <RejectedCandidatesReport />;
      case "settings":
        return <ReportSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  const activeLabel = sidebarItems.find((item) => item.key === activeTab)?.label;

  return (
    <Box minH="100vh" bg={BG_PAGE} px={{ base: 3, md: 5 }} py={4}>
      <Flex maxW="1540px" mx="auto" gap={{ base: 3, md: 5 }} align="stretch">
        <Box
          w={{ base: "72px", md: "92px" }}
          bg="white"
          border="1px solid"
          borderColor={BORDER}
          borderRadius="28px"
          boxShadow="0 12px 34px rgba(26, 39, 68, 0.06)"
          py={4}
          px={3}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          minH="calc(100vh - 32px)"
          position="sticky"
          top="16px"
        >
          <VStack spacing={4}>
            {sidebarItems.map((item) => {
              const isActive = item.key === activeTab;
              return (
                <Button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  w="56px"
                  h="56px"
                  minW="56px"
                  borderRadius="18px"
                  bg={isActive ? "rgba(51, 67, 113, 0.10)" : "transparent"}
                  color={isActive ? "#2F6FE4" : "gray.500"}
                  border="1px solid"
                  borderColor={isActive ? "rgba(47,111,228,0.08)" : "transparent"}
                  fontSize="24px"
                  _hover={{ bg: isActive ? "rgba(51, 67, 113, 0.10)" : "gray.50" }}
                  _active={{ bg: isActive ? "rgba(51, 67, 113, 0.12)" : "gray.100" }}
                  title={item.label}
                >
                  {item.icon}
                </Button>
              );
            })}
          </VStack>
        </Box>

        <Box flex="1" minW={0}>
          <VStack spacing={5} align="stretch">
            <Box
              bg="white"
              border="1px solid"
              borderColor={BORDER}
              borderRadius="28px"
              px={{ base: 5, md: 7 }}
              py={{ base: 5, md: 6 }}
              boxShadow="0 12px 34px rgba(26, 39, 68, 0.06)"
            >
              <Flex
                direction={{ base: "column", xl: "row" }}
                align={{ base: "stretch", xl: "center" }}
                justify="space-between"
                gap={5}
              >
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    letterSpacing="0.18em"
                    textTransform="uppercase"
                    color={PRIMARY_500}
                  >
                    Recruitment Report Center
                  </Text>
                  <Text mt={2} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color={PRIMARY_900}>
                    {activeLabel}
                  </Text>
                  <Text mt={2} maxW="760px" fontSize="sm" color="gray.500">
                    Giao diện chia theo tab để đỡ cuộn dài, dễ mở rộng về sau và đúng chất admin SaaS cho đồ án tốt nghiệp.
                  </Text>
                </Box>

                <HStack spacing={3} flexWrap="wrap" align="stretch">
                  {[
                    { label: "This month", filled: false },
                    { label: "All departments", filled: false },
                    { label: "Export report", filled: true },
                  ].map((item) => (
                    <Button
                      key={item.label}
                      h="42px"
                      px={5}
                      borderRadius="16px"
                      border="1px solid"
                      borderColor={item.filled ? PRIMARY : BORDER}
                      bg={item.filled ? PRIMARY : "white"}
                      color={item.filled ? "white" : "gray.600"}
                      _hover={{
                        bg: item.filled ? PRIMARY_900 : "gray.50",
                      }}
                      _active={{
                        bg: item.filled ? PRIMARY_900 : "gray.100",
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </HStack>
              </Flex>
            </Box>

            {renderContent()}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
