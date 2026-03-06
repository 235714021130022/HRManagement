import { useMemo, useState } from "react";
import { Flex, Input, InputGroup, InputLeftElement, Spacer, Text, VStack, Select } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { ButtonConfig } from "../../../components/common/Button";
import { RECRUITMENT_STATUS_DISPLAY, RecruitmentStatus, type RecruitmentStatusType } from "../../../constant";
import { useGetInform } from "../api/get"; // sửa path đúng của bạn
import RecruitmentFeedCard from "../components/RecruitmentFeedCard";

export function Recruitment() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"All" | RecruitmentStatusType>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useGetInform({
    pages: page,
    limit,
    search: searchQuery, // nếu backend support search thì đẩy lên luôn
    status: statusFilter !== "All" ? statusFilter : undefined, // nếu backend support status
  });

  const list = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return list.filter((it) => {
      const okStatus = statusFilter === "All" ? true : it.status === statusFilter;

      const hay = `${it.post_title ?? ""} ${it.recruitment_code ?? ""} ${it.department_name ?? ""}`.toLowerCase();
      const okSearch = q ? hay.includes(q) : true;

      return okStatus && okSearch;
    });
  }, [list, statusFilter, searchQuery]);

  return (
    <VStack align="stretch">
      <Flex align="center" gap={4}>
        <ButtonConfig>ADD</ButtonConfig>
        <Spacer />

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

        <Flex flexDirection="column" mt={-6}>
          <Text fontSize="sm" color="gray.700">
            Status
          </Text>
          <Select
            w="180px"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
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

      <VStack align="stretch" spacing={3}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : isError ? (
          <Text color="red.500">Failed to load recruitments.</Text>
        ) : filtered.length === 0 ? (
          <Text color="gray.500">No results.</Text>
        ) : (
          filtered.map((item) => <RecruitmentFeedCard key={item.id} item={item} />)
        )}
      </VStack>
    </VStack>
  );
}