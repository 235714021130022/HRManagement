import { MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { formatCompactMoney } from "../../../../types";
import theme from "../../../../theme";

export interface RecruitmentCostItemForm {
  localId: string;
  cost_type: string;
  amount: string;
}

interface TabRecruitmentCostProps {
  onFormChange?: (items: RecruitmentCostItemForm[]) => void;
}

const createEmptyCostItem = (): RecruitmentCostItemForm => ({
  localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  cost_type: "",
  amount: "",
});

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

export default function TabRecruitmentCost({ onFormChange }: TabRecruitmentCostProps) {
  const [items, setItems] = useState<RecruitmentCostItemForm[]>([createEmptyCostItem()]);

  const pageBg = useColorModeValue("#F8FAFC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("#E2E8F0", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");
  const headerBg = useColorModeValue("#F8FAFC", "gray.900");
  const inputBg = useColorModeValue("white", "gray.800");
  const inputBorder = useColorModeValue("#CBD5E1", "gray.600");
  const inputHoverBorder = useColorModeValue("#94A3B8", "gray.500");
  const sectionTitleColor = useColorModeValue("#1F2937", "gray.100");
  const rowHoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
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

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [items]
  );

  useEffect(() => {
    onFormChange?.(items);
  }, [items, onFormChange]);

  const updateItem = (
    localId: string,
    field: keyof Omit<RecruitmentCostItemForm, "localId">,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, [field]: value } : item))
    );
  };

  const addRow = () => {
    setItems((prev) => [...prev, createEmptyCostItem()]);
  };

  const removeRow = (localId: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.localId !== localId);
      return next.length > 0 ? next : [createEmptyCostItem()];
    });
  };

  return (
    <Box bg={pageBg} minH="100%" py={1}>
      <VStack spacing={7} align="stretch">
        <Box {...sectionCardProps}>
          <SectionHeader
            title="Recruitment Costs"
            subtitle="Track additional recruitment expenses for this posting and estimate the total budget."
          />

          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="md" fontWeight="700" mb={4} color={sectionTitleColor}>
                Other Costs
              </Text>

              <Box border="1px solid" borderColor={border} borderRadius="6px" overflow="hidden">
                <Grid
                  templateColumns="1.2fr 1fr 56px"
                  bg={headerBg}
                  borderBottom="1px solid"
                  borderColor={border}
                >
                  <GridItem px={5} py={3.5}>
                    <Text fontSize="md" fontWeight="700" color={sectionTitleColor}>
                      Cost Item
                    </Text>
                  </GridItem>

                  <GridItem px={5} py={3.5}>
                    <Text fontSize="md" fontWeight="700" color={sectionTitleColor}>
                      Estimated Cost
                    </Text>
                  </GridItem>

                  <GridItem />
                </Grid>

                <VStack spacing={0} align="stretch">
                  {items.map((item, index) => (
                    <Grid
                      key={item.localId}
                      templateColumns="1.2fr 1fr 56px"
                      px={5}
                      py={3}
                      gap={4}
                      borderBottom={index === items.length - 1 ? "none" : "1px solid"}
                      borderColor={border}
                      alignItems="center"
                      _hover={{ bg: rowHoverBg }}
                      transition="background 0.15s ease"
                    >
                      <GridItem>
                        <Input
                          {...commonFieldSx}
                          h="44px"
                          placeholder="Enter cost item"
                          value={item.cost_type}
                          onChange={(e) =>
                            updateItem(item.localId, "cost_type", e.target.value)
                          }
                        />
                      </GridItem>

                      <GridItem>
                        <Input
                          {...commonFieldSx}
                          h="44px"
                          placeholder="Enter amount"
                          value={item.amount}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/[^\d]/g, "");
                            updateItem(item.localId, "amount", digitsOnly);
                          }}
                          textAlign="right"
                        />
                      </GridItem>

                      <GridItem display="flex" justifyContent="center">
                        <IconButton
                          aria-label="Remove cost row"
                          icon={<MinusIcon />}
                          variant="ghost"
                          color="red.500"
                          borderRadius="6px"
                          size="sm"
                          _hover={{
                            bg: useColorModeValue("red.50", "rgba(239,68,68,0.12)"),
                          }}
                          onClick={() => removeRow(item.localId)}
                        />
                      </GridItem>
                    </Grid>
                  ))}
                </VStack>
              </Box>

              <Button
                mt={4}
                onClick={addRow}
                bg={primary}
                color="white"
                borderRadius="6px"
                px={5}
                _hover={{ opacity: 0.92 }}
                _active={{ opacity: 0.88 }}
                w="fit-content"
              >
                ADD ROW
              </Button>
            </Box>

            <Divider />

            <Flex align="center" justify="space-between">
              <Text fontSize="md" fontWeight="700" color={sectionTitleColor}>
                Total
              </Text>

              <Box textAlign="right">
                <Text fontSize="md" fontWeight="700" color={sectionTitleColor}>
                  {formatCompactMoney(total, "VND")}
                </Text>
                <Text fontSize="md" color={muted}>
                  {total.toLocaleString("en-US")} VND
                </Text>
              </Box>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}