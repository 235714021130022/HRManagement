import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import BaseTable, { type HeaderTable } from "../../../../components/common/BaseTable";
import { useNotify } from "../../../../components/notification/NotifyProvider";
import theme from "../../../../theme";

export interface RecruitmentPlanBatchForm {
  localId: string;
  batches_title: string;
  from_date: string;
  to_date: string;
  number_recruitment: string;
  monthly_target: string;
  split_target_by_recruiter: boolean;
}

export interface RecruitmentPlanFormState {
  total_real_number: string;
  monthly_target: string;
  expected_deadline: string;
  split_target_by_recruiter: boolean;
  plan_by_batches: boolean;
  batches: RecruitmentPlanBatchForm[];
}

interface TabExecutionPlanProps {
  onFormChange?: (form: RecruitmentPlanFormState) => void;
}

interface BatchTableRow {
  id: string;
  batch_name: string;
  time: string;
  hiring_quantity: number;
  monthly_target: string;
  localId: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const formatMonth = (monthStr: string) => {
  if (!monthStr) return "-";
  const [y, m] = monthStr.split("-");
  return `Month ${m}/${y}`;
};

const currentMonth = () => {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}`;
};

const createEmptyBatch = (): RecruitmentPlanBatchForm => ({
  localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  batches_title: "",
  from_date: "",
  to_date: "",
  number_recruitment: "1",
  monthly_target: currentMonth(),
  split_target_by_recruiter: false,
});

const INIT: RecruitmentPlanFormState = {
  total_real_number: "1",
  monthly_target: currentMonth(),
  expected_deadline: "",
  split_target_by_recruiter: false,
  plan_by_batches: false,
  batches: [],
};

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

export default function TabExecutionPlan({ onFormChange }: TabExecutionPlanProps) {
  const notify = useNotify();
  const [form, setForm] = useState<RecruitmentPlanFormState>(INIT);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchModalMode, setBatchModalMode] = useState<"create" | "edit">("create");
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchDraft, setBatchDraft] = useState<RecruitmentPlanBatchForm>(createEmptyBatch());

  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("#E2E8F0", "gray.700");
  const tableWrapBg = useColorModeValue("white", "gray.800");
  const subtle = useColorModeValue("gray.500", "gray.400");
  const totalWrapBg = useColorModeValue("gray.50", "gray.700");
  const inputBg = useColorModeValue("white", "gray.800");
  const readOnlyBg = useColorModeValue("gray.50", "gray.700");
  const inputBorder = useColorModeValue("#CBD5E1", "gray.600");
  const inputHoverBorder = useColorModeValue("#94A3B8", "gray.500");
  const sectionTitleColor = useColorModeValue("#1F2937", "gray.100");
  const primary = theme?.colors?.primary || "#334371";

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
    borderColor: border,
    borderRadius: "6px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
    p: { base: 4, md: 6 },
  };

  const totalBatchRecruitment = useMemo(
    () => form.batches.reduce((sum, item) => sum + (Number(item.number_recruitment) || 0), 0),
    [form.batches]
  );

  const batchColumns = useMemo<HeaderTable[]>(
    () => [
      { name: "Batch Name", key: "batch_name", disableSort: true },
      { name: "Time", key: "time", disableSort: true },
      { name: "Hiring Quantity", key: "hiring_quantity", disableSort: true },
      { name: "Monthly Target", key: "monthly_target", disableSort: true },
    ],
    []
  );

  const batchRows = useMemo<BatchTableRow[]>(
    () =>
      form.batches.map((batch) => ({
        id: batch.localId,
        localId: batch.localId,
        batch_name: batch.batches_title || "(Untitled)",
        time: `${formatDate(batch.from_date)} - ${formatDate(batch.to_date)}`,
        hiring_quantity: Number(batch.number_recruitment) || 0,
        monthly_target: formatMonth(batch.monthly_target),
      })),
    [form.batches]
  );

  // Auto-sync total_real_number with sum of batch quantities
  useEffect(() => {
    if (form.plan_by_batches) {
      setForm((prev) => ({ ...prev, total_real_number: String(totalBatchRecruitment) }));
    }
  }, [totalBatchRecruitment, form.plan_by_batches]);

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const update = (
    field: keyof Omit<RecruitmentPlanFormState, "batches">,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openBatchModal = () => {
    setBatchModalMode("create");
    setEditingBatchId(null);
    setBatchDraft(createEmptyBatch());
    setIsBatchModalOpen(true);
  };

  const openEditBatchModal = (batchId: string) => {
    const targetBatch = form.batches.find((item) => item.localId === batchId);
    if (!targetBatch) return;

    setBatchModalMode("edit");
    setEditingBatchId(batchId);
    setBatchDraft(targetBatch);
    setIsBatchModalOpen(true);
  };

  const closeBatchModal = () => {
    setIsBatchModalOpen(false);
    setBatchModalMode("create");
    setEditingBatchId(null);
  };

  const saveBatch = () => {
    if (!batchDraft.batches_title.trim()) {
      notify({ message: "Please enter the batch name", type: "warning" });
      return;
    }

    if (!batchDraft.from_date || !batchDraft.to_date) {
      notify({ message: "Please enter both start and end dates", type: "warning" });
      return;
    }

    if (!batchDraft.monthly_target) {
      notify({ message: "Please enter a monthly target", type: "warning" });
      return;
    }

    setForm((prev) => {
      if (batchModalMode === "edit" && editingBatchId) {
        return {
          ...prev,
          batches: prev.batches.map((item) =>
            item.localId === editingBatchId ? { ...batchDraft, localId: editingBatchId } : item
          ),
        };
      }

      return {
        ...prev,
        batches: [...prev.batches, batchDraft],
      };
    });

    closeBatchModal();
  };

  const removeBatch = (localId: string) => {
    setForm((prev) => ({
      ...prev,
      batches: prev.batches.filter((item) => item.localId !== localId),
    }));
  };

  return (
    <Box minH="100%" py={1}>
      <VStack spacing={7} align="stretch">
        <Box {...sectionCardProps}>
          <SectionHeader
            title="Execution Plan"
            subtitle="Define the target month and actual hiring quantity for this posting to support reporting. You can split this posting into multiple recruitment batches."
          />

          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="md" fontWeight="700" mb={4} color={sectionTitleColor}>
                Plan by Posting
              </Text>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={5}>
                <GridItem>
                  <FormControl>
                    <FieldLabel label="Actual hiring quantity" required />
                    <Input
                      {...commonFieldSx}
                      h="48px"
                      value={form.total_real_number}
                      isReadOnly={form.plan_by_batches}
                      bg={form.plan_by_batches ? readOnlyBg : inputBg}
                      cursor={form.plan_by_batches ? "default" : undefined}
                      onChange={(e) =>
                        !form.plan_by_batches &&
                        update("total_real_number", e.target.value.replace(/[^\d]/g, ""))
                      }
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FieldLabel label="Monthly target" required />
                    <Input
                      {...commonFieldSx}
                      h="48px"
                      type="month"
                      value={form.monthly_target}
                      onChange={(e) => update("monthly_target", e.target.value)}
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FieldLabel label="Expected deadline" required />
                    <Input
                      {...commonFieldSx}
                      h="48px"
                      type="date"
                      value={form.expected_deadline}
                      onChange={(e) => update("expected_deadline", e.target.value)}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Box>
              <Checkbox
                size="md"
                isChecked={form.plan_by_batches}
                onChange={(e) => update("plan_by_batches", e.target.checked)}
              >
                <Text fontSize="md" fontWeight="500">
                  Plan by batch
                </Text>
              </Checkbox>
            </Box>

            {form.plan_by_batches && (
              <Box>
                <Button
                  size="md"
                  bg={primary}
                  color="white"
                  borderRadius="6px"
                  px={5}
                  _hover={{ opacity: 0.92 }}
                  _active={{ opacity: 0.88 }}
                  onClick={openBatchModal}
                >
                  ADD BATCH
                </Button>

                {form.batches.length > 0 ? (
                  <Box mt={4} bg={tableWrapBg}>
                    <BaseTable<BatchTableRow>
                      columns={batchColumns}
                      data={batchRows}
                      hideCheckboxes
                      hideSortButton
                      maxHBaseTable="320px"
                      renderRowActions={(row) => (
                        <HStack spacing={1} justify="center">
                          <IconButton
                            aria-label="Edit batch"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            color="blue.500"
                            borderRadius="6px"
                            _hover={{ bg: useColorModeValue("blue.50", "rgba(59,130,246,0.15)") }}
                            onClick={() => openEditBatchModal(row.localId)}
                          />
                          <IconButton
                            aria-label="Remove batch"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            color="red.500"
                            borderRadius="6px"
                            _hover={{ bg: useColorModeValue("red.50", "rgba(239,68,68,0.12)") }}
                            onClick={() => removeBatch(row.localId)}
                          />
                        </HStack>
                      )}
                    />

                    <Flex
                      justify="space-between"
                      align="center"
                      px={4}
                      py={3}
                      bg={totalWrapBg}
                      border="1px solid"
                      borderColor={border}
                      borderTop="none"
                    >
                      <Text fontSize="md" fontWeight="700" color={sectionTitleColor}>
                        Total hiring quantity
                      </Text>
                      <Text fontSize="md" fontWeight="700" color={sectionTitleColor}>
                        {totalBatchRecruitment}
                      </Text>
                    </Flex>
                  </Box>
                ) : (
                  <Text fontSize="md" color={subtle} mt={4}>
                    No batches yet. Click "ADD BATCH" to create one.
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>

      <Modal isOpen={isBatchModalOpen} onClose={closeBatchModal} isCentered>
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          maxW="920px"
          borderRadius="6px"
          bg={cardBg}
          border="1px solid"
          borderColor={border}
          boxShadow="0 10px 30px rgba(15, 23, 42, 0.10)"
        >
          <ModalHeader textAlign={'center'} fontSize="lg" fontWeight="700" pb={3}>
            {batchModalMode === "edit" ? "EDIT BATCH" : "ADD BATCH"}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody pt={1}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FieldLabel label="Batch Name" required />
                <Input
                  {...commonFieldSx}
                  h="48px"
                  placeholder="Batch Name"
                  value={batchDraft.batches_title}
                  onChange={(e) =>
                    setBatchDraft((prev) => ({
                      ...prev,
                      batches_title: e.target.value,
                    }))
                  }
                />
              </FormControl>

              <Checkbox
                size="md"
                isChecked={batchDraft.split_target_by_recruiter}
                onChange={(e) =>
                  setBatchDraft((prev) => ({
                    ...prev,
                    split_target_by_recruiter: e.target.checked,
                  }))
                }
              >
                <Text fontSize="md" fontWeight="500">
                  Split target by recruiter
                </Text>
              </Checkbox>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                <GridItem>
                  <FormControl>
                    <FieldLabel label="Start date" required />
                    <Input
                      {...commonFieldSx}
                      h="48px"
                      type="date"
                      value={batchDraft.from_date}
                      onChange={(e) =>
                        setBatchDraft((prev) => ({
                          ...prev,
                          from_date: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FieldLabel label="End date" required />
                    <Input
                      {...commonFieldSx}
                      h="48px"
                      type="date"
                      value={batchDraft.to_date}
                      onChange={(e) =>
                        setBatchDraft((prev) => ({
                          ...prev,
                          to_date: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FieldLabel label="Hiring Quantity" required />
                    <Input
                      {...commonFieldSx}
                      h="48px"
                      value={batchDraft.number_recruitment}
                      onChange={(e) =>
                        setBatchDraft((prev) => ({
                          ...prev,
                          number_recruitment: e.target.value.replace(/[^\d]/g, ""),
                        }))
                      }
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FieldLabel label="Monthly target" required />
                    <Input
                      {...commonFieldSx}
                      h="48px"
                      type="month"
                      value={batchDraft.monthly_target}
                      onChange={(e) =>
                        setBatchDraft((prev) => ({
                          ...prev,
                          monthly_target: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={border} mt={6}>
            <Button
              variant="ghost"
              mr={3}
              borderRadius="6px"
              onClick={closeBatchModal}
            >
              CANCEL
            </Button>
            <Button
              bg={primary}
              color="white"
              borderRadius="6px"
              _hover={{ opacity: 0.92 }}
              _active={{ opacity: 0.88 }}
              onClick={saveBatch}
            >
              {batchModalMode === "edit" ? "UPDATE" : "CONFIRM"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}