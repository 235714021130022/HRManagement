import { Badge, Box, Grid, GridItem, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Legend } from "recharts";
import { theme } from "../../../theme";
import type { DashboardRejectedData } from "../types";
import SectionCard from "./SectionCard";

type RejectedReportProps = {
  data?: DashboardRejectedData;
  isLoading?: boolean;
  isError?: boolean;
};

const COLORS = [
  theme.colors.charts.PRIMARY_700,
  theme.colors.charts.PRIMARY_500,
  theme.colors.charts.PRIMARY_400,
  theme.colors.charts.PRIMARY_300,
  theme.colors.charts.PRIMARY_200,
  "#7C8DB0",
  "#9BACD0",
];

export default function RejectedCandidatesReport({ data, isLoading, isError }: RejectedReportProps) {
  if (isLoading && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="gray.600">Đang tải dữ liệu ứng viên bị loại...</Text>
      </Box>
    );
  }

  if (isError && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="red.500">Không thể tải dữ liệu ứng viên bị loại.</Text>
      </Box>
    );
  }

  const totals = data?.totals || { totalInPeriod: 0, totalRejected: 0, rejectionRate: 0 };

  const summaryCards = [
    { title: "Tổng hồ sơ", value: String(totals.totalInPeriod), note: "Tất cả hồ sơ trong kỳ" },
    { title: "Bị loại", value: String(totals.totalRejected), note: "Ứng viên bị đánh dấu loại" },
    { title: "Tỷ lệ bị loại", value: `${totals.rejectionRate}%`, note: "Bị loại / Tổng hồ sơ" },
  ];

  const byRecruiter = data?.byRecruiter || [];
  const byPosition = data?.byPosition || [];
  const byDepartment = data?.byDepartment || [];
  const trend = data?.trend || [];
  const recentRejected = data?.recentRejected || [];

  return (
    <VStack align="stretch" spacing={5}>
      {/* Summary cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {summaryCards.map((card) => (
          <Box
            key={card.title}
            bg="white"
            border="1px solid"
            borderColor={theme.colors.charts.BORDER}
            borderRadius="16px"
            p={5}
          >
            <Text fontSize="xs" color="gray.500" mb={1}>{card.title}</Text>
            <Text fontSize="2xl" fontWeight="800" color={theme.colors.charts.PRIMARY}>{card.value}</Text>
            <Text fontSize="xs" color="gray.400" mt={1}>{card.note}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Charts row */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Xu hướng bị loại" subtitle="Tổng hồ sơ so với số bị loại theo thời gian">
            {trend.length === 0 ? (
              <Text fontSize="sm" color="gray.400">Chưa có dữ liệu xu hướng</Text>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke={theme.colors.charts.PRIMARY_400} strokeWidth={2} dot={false} name="Tổng" />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} dot={false} name="Bị loại" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Bị loại theo vị trí" subtitle="Các vị trí có số lượng bị loại cao nhất">
            {byPosition.length === 0 ? (
              <Text fontSize="sm" color="gray.400">Chưa có dữ liệu</Text>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byPosition.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="position" type="category" tick={{ fontSize: 10 }} width={110} />
                  <RechartsTooltip />
                  <Bar dataKey="rejected" name="Bị loại" radius={[0, 6, 6, 0]}>
                    {byPosition.slice(0, 7).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </GridItem>
      </Grid>

      {/* By Recruiter + By Department */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Theo recruiter" subtitle="Số lượng và tỷ lệ bị loại theo recruiter">
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Người phụ trách</Th>
                    <Th isNumeric>Tổng</Th>
                    <Th isNumeric>Bị loại</Th>
                    <Th isNumeric>Tỷ lệ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {byRecruiter.length === 0 ? (
                    <Tr><Td colSpan={4}><Text fontSize="sm" color="gray.400" textAlign="center">Chưa có dữ liệu</Text></Td></Tr>
                  ) : (
                    byRecruiter.map((r) => (
                      <Tr key={r.id}>
                        <Td fontWeight="600">{r.name}</Td>
                        <Td isNumeric>{r.total}</Td>
                        <Td isNumeric color="red.500" fontWeight="600">{r.rejected}</Td>
                        <Td isNumeric>
                          <Badge colorScheme={r.rejectionRate >= 60 ? "red" : r.rejectionRate >= 30 ? "yellow" : "green"}>
                            {r.rejectionRate}%
                          </Badge>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Theo phòng ban" subtitle="Số lượng và tỷ lệ bị loại theo phòng ban">
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Phòng ban</Th>
                    <Th isNumeric>Tổng</Th>
                    <Th isNumeric>Bị loại</Th>
                    <Th isNumeric>Tỷ lệ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {byDepartment.length === 0 ? (
                    <Tr><Td colSpan={4}><Text fontSize="sm" color="gray.400" textAlign="center">Chưa có dữ liệu</Text></Td></Tr>
                  ) : (
                    byDepartment.map((d) => (
                      <Tr key={d.department}>
                        <Td fontWeight="600">{d.department}</Td>
                        <Td isNumeric>{d.total}</Td>
                        <Td isNumeric color="red.500" fontWeight="600">{d.rejected}</Td>
                        <Td isNumeric>
                          <Badge colorScheme={d.rejectionRate >= 60 ? "red" : d.rejectionRate >= 30 ? "yellow" : "green"}>
                            {d.rejectionRate}%
                          </Badge>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </SectionCard>
        </GridItem>
      </Grid>

      {/* Recent rejected list */}
      <SectionCard title="Ứng viên bị loại gần đây" subtitle="20 ứng viên mới nhất được đánh dấu bị loại">
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Mã</Th>
                <Th>Ứng viên</Th>
                <Th>Email</Th>
                <Th>Số điện thoại</Th>
                <Th>Vị trí</Th>
                <Th>Phòng ban</Th>
                <Th>Người phụ trách</Th>
                <Th>Ghi chú</Th>
                <Th>Thời điểm bị loại</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentRejected.length === 0 ? (
                <Tr>
                  <Td colSpan={9}>
                    <Text fontSize="sm" color="gray.400" textAlign="center">Không có ứng viên bị loại trong kỳ này</Text>
                  </Td>
                </Tr>
              ) : (
                recentRejected.map((item) => (
                  <Tr key={item.candidateId}>
                    <Td fontWeight="600" color={theme.colors.charts.PRIMARY}>{item.candidateCode}</Td>
                    <Td fontWeight="600">{item.candidateName}</Td>
                    <Td color="gray.600" fontSize="xs">{item.email}</Td>
                    <Td color="gray.600" fontSize="xs">{item.phone}</Td>
                    <Td maxW="140px" isTruncated>{item.position}</Td>
                    <Td color="gray.600">{item.department}</Td>
                    <Td color="gray.600">{item.recruiter}</Td>
                    <Td color="gray.500" fontSize="xs" maxW="160px" isTruncated>{item.note || "—"}</Td>
                    <Td fontSize="xs" color="gray.500" whiteSpace="nowrap">
                      {new Date(item.rejectedAt).toLocaleDateString("en-GB")}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>
    </VStack>
  );
}