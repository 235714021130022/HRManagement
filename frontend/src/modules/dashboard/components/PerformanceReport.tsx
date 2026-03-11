import { Box, Flex, Grid, GridItem, HStack, Progress, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { theme } from "../../../theme";
import type { DashboardPerformanceData } from "../types";
import SectionCard from "./SectionCard";

type PerformanceReportProps = {
  data?: DashboardPerformanceData;
  isLoading?: boolean;
  isError?: boolean;
};

const formatNum = (value: number) => value.toLocaleString("vi-VN");

const pipelineLabelMap: Record<string, string> = {
  Applied: "Đã ứng tuyển",
  Reviewing: "Đang sàng lọc",
  Contacted: "Đã liên hệ",
  Interviewing: "Phỏng vấn",
  "Waiting Response": "Chờ phản hồi",
  Accepted: "Đạt",
  Rejected: "Loại",
};

export default function PerformanceReport({ data, isLoading, isError }: PerformanceReportProps) {
  if (isLoading && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="gray.600">Đang tải dữ liệu hiệu quả...</Text>
      </Box>
    );
  }

  if (isError && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="red.500">Không thể tải dữ liệu hiệu quả.</Text>
      </Box>
    );
  }

  const totals = data?.totals || {
    totalApplications: 0,
    inProgress: 0,
    accepted: 0,
    rejected: 0,
    acceptRate: 0,
  };

  const summaryCards = [
    {
      title: "Tổng hồ sơ",
      value: formatNum(totals.totalApplications),
      note: "Số hồ sơ trong khoảng thời gian đã chọn",
    },
    {
      title: "Đang xử lý",
      value: formatNum(totals.inProgress),
      note: "Đang sàng lọc + Đã liên hệ + Phỏng vấn + Chờ phản hồi",
    },
    {
      title: "Đạt",
      value: formatNum(totals.accepted),
      note: "Số hồ sơ được đánh dấu đạt",
    },
    {
      title: "Tỷ lệ đạt",
      value: `${totals.acceptRate.toFixed(1)}%`,
      note: "Đạt / Tổng hồ sơ",
    },
  ];

  const pipelineData = data?.pipeline || [];
  const trendData = data?.trend || [];
  const recruiterData = data?.byRecruiter || [];
  const positionData = data?.byPosition || [];

  return (
    <VStack spacing={5} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5}>
        {summaryCards.map((item, index) => (
          <Box
            key={item.title}
            bg="white"
            border="1px solid"
            borderColor={index === 0 ? theme.colors.charts.PRIMARY_200 : theme.colors.charts.BORDER}
            borderRadius="24px"
            p={5}
            boxShadow="0 10px 24px rgba(26, 39, 68, 0.05)"
          >
            <Text fontSize="sm" fontWeight="600" color="gray.500">{item.title}</Text>
            <Text mt={3} fontSize="3xl" fontWeight="800" color="gray.800">{item.value}</Text>
            <Text mt={2} fontSize="sm" color="gray.500">{item.note}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1.1fr 0.9fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Tỷ lệ chuyển đổi pipeline" subtitle="Hiệu suất theo từng bước xử lý ứng viên">
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E7ECF4" />
                  <XAxis dataKey="label" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill={theme.colors.charts.PRIMARY_600} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <VStack mt={4} spacing={3} align="stretch">
              {pipelineData.map((item) => (
                <Box key={item.key}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="700" color="gray.700">{pipelineLabelMap[item.label] || item.label}</Text>
                    <HStack spacing={3}>
                      <Text fontSize="sm" color="gray.500">{item.conversionFromPrevious == null ? "-" : `${item.conversionFromPrevious.toFixed(1)}%`}</Text>
                      <Text minW="44px" textAlign="right" fontSize="sm" fontWeight="700" color="gray.800">{item.count}</Text>
                    </HStack>
                  </Flex>
                  <Progress
                    mt={2}
                    value={totals.totalApplications ? (item.count / totals.totalApplications) * 100 : 0}
                    borderRadius="full"
                    bg={theme.colors.charts.PRIMARY_200}
                    sx={{
                      '& > div': {
                        background: `linear-gradient(90deg, ${theme.colors.charts.PRIMARY_700} 0%, ${theme.colors.charts.PRIMARY_400} 100%)`,
                      },
                    }}
                  />
                </Box>
              ))}
            </VStack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Xu hướng kết quả" subtitle="Xu hướng hồ sơ theo tháng trong kỳ lọc">
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E7ECF4" />
                  <XAxis dataKey="month" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="total" stroke={theme.colors.charts.PRIMARY_700} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="accepted" stroke={theme.colors.charts.PRIMARY_500} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="rejected" stroke="#B5C0D9" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Hiệu suất theo recruiter" subtitle="Hiệu suất pipeline theo người phụ trách tuyển dụng">
            <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="20px">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Người phụ trách</Th>
                    <Th isNumeric>Tổng</Th>
                    <Th isNumeric>Đang xử lý</Th>
                    <Th isNumeric>Đạt</Th>
                    <Th isNumeric>Tỷ lệ đạt</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recruiterData.map((item) => (
                    <Tr key={item.id}>
                      <Td fontWeight="700" color="gray.800">{item.name}</Td>
                      <Td isNumeric>{item.total}</Td>
                      <Td isNumeric>{item.inProgress}</Td>
                      <Td isNumeric>{item.accepted}</Td>
                      <Td isNumeric>{item.acceptRate.toFixed(1)}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Hiệu suất theo vị trí" subtitle="Hiệu suất pipeline theo vị trí tuyển dụng">
            <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="20px">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Vị trí</Th>
                    <Th isNumeric>Tổng</Th>
                    <Th isNumeric>Đạt</Th>
                    <Th isNumeric>Loại</Th>
                    <Th isNumeric>Tỷ lệ đạt</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {positionData.map((item) => (
                    <Tr key={item.name}>
                      <Td fontWeight="700" color="gray.800">{item.name}</Td>
                      <Td isNumeric>{item.total}</Td>
                      <Td isNumeric>{item.accepted}</Td>
                      <Td isNumeric>{item.rejected}</Td>
                      <Td isNumeric>{item.acceptRate.toFixed(1)}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </SectionCard>
        </GridItem>
      </Grid>
    </VStack>
  );
}