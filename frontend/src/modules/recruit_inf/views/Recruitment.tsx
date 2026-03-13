import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spacer,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import { ButtonConfig } from "../../../components/common/Button";
import { PaginationBar } from "../../../components/common/PaginationBar";
import {
  RECRUITMENT_STATUS_DISPLAY,
  RecruitmentStatus,
  type RecruitmentStatusType,
} from "../../../constant";
import { RECRUIT_BASE_ROLE } from "../../../constant/roles";
import { recruitmentInforAddUrl } from "../../../routes/urls";

import { useAuthStore } from "../../auth/store/auth.store";
import { useGetCompanies } from "../../inform_company/api/get_company";
import { useGetInform } from "../api/get";
import RecruitmentFeedCard from "../components/RecruitmentFeedCard";

export function Recruitment() {
  const navigate = useNavigate();
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const canFilterByCompany = hasAnyRole([
    RECRUIT_BASE_ROLE.Admin,
    RECRUIT_BASE_ROLE.Employee,
  ]);

  const stickyBg = useColorModeValue("white", "gray.800");
  const pageHintColor = useColorModeValue("gray.500", "gray.400");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [statusFilter, setStatusFilter] = useState<"All" | RecruitmentStatusType>("All");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDepartmentId =
    canFilterByCompany && companyFilter !== "all" ? companyFilter : undefined;

  const { data, isLoading, isError } = useGetInform({
    pages: page,
    limit,
    search: searchQuery.trim() || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    department_id: selectedDepartmentId,
  });

  const { data: companyData } = useGetCompanies(
    { page: 1, limit: 500 },
    { enabled: canFilterByCompany }
  );

  const list = data?.data ?? [];
  const pagination = data?.pagination;

  const companyOptions = useMemo(() => {
    if (!canFilterByCompany) return [] as Array<{ id: string; name: string }>;

    return (companyData?.data ?? [])
      .map((it) => ({
        id: it.id,
        name: (it.full_name ?? it.acronym_name ?? "").trim(),
      }))
      .filter((it) => Boolean(it.id && it.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [canFilterByCompany, companyData?.data]);

  useEffect(() => {
    if (!canFilterByCompany && companyFilter !== "all") {
      setCompanyFilter("all");
      setPage(1);
    }
  }, [canFilterByCompany, companyFilter]);

  return (
    <VStack align="stretch" spacing={4} h="calc(100vh - 170px)" minH={0}>
      <Box position="sticky" top={0} zIndex={2} bg={stickyBg} pb={2}>
        <Flex align={{ base: "stretch", md: "center" }} gap={4} wrap="wrap">
          <ButtonConfig onClick={() => navigate(recruitmentInforAddUrl)}>ADD</ButtonConfig>
          <Spacer display={{ base: "none", md: "block" }} />

          <InputGroup w={{ base: "100%", md: "400px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon />
            </InputLeftElement>
            <Input
              placeholder="Search by recruitment name, code, ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>

          {canFilterByCompany && (
            <Flex flexDirection="column">
              <Text fontSize="sm" color="gray.700">
                Company
              </Text>
              <Select
                w={{ base: "100%", md: "220px" }}
                value={companyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All companies</option>
                {companyOptions.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </Flex>
          )}

          <Flex flexDirection="column">
            <Text fontSize="sm" color="gray.700">
              Status
            </Text>
            <Select
              w={{ base: "100%", md: "180px" }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "All" | RecruitmentStatusType);
                setPage(1);
              }}
            >
              <option value="All">All status</option>
              {Object.values(RecruitmentStatus).map((v) => (
                <option key={v} value={v}>
                  {RECRUITMENT_STATUS_DISPLAY[v as RecruitmentStatusType]}
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>
      </Box>

      <Box flex={1} minH={0} overflowY="auto" pr={1}>
        <VStack align="stretch" spacing={3}>
          {isLoading ? (
            <Text>Loading...</Text>
          ) : isError ? (
            <Text color="red.500">Failed to load recruitments.</Text>
          ) : list.length === 0 ? (
            <Text color="gray.500">No results.</Text>
          ) : (
            list.map((item) => <RecruitmentFeedCard key={item.id} item={item} />)
          )}
        </VStack>
      </Box>


      <PaginationBar
        total={pagination?.totalItems ?? 0}
        page={page}
        perPage={limit}
        onPageChange={(nextPage) => setPage(nextPage)}
        onPerPageChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </VStack>
  );
}
