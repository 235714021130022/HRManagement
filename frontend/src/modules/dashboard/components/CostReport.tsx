import { Box, Grid, GridItem, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { theme } from "../../../theme";
import type { DashboardCostData } from "../types";
import SectionCard from "./SectionCard";

type CostReportProps = {
  data?: DashboardCostData;
  isLoading?: boolean;
  isError?: boolean;
};

const formatNumber = (value: number) => value.toLocaleString("vi-VN");

const formatMoney = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(1);
};

export default function CostReport({ data, isLoading, isError }: CostReportProps) {
  if (isLoading && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="gray.600">Đang tải dữ liệu chi phí...</Text>
      </Box>
    );
  }

  if (isError && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="red.500">Không thể tải dữ liệu chi phí.</Text>
      </Box>
    );
  }

  const totals = data?.totals || {
    totalCost: 0,
    totalRecruitmentsWithCost: 0,
    totalAccepted: 0,
    costPerAccepted: 0,
  };

  const summaryCards = [
    {
      title: "Tổng chi phí",
      value: formatMoney(totals.totalCost),
      note: "Tổng chi phí tuyển dụng trong kỳ đã chọn",
    },
    {
      title: "Tin tuyển có chi phí",
      value: formatNumber(totals.totalRecruitmentsWithCost),
      note: "Các chiến dịch đã ghi nhận phát sinh chi phí",
    },
    {
      title: "Ứng viên đạt",
      value: formatNumber(totals.totalAccepted),
      note: "Số ứng viên đạt trong kỳ đã chọn",
    },
    {
      title: "Chi phí / ứng viên đạt",
      value: formatMoney(totals.costPerAccepted),
      note: "Chi phí trung bình cho mỗi ứng viên đạt",
    },
  ];

  const byType = data?.byType || [];
  const trend = data?.trend || [];
  const byDepartment = data?.byDepartment || [];
  const byRecruiter = data?.byRecruiter || [];
  const topRecruitments = data?.topRecruitments || [];

  const palette = [
    theme.colors.charts.PRIMARY_700,
    theme.colors.charts.PRIMARY_600,
    theme.colors.charts.PRIMARY_500,
    theme.colors.charts.PRIMARY_400,
    theme.colors.charts.PRIMARY_300,
  ];

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

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Cơ cấu chi phí theo loại" subtitle="Tỷ trọng chi phí theo nhóm chi phí">
            <Box h="320px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byType}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E7ECF4" />
                  <XAxis dataKey="type" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                    {byType.map((_, index) => (
                      <Cell key={index} fill={palette[index % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Xu hướng chi phí và số đạt" subtitle="Biến động chi phí và số ứng viên đạt theo tháng">
            <Box h="320px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E7ECF4" />
                  <XAxis dataKey="month" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#718096", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Line yAxisId="left" type="monotone" dataKey="cost" stroke={theme.colors.charts.PRIMARY_700} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="accepted" stroke={theme.colors.charts.PRIMARY_400} strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Hiệu quả chi phí theo phòng ban" subtitle="Hiệu quả sử dụng ngân sách theo phòng ban">
            <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="20px">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Phòng ban</Th>
                    <Th isNumeric>Chi phí</Th>
                    <Th isNumeric>Đạt</Th>
                    <Th isNumeric>Chi phí/Đạt</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {byDepartment.map((item) => (
                    <Tr key={item.department}>
                      <Td fontWeight="700" color="gray.800">{item.department}</Td>
                      <Td isNumeric>{formatMoney(item.amount)}</Td>
                      <Td isNumeric>{item.accepted}</Td>
                      <Td isNumeric>{formatMoney(item.costPerAccepted)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Hiệu quả chi phí theo người phụ trách" subtitle="Hiệu quả chi phí theo người phụ trách tuyển dụng">
            <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="20px">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Người phụ trách</Th>
                    <Th isNumeric>Chi phí</Th>
                    <Th isNumeric>Đạt</Th>
                    <Th isNumeric>Chi phí/Đạt</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {byRecruiter.map((item) => (
                    <Tr key={item.recruiter}>
                      <Td fontWeight="700" color="gray.800">{item.recruiter}</Td>
                      <Td isNumeric>{formatMoney(item.amount)}</Td>
                      <Td isNumeric>{item.accepted}</Td>
                      <Td isNumeric>{formatMoney(item.costPerAccepted)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </SectionCard>
        </GridItem>
      </Grid>

      <SectionCard title="Tin tuyển tốn chi phí cao nhất" subtitle="Những chiến dịch đang tiêu tốn ngân sách lớn nhất">
        <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="22px">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Mã</Th>
                <Th>Vị trí</Th>
                <Th>Phòng ban</Th>
                <Th isNumeric>Chi phí</Th>
                <Th isNumeric>Đạt</Th>
                <Th isNumeric>Chi phí/Đạt</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topRecruitments.map((item) => (
                <Tr key={`${item.code}-${item.title}`}>
                  <Td fontWeight="700" color="gray.800">{item.code}</Td>
                  <Td color="gray.700">{item.title}</Td>
                  <Td color="gray.600">{item.department}</Td>
                  <Td isNumeric color="gray.700">{formatMoney(item.amount)}</Td>
                  <Td isNumeric color="gray.700">{item.accepted}</Td>
                  <Td isNumeric color="gray.700">{formatMoney(item.costPerAccepted)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>
    </VStack>
  );
}