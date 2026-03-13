import { useCallback, useState } from "react";
import {
  Box,
  ButtonGroup,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiChevronDown,
  FiDollarSign,
  FiEdit3,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { recruitmentInforUrl } from "../../../routes/urls";
import TabInformation, {
  type RecruitmentInfoFormState,
} from "../components/tabs/TabInformation";
import TabExecutionPlan, {
  type RecruitmentPlanFormState,
} from "../components/tabs/TabPlanRecruitemnt";
import TabRecruitmentCost, {
  type RecruitmentCostItemForm,
} from "../components/tabs/TabCostRecruitment";
import {
  RECRUITMENT_STATUS_DISPLAY,
  RecruitmentStatus,
  type RecruitmentStatusType,
} from "../../../constant";
import { useNotify } from "../../../components/notification/NotifyProvider";
import { useCreateRecInform } from "../api/create";
import theme from "../../../theme";

type TabId =
  | "information"
  | "execution-plan"
  | "application-form"
  | "career-page"
  | "recruitment-channels"
  | "workflow"
  | "committee"
  | "costs";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

const TAB_CONFIG: TabConfig[] = [
  { id: "information",    label: "Recruitment Information", icon: FiEdit3,      enabled: true  },
  { id: "execution-plan", label: "Execution Plan",          icon: FiCalendar,   enabled: true  },
  { id: "costs",          label: "Recruitment Costs",       icon: FiDollarSign, enabled: true  },
];

export default function RecruitmentAdd() {
  const navigate = useNavigate();
  const notify = useNotify();
  const { mutateAsync: createRecInform, isPending: isCreating } = useCreateRecInform();

  const [activeTab, setActiveTab] = useState<TabId>("information");
  const [publishStatus, setPublishStatus] = useState<RecruitmentStatusType>(
    RecruitmentStatus.Public,
  );
  const [infoForm, setInfoForm] = useState<RecruitmentInfoFormState | null>(null);
  const [planForm, setPlanForm] = useState<RecruitmentPlanFormState | null>(null);
  const [costItems, setCostItems] = useState<RecruitmentCostItemForm[]>([]);

  // ── colours (all hooks at top level) ──
  const bg             = useColorModeValue("white",    "gray.800");
  const borderColor    = useColorModeValue("gray.200", "gray.700");
  const activeBg       = useColorModeValue("blue.50",  "#334371");
  const activeTxt      = useColorModeValue("blue.600", "blue.200");
  const activeBorder   = useColorModeValue("blue.500", "blue.400");
  const disabledTxt    = useColorModeValue("gray.400", "gray.600");
  const normalTxt      = useColorModeValue("gray.700", "gray.200");
  const hoverBg        = useColorModeValue("gray.50",  "gray.750");
  const subtleTxt      = useColorModeValue("gray.500", "gray.400");

  const parseNumber = (value?: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  };

  const monthToDate = (monthValue?: string) => {
    if (!monthValue) return undefined;
    return `${monthValue}-01`;
  };

  const buildErrorMessage = (err: any) => {
    const d = err?.response?.data;
    if (Array.isArray(d?.message)) return d.message.join(", ");
    if (typeof d?.message === "string") return d.message;
    return "An error occurred while saving the recruitment posting";
  };

  const validateBaseInfo = (form: RecruitmentInfoFormState | null) => {
    if (!form) return "Please fill in recruitment information";
    if (!form.internal_title.trim()) return "Please enter an internal title";
    if (!form.post_title.trim()) return "Please enter a posting title";
    if (!form.department_id) return "Please select a company branch";
    if (!form.rank_id) return "Please select a rank";
    if (!form.position_post_id) return "Please select a recruitment position";
    if (!form.application_deadline) return "Please select an application deadline";
    return null;
  };

  const baseInfoError = validateBaseInfo(infoForm);
  const isBaseInfoCompleted = !baseInfoError;

  const handleTabChange = (tabId: TabId) => {
    const requiresBaseInfo = tabId === "execution-plan" || tabId === "costs";
    if (requiresBaseInfo && !isBaseInfoCompleted) {
      notify({
        message:
          baseInfoError ||
          "Please complete Recruitment Information before configuring execution plan and costs",
        type: "warning",
      });
      setActiveTab("information");
      return;
    }

    setActiveTab(tabId);
  };

  const submitRecruitment = async (status: RecruitmentStatusType) => {
    const validationError = validateBaseInfo(infoForm);
    if (validationError) {
      setActiveTab("information");
      notify({ message: validationError, type: "warning" });
      return;
    }

    if (!infoForm) return;

    const planBatches = (planForm?.plan_by_batches ? planForm.batches : [])
      .filter(
        (item) =>
          item.batches_title.trim() ||
          item.from_date ||
          item.to_date ||
          item.number_recruitment.trim() ||
          item.monthly_target,
      )
      .map((item) => ({
        batches_title: item.batches_title.trim() || undefined,
        from_date: item.from_date || undefined,
        to_date: item.to_date || undefined,
        number_recruitment: parseNumber(item.number_recruitment),
        monthly_target: monthToDate(item.monthly_target),
      }));

    const hasPlanValue = Boolean(
      planForm?.total_real_number?.trim() ||
      planForm?.monthly_target ||
      planForm?.expected_deadline ||
      planBatches.length,
    );

    const planPayload = hasPlanValue
      ? [
          {
            total_real_number: parseNumber(planForm?.total_real_number),
            monthly_target: monthToDate(planForm?.monthly_target),
            expected_deadline: planForm?.expected_deadline || undefined,
            batches: planBatches.length ? planBatches : undefined,
          },
        ]
      : undefined;

    try {
      await createRecInform({
        internal_title: infoForm.internal_title.trim(),
        post_title: infoForm.post_title.trim(),
        department_id: infoForm.department_id,
        rank_id: infoForm.rank_id,
        // Use selected department as work location as requested.
        work_location_id: infoForm.department_id,
        type_of_job: infoForm.type_of_job || undefined,
        application_deadline: infoForm.application_deadline || undefined,
        total_needed: parseNumber(infoForm.total_needed),
        salary_from: parseNumber(infoForm.salary_from),
        salary_to: parseNumber(infoForm.salary_to),
        salary_currency: infoForm.salary_currency || undefined,
        position_post_id: infoForm.position_post_id,
        contact_person_id: infoForm.contact_person_id || undefined,
        status,
        is_active: true,
        other_costs: costItems
          .filter((item) => item.cost_type.trim() || item.amount.trim())
          .map((item) => ({
            cost_type: item.cost_type.trim() || undefined,
            amount: item.amount.trim() ? Number(item.amount) : undefined,
            currency: "VND",
          })),
        plan: planPayload,
      });

      setPublishStatus(status);
      notify({ message: "Recruitment posting saved successfully", type: "success" });
      navigate(recruitmentInforUrl);
    } catch (err: any) {
      notify({ message: buildErrorMessage(err), type: "error" });
    }
  };

  const handleSaveAndPublish = async (statusOverride?: RecruitmentStatusType) => {
    // Main button defaults to PUBLIC when user does not explicitly choose dropdown.
    const finalStatus = statusOverride ?? RecruitmentStatus.Public;
    await submitRecruitment(finalStatus);
  };

  const handleSaveDraft = async () => {
    await submitRecruitment(RecruitmentStatus.Draft);
  };

  const handleInfoFormChange = useCallback((form: RecruitmentInfoFormState) => {
    setInfoForm(form);
  }, []);

  const handleCostFormChange = useCallback((items: RecruitmentCostItemForm[]) => {
    setCostItems(items);
  }, []);

  const handlePlanFormChange = useCallback((form: RecruitmentPlanFormState) => {
    setPlanForm(form);
  }, []);

  const publishOptions: Array<{
    value: RecruitmentStatusType;
    label: string;
    description: string;
    dotColor: string;
  }> = [
    {
      value: RecruitmentStatus.Public,
      label: "Public",
      description: "Visible publicly on configured recruitment channels.",
      dotColor: "#6175AF",
    },
    {
      value: RecruitmentStatus.Internal,
      label: "Internal",
      description: "Accessible via direct link but hidden from recruitment channels.",
      dotColor: "#334371",
    },
  ];

  return (
    <Box display="flex" flexDirection="column" mx={-6} minH="calc(100vh - 70px)">
      {/* ── Body ── */}
      <Flex flex={1} overflow="hidden">

        {/* Left sidebar tabs */}
        <Box
          w="230px"
          borderRight="1px solid"
          borderColor={borderColor}
          flexShrink={0}
          py={3}
          overflowY="auto"
        >
          <VStack spacing={0} align="stretch">
            {TAB_CONFIG.map((tab) => {
              const isActive = activeTab === tab.id;
              const requiresBaseInfo = tab.id === "execution-plan" || tab.id === "costs";
              const isLocked = requiresBaseInfo && !isBaseInfoCompleted;

              const item = (
                <Flex
                  key={tab.id}
                  align="center"
                  gap={3}
                  px={4}
                  py={2.5}
                  cursor={tab.enabled ? "pointer" : "not-allowed"}
                  bg={isActive ? activeBg : "transparent"}
                  color={!tab.enabled || isLocked ? disabledTxt : isActive ? activeTxt : normalTxt}
                  fontWeight={isActive ? "600" : "500"}
                  borderLeft="3px solid"
                  borderLeftColor={isActive ? activeBorder : "transparent"}
                  opacity={!tab.enabled || isLocked ? 0.55 : 1}
                  _hover={tab.enabled && !isActive && !isLocked ? { bg: hoverBg } : {}}
                  transition="all 0.12s ease"
                  onClick={() => {
                    if (tab.enabled) handleTabChange(tab.id);
                  }}
                >
                  <Icon as={tab.icon} boxSize="18px" flexShrink={0} />
                  <Text fontSize="md" noOfLines={1}>{tab.label}</Text>
                </Flex>
              );

              if (tab.enabled && isLocked) {
                return (
                  <Tooltip
                    key={tab.id}
                    label="Complete Recruitment Information first"
                    placement="right"
                    hasArrow
                  >
                    <Box>{item}</Box>
                  </Tooltip>
                );
              }

              return tab.enabled ? (
                <Box key={tab.id}>{item}</Box>
              ) : (
                <Tooltip key={tab.id} label="Coming soon" placement="right" hasArrow>
                  <Box>{item}</Box>
                </Tooltip>
              );
            })}
          </VStack>
        </Box>

        {/* Content area */}
        <Box flex={1} overflowY="auto" px={6} borderRadius={'sm'}>
          <Box display={activeTab === "information" ? "block" : "none"}>
            <TabInformation onFormChange={handleInfoFormChange} />
          </Box>
          <Box display={activeTab === "execution-plan" ? "block" : "none"}>
            <TabExecutionPlan onFormChange={handlePlanFormChange} />
          </Box>
          <Box display={activeTab === "costs" ? "block" : "none"}>
            <TabRecruitmentCost onFormChange={handleCostFormChange} />
          </Box>
        </Box>

        {/* Right action panel */}
        <Box
          w="220px"
          bg={bg}
          borderLeft="1px solid"
          borderColor={borderColor}
          p={4}
          flexShrink={0}
        >
          <VStack spacing={3} align="stretch">
            <ButtonGroup isAttached  size="md" w="100%">
              <Button
                flex={1}
                bg={theme.colors.primary} color={'white'}
                fontWeight="700"
                onClick={() => handleSaveAndPublish()}
                isLoading={isCreating}
                loadingText="Saving"
              >
                ADD & PUBLISH
              </Button>

              <Menu placement="bottom-end">
                <MenuButton
                bg={theme.colors.primary} color={'white'}
                  as={IconButton}
                  aria-label="Publishing status options"
                  icon={<FiChevronDown />}
                  isDisabled={isCreating}
                />
                <MenuList minW="220px" maxW="260px" p={2}>
                  {publishOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      borderRadius="md"
                      py={3}
                      onClick={() => {
                        void handleSaveAndPublish(option.value);
                      }}
                    >
                      <HStack align="start" spacing={3}>
                        <Box
                          mt="7px"
                          boxSize="10px"
                          borderRadius="full"
                          bg={option.dotColor}
                          flexShrink={0}
                        />
                        <Box>
                          <Text fontSize="md" fontWeight="700" lineHeight="1.2">
                            {option.label}
                          </Text>
                          <Text mt={1} fontSize="md" color="gray.500" whiteSpace="normal">
                            {option.description}
                          </Text>
                        </Box>
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </ButtonGroup>

            <Button
              variant="outline"
              size="sm"
              w="100%"
              fontWeight="600"
              onClick={() => {
                void handleSaveDraft();
              }}
              isLoading={isCreating && publishStatus === RecruitmentStatus.Draft}
              isDisabled={isCreating}
            >
              SAVE (DRAFT)
            </Button>

            <Box pt={2}>
              <Text fontSize="xs" color={subtleTxt} fontWeight="600" mb={1}>
                Status
              </Text>
              <Text fontSize="sm" color={normalTxt}>
                {RECRUITMENT_STATUS_DISPLAY[publishStatus]}
              </Text>
            </Box>
          </VStack>
        </Box>

      </Flex>
    </Box>
  );
}
