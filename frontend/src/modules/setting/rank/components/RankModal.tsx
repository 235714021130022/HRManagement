import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  SimpleGrid,
  Select,
  Divider,
  Text,
  Textarea,
  Checkbox,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import theme from "../../../../theme";
import LabelItem from "../../../../components/common/Label";
import { useNotify } from "../../../../components/notification/NotifyProvider";
import type { IRank, RankFormValues } from "../types";
import { useCreateRank } from "../api/create";
import { useUpdateRank } from "../api/update";
import { useGetCompanies } from "../../../inform_company/api/get_company";
import {
  RANK_STATUS,
  RANK_STATUS_VALUES,
  type RankStatusType,
} from "../../../../constant";

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  data?: IRank;
  onSuccess?: () => void;
}

const safeStr = (v?: string | null) => v ?? "";

const RANK_STATUS_OPTIONS = [...RANK_STATUS_VALUES];

export default function RankModal({
  isOpen,
  onClose,
  mode,
  data,
  onSuccess,
}: RankModalProps) {
  const notify = useNotify();
  const { mutateAsync: createRank } = useCreateRank();
  const { mutateAsync: updateRank } = useUpdateRank();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: companiesRes } = useGetCompanies({ page: 1, limit: 200 });
  const companies = companiesRes?.data ?? [];

  const defaultValues: RankFormValues = useMemo(
    () => ({
      name_rank: "",
      unit_id: "",
      status: RANK_STATUS.ACTIVE,
      description: "",
      is_active: true,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RankFormValues>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && data) {
      reset({
        name_rank: safeStr(data.name_rank),
        unit_id: safeStr(data.unit_id),
        status:
          (safeStr(data.status) as RankStatusType) ||
          RANK_STATUS.ACTIVE,
        description: safeStr(data.description),
        is_active: Boolean(data.is_active),
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, mode, data, reset, defaultValues]);

  const onSubmit = async (values: RankFormValues) => {
    setIsSubmittingForm(true);

    const payload = {
      name_rank: values.name_rank.trim() || null,
      unit_id: values.unit_id || null,
      status: values.status,
      description: values.description.trim() || null,
      is_active: Boolean(values.is_active),
    };

    try {
      if (mode === "add") {
        await createRank(payload as any);
        notify({ message: "Rank created successfully", type: "success" });
      } else {
        if (!data?.id) return;
        await updateRank({ id: data.id, data: payload as any });
        notify({ message: "Rank updated successfully", type: "success" });
      }

      onSuccess?.();
      reset(defaultValues);
      onClose();
    } catch (err: any) {
      let msg = "An error occurred";
      if (err?.response?.data) {
        const d = err.response.data;
        if (Array.isArray(d.message)) msg = d.message.join(", ");
        else if (typeof d.message === "string") msg = d.message;
      }
      notify({ message: msg, type: "error" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        maxW={{ base: "95%", md: "860px" }}
        w="100%"
        borderRadius="18px"
        maxH="85vh"
        overflow="auto"
      >
        <ModalHeader
          color={theme.colors.primary}
          textAlign="center"
          fontWeight={700}
          fontSize="lg"
          py={4}
        >
          {mode === "add" ? "ADD RANK" : "UPDATE RANK"}
        </ModalHeader>

        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pb={4} px={{ base: 4, md: 6 }}>
            <Text fontWeight={700} mb={2}>
              Rank information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {mode === "edit" && (
                <FormControl>
                  <LabelItem label="Rank Code (Auto)" fontSize="md" />
                  <Input
                    value={data?.rank_code ?? "Auto generate after save"}
                    isReadOnly
                    bg="gray.50"
                    borderColor="#d4d4d8cc"
                    size="md"
                  />
                </FormControl>
              )}

              <FormControl isInvalid={!!errors.name_rank}>
                <LabelItem label="Rank name" required fontSize="md" />
                <Input
                  placeholder="Enter rank name"
                  borderColor="#d4d4d8cc"
                  size="md"
                  {...register("name_rank", {
                    required: "Rank name is required",
                    maxLength: { value: 100, message: "Max 100 characters" },
                  })}
                />
                <FormErrorMessage>{errors.name_rank?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.unit_id}>
                <LabelItem label="Company / Unit" fontSize="md" />
                <Select
                  borderColor="#d4d4d8cc"
                  size="md"
                  placeholder="-- Select company --"
                  {...register("unit_id")}
                >
                  {companies.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.acronym_name || c.id}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.unit_id?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <LabelItem label="Status" fontSize="md" />
                <Select borderColor="#d4d4d8cc" size="md" {...register("status")}>
                  {RANK_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            <FormControl isInvalid={!!errors.description}>
              <LabelItem label="Description" fontSize="md" />
              <Textarea
                placeholder="Description..."
                borderColor="#d4d4d8cc"
                size="md"
                rows={4}
                {...register("description")}
              />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>

            <Divider my={4} />

            <FormControl w="auto">
              <Checkbox colorScheme="blue" size="md" {...register("is_active")}>
                <Text fontSize="sm" fontWeight="500">
                  Is active
                </Text>
              </Checkbox>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button size="md" mr={3} onClick={onClose}>
              CANCEL
            </Button>
            <Button
              bg={theme.colors.primary}
              color={theme.colors.white}
              type="submit"
              isLoading={isSubmitting || isSubmittingForm}
              size="md"
            >
              {mode === "add" ? "ADD" : "UPDATE"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
