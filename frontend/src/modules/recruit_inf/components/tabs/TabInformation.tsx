import { useEffect, useState } from "react";
import {
  IconButton,
  Box,
  FormControl,
  Grid,
  GridItem,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Text,
  VStack,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useGetCompanies } from "../../../inform_company/api/get_company";
import { useGetRanks } from "../../../setting/rank/api/get";
import { useGetPositionPosts } from "../../../setting/position_post/api/get";
import { useGetEmployee } from "../../../employee/api/get_employee";
import RichTextEditorField from "../../../../components/common/RichTextEditorField";
import SearchCombobox from "../../../../components/common/SearchCombobox";
import RankModal from "../../../setting/rank/components/RankModal";
import AddPositionModal from "../../../setting/position_post/components/AddPositionModal";

const TYPE_OF_JOB_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Hybrid",
  "Remote",
] as const;

/* ── helpers ── */
function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const titleColor = useColorModeValue("#1F2937", "gray.100");
  const subtle = useColorModeValue("gray.500", "gray.400");
  const line = useColorModeValue("gray.200", "gray.700");

  return (
    <Box mb={6}>
      <Text fontWeight="700" fontSize="lg" color={titleColor} letterSpacing="0.2px">
        {title}
      </Text>

      {subtitle && (
        <Text fontSize="md" color={subtle} mt={1}>
          {subtitle}
        </Text>
      )}

      <Divider mt={3} borderColor={line} />
    </Box>
  );
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  const c = useColorModeValue("gray.700", "gray.200");

  return (
    <Text fontSize="md" fontWeight="600" color={c} mb={1.5}>
      {label}
      {required && (
        <Text as="span" color="red.500" ml={1}>
          *
        </Text>
      )}
    </Text>
  );
}

/* ── form state ── */
type FormState = {
  internal_title: string;
  post_title: string;
  department_id: string;
  rank_id: string;
  position_post_id: string;
  type_of_job: string;
  application_deadline: string;
  total_needed: string;
  salary_from: string;
  salary_to: string;
  salary_currency: string;
  auto_near: boolean;
  // Job content
  description_post: string;
  requirements_post: string;
  benefits_post: string;
  // Contact
  contact_person_id: string;
  contact_phone: string;
  contact_email: string;
};

export type RecruitmentInfoFormState = FormState;

interface TabThongTinProps {
  onFormChange?: (form: RecruitmentInfoFormState) => void;
}

const INIT: FormState = {
  internal_title: "",
  post_title: "",
  department_id: "",
  rank_id: "",
  position_post_id: "",
  type_of_job: "",
  application_deadline: "",
  total_needed: "1",
  salary_from: "0",
  salary_to: "0",
  salary_currency: "VND",
  auto_near: false,
  description_post: "",
  requirements_post: "",
  benefits_post: "",
  contact_person_id: "",
  contact_phone: "",
  contact_email: "",
};

/* ── main component ── */
export default function TabThongTin({ onFormChange }: TabThongTinProps) {
  const [form, setForm] = useState<FormState>(INIT);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderC = useColorModeValue("#E2E8F0", "gray.700");
  const subtle = useColorModeValue("gray.500", "gray.400");
  const inputBg = useColorModeValue("white", "gray.800");
  const inputBorder = useColorModeValue("#CBD5E1", "gray.600");
  const inputHoverBorder = useColorModeValue("#94A3B8", "gray.500");
  const primary = "#334371";

  const commonFieldSx = {
    bg: inputBg,
    borderColor: inputBorder,
    borderRadius: "6px",
    fontSize: "md",
    _hover: {
      borderColor: inputHoverBorder,
    },
    _focus: {
      borderColor: primary,
      boxShadow: "0 0 0 1px rgba(51, 67, 113, 0.35)",
    },
    _focusVisible: {
      borderColor: primary,
      boxShadow: "0 0 0 1px rgba(51, 67, 113, 0.35)",
    },
  };

  const sectionCardProps = {
    bg: cardBg,
    border: "1px solid",
    borderColor: borderC,
    borderRadius: "6px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
    p: { base: 4, md: 6 },
  };

  /* data sources */
  const { data: companyData } = useGetCompanies({ limit: 300 });
  const { data: rankData, refetch: refetchRanks } = useGetRanks({
    items_per_pages: 300,
  });
  const { data: positionData, refetch: refetchPositions } = useGetPositionPosts(
    {
      items_per_pages: 300,
      unit_id: form.department_id || undefined,
    },
    {
      enabled: Boolean(form.department_id),
    }
  );
  const { data: employeeData } = useGetEmployee({ limit: 300 });

  const companies = companyData?.data ?? [];
  const ranks = rankData?.data ?? [];
  const positions = positionData?.data ?? [];
  const employees = employeeData?.data ?? [];

  const departmentOptions = companies
    .map((item) => ({
      id: item.id,
      name: item.full_name ?? item.acronym_name ?? "",
    }))
    .filter((item) => Boolean(item.name));

  const rankOptions = ranks
    .map((item) => ({ id: item.id, name: item.name_rank ?? "" }))
    .filter((item) => Boolean(item.name));

  const positionOptions = positions
    .map((item) => ({ id: item.id, name: item.name_post ?? "" }))
    .filter((item) => Boolean(item.name));

  const selectedCompanyName =
    departmentOptions.find((c) => c.id === form.department_id)?.name ?? "";

  const typeOfJobOptions = TYPE_OF_JOB_OPTIONS.map((item) => ({
    id: item,
    name: item,
  }));

  const contactOptions = employees
    .map((item) => ({ id: item.id, name: item.employee_name ?? "" }))
    .filter((item) => Boolean(item.name));

  /* Auto-fill job content when selecting a position */
  useEffect(() => {
    if (!form.position_post_id) return;
    const found = positions.find((p) => p.id === form.position_post_id);
    if (!found) return;

    setForm((prev) => ({
      ...prev,
      description_post: found.description_post ?? "",
      requirements_post: found.requirements_post ?? "",
      benefits_post: found.benefits_post ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.position_post_id]);

  /* Auto-fill contact details when selecting an employee */
  useEffect(() => {
    if (!form.contact_person_id) return;
    const found = employees.find((e) => e.id === form.contact_person_id);
    if (!found) return;

    setForm((prev) => ({
      ...prev,
      contact_phone: found.phone_account ?? found.phone_unit ?? "",
      contact_email: found.email_account ?? found.email ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.contact_person_id]);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const salaryPreview = `From ${Number(form.salary_from || 0).toLocaleString(
    "en-US"
  )} ${form.salary_currency} to ${Number(form.salary_to || 0).toLocaleString(
    "en-US"
  )} ${form.salary_currency}`;

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  return (
    <Box minH="100%" py={1}>
      <VStack spacing={7} align="stretch">
        {/* ──────────── 1. GENERAL INFORMATION ──────────── */}
        <Box {...sectionCardProps}>
          <SectionHeader title="General Information" />

          <VStack spacing={6} align="stretch">
            {/* Internal title */}
            <FormControl>
              <FieldLabel label="Internal title" required />
              <Text fontSize="md" color={subtle} mb={2}>
                Title shown in internal system features and reports
              </Text>
              <Input
                {...commonFieldSx}
                h="48px"
                placeholder="Enter internal title..."
                value={form.internal_title}
                onChange={(e) => set("internal_title", e.target.value)}
              />
            </FormControl>

            {/* Posting title */}
            <FormControl>
              <FieldLabel label="Posting title" required />
              <Text fontSize="md" color={subtle} mb={2}>
                Title shown on recruitment channels (Website, Facebook, LinkedIn, ...)
              </Text>
              <Input
                {...commonFieldSx}
                h="48px"
                placeholder="Enter posting title..."
                value={form.post_title}
                onChange={(e) => set("post_title", e.target.value)}
              />
            </FormControl>

            {/* Branch + Rank */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
              <GridItem>
                <FieldLabel label="Company branch" required />
                <SearchCombobox
                  value={form.department_id}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      department_id: value,
                      position_post_id: "",
                      description_post: "",
                      requirements_post: "",
                      benefits_post: "",
                    }))
                  }
                  options={departmentOptions}
                  placeholder="Select branch"
                  size="md"
                />
              </GridItem>

              <GridItem>
                <FieldLabel label="Rank" />
                <HStack align="stretch" spacing={2}>
                  <Box flex={1}>
                    <SearchCombobox
                      value={form.rank_id}
                      onChange={(value) => set("rank_id", value)}
                      options={rankOptions}
                      placeholder="Select rank"
                      size="md"
                    />
                  </Box>
                  <IconButton
                    aria-label="Add rank"
                    icon={<AddIcon boxSize={4} />}
                    h="48px"
                    minW="48px"
                    size="md"
                    variant="outline"
                    borderRadius="6px"
                    borderColor={inputBorder}
                    bg={inputBg}
                    _hover={{
                      bg: useColorModeValue("gray.50", "gray.700"),
                      borderColor: inputHoverBorder,
                    }}
                    _active={{
                      bg: useColorModeValue("gray.100", "gray.600"),
                    }}
                    onClick={() => setIsRankModalOpen(true)}
                  />
                </HStack>
              </GridItem>
            </Grid>

            {/* Recruitment position */}
            <FormControl>
              <FieldLabel label="Recruitment position" required />
              <HStack align="stretch" spacing={2}>
                <Box flex={1}>
                  <SearchCombobox
                    value={form.position_post_id}
                    onChange={(value) => set("position_post_id", value)}
                    options={positionOptions}
                    placeholder={
                      form.department_id
                        ? "Select recruitment position"
                        : "Please select a company branch first"
                    }
                    isDisabled={!form.department_id}
                    size="md"
                  />
                </Box>

                <IconButton
                  aria-label="Add recruitment position"
                  icon={<AddIcon boxSize={4} />}
                  h="48px"
                  minW="48px"
                  size="md"
                  variant="outline"
                  borderRadius="6px"
                  borderColor={inputBorder}
                  bg={inputBg}
                  _hover={{
                    bg: useColorModeValue("gray.50", "gray.700"),
                    borderColor: inputHoverBorder,
                  }}
                  _active={{
                    bg: useColorModeValue("gray.100", "gray.600"),
                  }}
                  onClick={() => setIsPositionModalOpen(true)}
                />
              </HStack>

              {form.position_post_id && (
                <Box
                  mt={2.5}
                  px={3}
                  py={2.5}
                  borderRadius="6px"
                  bg="rgba(51, 67, 113, 0.05)"
                  border="1px solid rgba(51, 67, 113, 0.12)"
                >
                  <Text fontSize="md" color={primary}>
                    Description, requirements, and benefits were auto-filled from
                    this position. You can still edit them below.
                  </Text>
                </Box>
              )}
            </FormControl>

            {/* Employment type + Deadline + Quantity */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={5}>
              <GridItem>
                <FieldLabel label="Employment type" required />
                <SearchCombobox
                  value={form.type_of_job}
                  onChange={(value) => set("type_of_job", value)}
                  options={typeOfJobOptions as { id?: string; name?: string }[]}
                  placeholder="Select employment type"
                  size="md"
                />
              </GridItem>

              <GridItem>
                <FieldLabel label="Application deadline" required />
                <Input
                  {...commonFieldSx}
                  h="48px"
                  type="date"
                  value={form.application_deadline}
                  onChange={(e) => set("application_deadline", e.target.value)}
                />
              </GridItem>

              <GridItem>
                <FieldLabel label="Openings shown on website" required />
                <NumberInput
                  min={1}
                  value={form.total_needed}
                  onChange={(v) => set("total_needed", v)}
                >
                  <NumberInputField {...commonFieldSx} h="48px" />
                </NumberInput>
              </GridItem>
            </Grid>

            {/* Salary */}
            <Box>
              <Text fontWeight="700" fontSize="md" mb={4} color={useColorModeValue("#1F2937", "gray.100")}>
                Salary
              </Text>

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                gap={5}
                alignItems="end"
              >
                <GridItem>
                  <FieldLabel label="From" />
                  <NumberInput
                    min={0}
                    value={form.salary_from}
                    onChange={(v) => set("salary_from", v)}
                  >
                    <NumberInputField {...commonFieldSx} h="48px" />
                  </NumberInput>
                </GridItem>

                <GridItem>
                  <FieldLabel label="To" />
                  <NumberInput
                    min={0}
                    value={form.salary_to}
                    onChange={(v) => set("salary_to", v)}
                  >
                    <NumberInputField {...commonFieldSx} h="48px" />
                  </NumberInput>
                </GridItem>

                <GridItem>
                  <FieldLabel label="Currency" />
                  <Select
                    {...commonFieldSx}
                    h="48px"
                    value={form.salary_currency}
                    onChange={(e) => set("salary_currency", e.target.value)}
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </Select>
                </GridItem>
              </Grid>

              <Text fontSize="md" color={subtle} mt={3}>
                Display text: "{salaryPreview}"
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* ──────────── 2. JOB DESCRIPTION ──────────── */}
        <Box {...sectionCardProps}>
          <SectionHeader title="Job Description" />

          <VStack spacing={6} align="stretch">
            <Box>
              <RichTextEditorField
                label="General job description"
                required
                value={form.description_post || ""}
                onChange={(value) => set("description_post", value)}
                placeholder="Enter job description..."
                minHeight="220px"
              />
            </Box>

            <Box>
              <RichTextEditorField
                label="Job requirements"
                required
                value={form.requirements_post || ""}
                onChange={(value) => set("requirements_post", value)}
                placeholder="Enter job requirements..."
                minHeight="220px"
              />
            </Box>

            <Box>
              <RichTextEditorField
                label="Benefits"
                value={form.benefits_post || ""}
                onChange={(value) => set("benefits_post", value)}
                placeholder="Benefits candidates will receive if selected..."
                minHeight="180px"
              />
            </Box>
          </VStack>
        </Box>

        {/* ──────────── 3. CONTACT INFORMATION ──────────── */}
        <Box {...sectionCardProps}>
          <SectionHeader
            title="Contact Information"
            subtitle="This information will be shown on the recruitment post as the candidate contact point"
          />

          <VStack spacing={6} align="stretch">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
              <GridItem>
                <FieldLabel label="Contact person" />
                <SearchCombobox
                  value={form.contact_person_id}
                  onChange={(value) => set("contact_person_id", value)}
                  options={contactOptions}
                  placeholder="Select contact person"
                  size="md"
                />
              </GridItem>
            </Grid>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
              <GridItem>
                <FieldLabel label="Phone number" />
                <Input
                  {...commonFieldSx}
                  h="48px"
                  placeholder="Contact phone number"
                  value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                />
              </GridItem>

              <GridItem>
                <FieldLabel label="Email" />
                <Input
                  {...commonFieldSx}
                  h="48px"
                  placeholder="Contact email"
                  value={form.contact_email}
                  onChange={(e) => set("contact_email", e.target.value)}
                />
              </GridItem>
            </Grid>
          </VStack>
        </Box>

        <RankModal
          isOpen={isRankModalOpen}
          onClose={() => setIsRankModalOpen(false)}
          mode="add"
          onSuccess={() => {
            void refetchRanks();
          }}
        />

        <AddPositionModal
          isOpen={isPositionModalOpen}
          onClose={() => setIsPositionModalOpen(false)}
          companyId={form.department_id}
          companyName={selectedCompanyName}
          onSuccess={async (newId) => {
            await refetchPositions();
            setForm((prev) => ({ ...prev, position_post_id: newId }));
          }}
        />
      </VStack>
    </Box>
  );
}