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
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import theme from "../../../../theme";
import LabelItem from "../../../../components/common/Label";
import { useNotify } from "../../../../components/notification/NotifyProvider";
import type { ISkill, SkillFormValues } from "../types";
import { useCreateSkill } from "../api/create";
import { useUpdateSkill } from "../api/update";
import { useGetSkills } from "../api/get";
import {
  SKILL_STATUS,
  SKILL_STATUS_VALUES,
  type SkillStatusType,
} from "../../../../constant";

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  data?: ISkill;
  onSuccess?: () => void;
}

const safeStr = (v?: string | null) => v ?? "";

const SKILL_STATUS_OPTIONS = [...SKILL_STATUS_VALUES];

export default function SkillModal({
  isOpen,
  onClose,
  mode,
  data,
  onSuccess,
}: SkillModalProps) {
  const notify = useNotify();
  const { mutateAsync: createSkill } = useCreateSkill();
  const { mutateAsync: updateSkill } = useUpdateSkill();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: skillsRes } = useGetSkills({ pages: 1, items_per_pages: 500 });
  const skills = skillsRes?.data ?? [];

  const parentOptions = useMemo(
    () => skills.filter((s) => s.id !== data?.id),
    [skills, data?.id],
  );

  const defaultValues: SkillFormValues = useMemo(
    () => ({
      name: "",
      parent_id: "",
      status: SKILL_STATUS.ACTIVE,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && data) {
      reset({
        name: safeStr(data.name),
        parent_id: safeStr(data.parent_id),
        status: data.is_active
          ? SKILL_STATUS.ACTIVE
          : SKILL_STATUS.INACTIVE,
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, mode, data, reset, defaultValues]);

  const onSubmit = async (values: SkillFormValues) => {
    setIsSubmittingForm(true);

    const normalizedStatus = values.status as SkillStatusType;

    const payload = {
      name: values.name.trim(),
      parent_id: values.parent_id || null,
      is_active: normalizedStatus === SKILL_STATUS.ACTIVE,
    };

    try {
      if (mode === "add") {
        await createSkill(payload);
        notify({ message: "Skill created successfully", type: "success" });
      } else {
        if (!data?.id) return;
        await updateSkill({ id: data.id, data: payload });
        notify({ message: "Skill updated successfully", type: "success" });
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
          {mode === "add" ? "ADD SKILL" : "UPDATE SKILL"}
        </ModalHeader>

        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pb={4} px={{ base: 4, md: 6 }}>
            <Text fontWeight={700} mb={2}>
              Skill information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {mode === "edit" && (
                <FormControl>
                  <LabelItem label="Skill ID" fontSize="md" />
                  <Input
                    value={data?.id ?? "-"}
                    isReadOnly
                    bg="gray.50"
                    borderColor="#d4d4d8cc"
                    size="md"
                  />
                </FormControl>
              )}

              <FormControl isInvalid={!!errors.name}>
                <LabelItem label="Skill name" required fontSize="md" />
                <Input
                  placeholder="Enter skill name"
                  borderColor="#d4d4d8cc"
                  size="md"
                  {...register("name", {
                    required: "Skill name is required",
                    maxLength: { value: 100, message: "Max 100 characters" },
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.parent_id}>
                <LabelItem label="Parent skill" fontSize="md" />
                <Select
                  borderColor="#d4d4d8cc"
                  size="md"
                  placeholder="-- No parent --"
                  {...register("parent_id")}
                >
                  {parentOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.parent_id?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <LabelItem label="Status" fontSize="md" />
                <Select borderColor="#d4d4d8cc" size="md" {...register("status")}>
                  {SKILL_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />
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
