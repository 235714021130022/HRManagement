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
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import theme from "../../../../theme";
import LabelItem from "../../../../components/common/Label";
import { useNotify } from "../../../../components/notification/NotifyProvider";
import type { ITypePotential, TypePotentialFormValues } from "../types";
import { useCreateTypePotential } from "../api/create";
import { useUpdateTypePotential } from "../api/update";
import {
  TYPE_POTENTIAL_STATUS,
  TYPE_POTENTIAL_STATUS_VALUES,
  type TypePotentialStatusType,
} from "../../../../constant";

interface TypePotentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  data?: ITypePotential;
  onSuccess?: () => void;
}

const safeStr = (v?: string | null) => v ?? "";

const TYPE_POTENTIAL_STATUS_OPTIONS = [...TYPE_POTENTIAL_STATUS_VALUES];

export default function TypePotentialModal({
  isOpen,
  onClose,
  mode,
  data,
  onSuccess,
}: TypePotentialModalProps) {
  const notify = useNotify();
  const { mutateAsync: createTypePotential } = useCreateTypePotential();
  const { mutateAsync: updateTypePotential } = useUpdateTypePotential();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const defaultValues: TypePotentialFormValues = useMemo(
    () => ({
      name: "",
      description: "",
      status: TYPE_POTENTIAL_STATUS.ACTIVE,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TypePotentialFormValues>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && data) {
      reset({
        name: safeStr(data.name),
        description: safeStr(data.description),
        status: data.is_active
          ? TYPE_POTENTIAL_STATUS.ACTIVE
          : TYPE_POTENTIAL_STATUS.INACTIVE,
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, mode, data, reset, defaultValues]);

  const onSubmit = async (values: TypePotentialFormValues) => {
    setIsSubmittingForm(true);

    const normalizedStatus = values.status as TypePotentialStatusType;

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      is_active: normalizedStatus === TYPE_POTENTIAL_STATUS.ACTIVE,
    };

    try {
      if (mode === "add") {
        await createTypePotential(payload);
        notify({ message: "Type Potential created successfully", type: "success" });
      } else {
        if (!data?.id) return;
        await updateTypePotential({ id: data.id, data: payload });
        notify({ message: "Type Potential updated successfully", type: "success" });
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
          {mode === "add" ? "ADD TYPE POTENTIAL" : "UPDATE TYPE POTENTIAL"}
        </ModalHeader>

        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pb={4} px={{ base: 4, md: 6 }}>
            <Text fontWeight={700} mb={2}>
              Type potential information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {mode === "edit" && (
                <FormControl>
                  <LabelItem label="Type Potential ID" fontSize="md" />
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
                <LabelItem label="Name" required fontSize="md" />
                <Input
                  placeholder="Enter type potential name"
                  borderColor="#d4d4d8cc"
                  size="md"
                  {...register("name", {
                    required: "Name is required",
                    maxLength: { value: 100, message: "Max 100 characters" },
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <LabelItem label="Status" fontSize="md" />
                <Select borderColor="#d4d4d8cc" size="md" {...register("status")}>
                  {TYPE_POTENTIAL_STATUS_OPTIONS.map((s) => (
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
