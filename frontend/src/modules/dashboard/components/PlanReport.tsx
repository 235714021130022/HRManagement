import { Badge, Box, Grid, GridItem, Progress, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { theme } from "../../../theme";
import type { DashboardPlanData } from "../types";
import SectionCard from "./SectionCard";

type PlanReportProps = {
  data?: DashboardPlanData;
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

function fillRateColor(rate: number) {
  if (rate >= 80) return "green";
  if (rate >= 40) return "yellow";
  return "red";
}

export default function PlanReport({ data, isLoading, isError }: PlanReportProps) {
  if (isLoading && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="gray.600">Đang tải dữ liệu kế hoạch...</Text>
      </Box>
    );
  }

  if (isError && !data) {
    return (
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="24px" p={6}>
          <Text fontWeight="700" color="red.500">Không thể tải dữ liệu kế hoạch.</Text>
      </Box>
    );
  }

  const totals = data?.totals || {
    totalRecruitments: 0,
    totalPlanned: 0,
    totalHired: 0,
    totalRemaining: 0,
    fillRate: 0,
  };

  const summaryCards = [
    { title: "Tổng tin tuyển dụng", value: String(totals.totalRecruitments), note: "Số chiến dịch tuyển dụng trong kỳ" },
    { title: "Kế hoạch tuyển", value: String(totals.totalPlanned), note: "Tổng số vị trí cần tuyển" },
    { title: "Đã tuyển", value: String(totals.totalHired), note: "Số ứng viên đạt đến hiện tại" },
    { title: "Tỷ lệ hoàn thành", value: `${totals.fillRate}%`, note: "Đã tuyển / Kế hoạch" },
  ];

  const byRecruitment = data?.byRecruitment || [];
  const byDepartment = data?.byDepartment || [];
  const byPosition = data?.byPosition || [];
  const activeBatches = data?.activeBatches || [];
  const postingChannels = data?.postingChannels || [];
  const trend = data?.trend || [];

  return (
    <VStack align="stretch" spacing={5}>
      {/* Summary cards */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
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

      {/* Overall progress bar */}
      <Box bg="white" border="1px solid" borderColor={theme.colors.charts.BORDER} borderRadius="16px" p={5}>
        <Text fontWeight="700" fontSize="sm" color={theme.colors.charts.PRIMARY} mb={3}>
          Tiến độ headcount tổng thể
        </Text>
        <Progress
          value={Math.min(totals.fillRate, 100)}
          colorScheme={fillRateColor(totals.fillRate)}
          borderRadius="full"
          size="lg"
          mb={2}
        />
        <Text fontSize="xs" color="gray.500">
          Đã tuyển {totals.totalHired}/{totals.totalPlanned} vị trí kế hoạch ({totals.fillRate}% hoàn thành)
        </Text>
      </Box>

      {/* Charts row */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Xu hướng kế hoạch và đã tuyển" subtitle="Tiến độ headcount theo tháng">
            {trend.length === 0 ? (
              <Text fontSize="sm" color="gray.400">Chưa có dữ liệu xu hướng</Text>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="planned" stroke={theme.colors.charts.PRIMARY_500} strokeWidth={2} dot={false} name="Kế hoạch" />
                  <Line type="monotone" dataKey="hired" stroke="#22c55e" strokeWidth={2} dot={false} name="Đã tuyển" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Kênh đăng tuyển" subtitle="Phân bố theo các job board">
            {postingChannels.length === 0 ? (
              <Text fontSize="sm" color="gray.400">Chưa có dữ liệu kênh đăng tuyển</Text>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={postingChannels} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="postCount" name="Số bài đăng" radius={[6, 6, 0, 0]}>
                    {postingChannels.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </GridItem>
      </Grid>

      {/* Active batches */}
      {activeBatches.length > 0 && (
        <SectionCard title="Đợt tuyển dụng đang hoạt động" subtitle="Các đợt sắp tới/đang chạy, sắp xếp theo hạn chót">
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Đợt</Th>
                  <Th>Tin tuyển</Th>
                  <Th>Từ ngày</Th>
                  <Th>Đến ngày</Th>
                  <Th isNumeric>Chỉ tiêu</Th>
                  <Th isNumeric>Còn lại</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeBatches.map((batch, idx) => (
                  <Tr key={idx}>
                    <Td fontWeight="600" maxW="180px" isTruncated>{batch.title}</Td>
                    <Td color="gray.600" maxW="160px" isTruncated>{batch.recruitmentTitle}</Td>
                    <Td color="gray.500">{batch.fromDate || "—"}</Td>
                    <Td color="gray.500">{batch.toDate || "—"}</Td>
                    <Td isNumeric>{batch.target}</Td>
                    <Td isNumeric>
                      <Badge colorScheme={batch.daysLeft <= 7 ? "red" : batch.daysLeft <= 14 ? "yellow" : "green"}>
                        {batch.daysLeft} ngày
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </SectionCard>
      )}

      {/* Recruitment progress table */}
      <SectionCard title="Tiến độ theo tin tuyển dụng" subtitle="Kế hoạch headcount so với thực tế tuyển của từng chiến dịch">
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Mã</Th>
                <Th>Tiêu đề</Th>
                <Th>Phòng ban</Th>
                <Th>Vị trí</Th>
                <Th>Người phụ trách</Th>
                <Th isNumeric>Kế hoạch</Th>
                <Th isNumeric>Đã tuyển</Th>
                <Th isNumeric>Còn thiếu</Th>
                <Th isNumeric>Tỷ lệ %</Th>
                <Th>Hạn chót</Th>
              </Tr>
            </Thead>
            <Tbody>
              {byRecruitment.length === 0 ? (
                <Tr>
                  <Td colSpan={10}>
                    <Text fontSize="sm" color="gray.400" textAlign="center">Chưa có dữ liệu</Text>
                  </Td>
                </Tr>
              ) : (
                byRecruitment.map((r) => (
                  <Tr key={r.id}>
                    <Td fontWeight="600" color={theme.colors.charts.PRIMARY}>{r.code}</Td>
                    <Td maxW="160px" isTruncated>{r.title}</Td>
                    <Td color="gray.600">{r.department}</Td>
                    <Td color="gray.600">{r.position}</Td>
                    <Td color="gray.600">{r.recruiter}</Td>
                    <Td isNumeric>{r.planned}</Td>
                    <Td isNumeric color="green.600" fontWeight="600">{r.hired}</Td>
                    <Td isNumeric color={r.remaining > 0 ? "orange.500" : "green.500"} fontWeight="600">{r.remaining}</Td>
                    <Td isNumeric>
                      <Badge colorScheme={fillRateColor(r.fillRate)}>{r.fillRate}%</Badge>
                    </Td>
                    <Td fontSize="xs" color="gray.500">{r.deadline || "—"}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>

      {/* Department + Position tables */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
        <GridItem>
          <SectionCard title="Theo phòng ban" subtitle="Tỷ lệ hoàn thành headcount theo phòng ban">
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Phòng ban</Th>
                    <Th isNumeric>Chiến dịch</Th>
                    <Th isNumeric>Kế hoạch</Th>
                    <Th isNumeric>Đã tuyển</Th>
                    <Th isNumeric>Tỷ lệ %</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {byDepartment.length === 0 ? (
                    <Tr>
                      <Td colSpan={5}><Text fontSize="sm" color="gray.400" textAlign="center">Chưa có dữ liệu</Text></Td>
                    </Tr>
                  ) : (
                    byDepartment.map((d) => (
                      <Tr key={d.department}>
                        <Td fontWeight="600">{d.department}</Td>
                        <Td isNumeric>{d.recruitments}</Td>
                        <Td isNumeric>{d.planned}</Td>
                        <Td isNumeric color="green.600" fontWeight="600">{d.hired}</Td>
                        <Td isNumeric>
                          <Badge colorScheme={fillRateColor(d.fillRate)}>{d.fillRate}%</Badge>
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
          <SectionCard title="Theo vị trí" subtitle="Tỷ lệ hoàn thành headcount theo vị trí tuyển dụng">
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Vị trí</Th>
                    <Th isNumeric>Chiến dịch</Th>
                    <Th isNumeric>Kế hoạch</Th>
                    <Th isNumeric>Đã tuyển</Th>
                    <Th isNumeric>Tỷ lệ %</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {byPosition.length === 0 ? (
                    <Tr>
                      <Td colSpan={5}><Text fontSize="sm" color="gray.400" textAlign="center">Chưa có dữ liệu</Text></Td>
                    </Tr>
                  ) : (
                    byPosition.map((p) => (
                      <Tr key={p.position}>
                        <Td fontWeight="600">{p.position}</Td>
                        <Td isNumeric>{p.recruitments}</Td>
                        <Td isNumeric>{p.planned}</Td>
                        <Td isNumeric color="green.600" fontWeight="600">{p.hired}</Td>
                        <Td isNumeric>
                          <Badge colorScheme={fillRateColor(p.fillRate)}>{p.fillRate}%</Badge>
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
    </VStack>
  );
}