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
  HStack,
  Box,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import theme from "../../../../theme";
import LabelItem from "../../../../components/common/Label";
import { useNotify } from "../../../../components/notification/NotifyProvider";
import type { IPositionPost, PositionPostFormValues } from "../types";
import { useCreatePositionPost } from "../api/create";
import { useUpdatePositionPost } from "../api/update";
import { useGetCompanies } from "../../../inform_company/api/get_company";
import {
  POSITION_POST_STATUS,
  POSITION_POST_STATUS_VALUES,
  type PositionPostStatusType,
} from "../../../../constant";

interface PositionPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  data?: IPositionPost;
  onSuccess?: () => void;
}

const safeStr = (v?: string | null) => v ?? "";

const POSITION_STATUS_OPTIONS = [...POSITION_POST_STATUS_VALUES];

export default function PositionPostModal({
  isOpen,
  onClose,
  mode,
  data,
  onSuccess,
}: PositionPostModalProps) {
  const notify = useNotify();
  const { mutateAsync: createPost } = useCreatePositionPost();
  const { mutateAsync: updatePost } = useUpdatePositionPost();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: companiesRes } = useGetCompanies({ page: 1, limit: 200 });
  const companies = companiesRes?.data ?? [];

  const defaultValues: PositionPostFormValues = useMemo(
    () => ({
      name_post: "",
      unit_id: "",
      description_post: "",
      requirements_post: "",
      benefits_post: "",
      auto_rotation: false,
      auto_eli_candidate: false,
      auto_near: false,
      status: POSITION_POST_STATUS.ACTIVE,
      is_active: true,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PositionPostFormValues>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && data) {
      reset({
        name_post: safeStr(data.name_post),
        unit_id: safeStr(data.unit_id),
        description_post: safeStr(data.description_post),
        requirements_post: safeStr(data.requirements_post),
        benefits_post: safeStr(data.benefits_post),
        auto_rotation: Boolean(data.auto_rotation),
        auto_eli_candidate: Boolean(data.auto_eli_candidate),
        auto_near: Boolean(data.auto_near),
        status:
          (safeStr(data.status) as PositionPostStatusType) ||
          POSITION_POST_STATUS.ACTIVE,
        is_active: Boolean(data.is_active),
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, mode, data, reset, defaultValues]);

  const onSubmit = async (values: PositionPostFormValues) => {
    setIsSubmittingForm(true);

    const payload = {
      name_post: values.name_post.trim() || null,
      unit_id: values.unit_id || null,
      description_post: values.description_post.trim() || null,
      requirements_post: values.requirements_post.trim() || null,
      benefits_post: values.benefits_post.trim() || null,
      auto_rotation: Boolean(values.auto_rotation),
      auto_eli_candidate: Boolean(values.auto_eli_candidate),
      auto_near: Boolean(values.auto_near),
      status: values.status.trim() || null,
      is_active: Boolean(values.is_active),
    };

    try {
      if (mode === "add") {
        await createPost(payload as any);
        notify({ message: "Position Post created successfully", type: "success" });
      } else {
        if (!data?.id) return;
        await updatePost({ id: data.id, data: payload as any });
        notify({ message: "Position Post updated successfully", type: "success" });
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
          {mode === "add" ? "ADD POSITION POST" : "UPDATE POSITION POST"}
        </ModalHeader>

        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pb={4} px={{ base: 4, md: 6 }}>
            {/* 1) BASIC INFO */}
            <Text fontWeight={700} mb={2}>
              Basic information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {mode === "edit" && (
                <FormControl>
                  <LabelItem label="Position Code (Auto)" fontSize="md" />
                  <Input
                    value={data?.position_code ?? "Auto generate after save"}
                    isReadOnly
                    bg="gray.50"
                    borderColor="#d4d4d8cc"
                    size="md"
                  />
                </FormControl>
              )}

              <FormControl isInvalid={!!errors.name_post}>
                <LabelItem label="Position name" required fontSize="md" />
                <Input
                  placeholder="Enter position name"
                  borderColor="#d4d4d8cc"
                  size="md"
                  {...register("name_post", {
                    required: "Position name is required",
                    maxLength: { value: 100, message: "Max 100 characters" },
                  })}
                />
                <FormErrorMessage>{errors.name_post?.message}</FormErrorMessage>
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
                  {POSITION_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* 2) CONTENT */}
            <Text fontWeight={700} mb={2}>
              Content
            </Text>

            <SimpleGrid columns={1} spacing={4}>
              <FormControl isInvalid={!!errors.description_post}>
                <LabelItem label="Description" fontSize="md" />
                <Textarea
                  placeholder="Job description..."
                  borderColor="#d4d4d8cc"
                  size="md"
                  rows={4}
                  {...register("description_post")}
                />
                <FormErrorMessage>{errors.description_post?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.requirements_post}>
                <LabelItem label="Requirements" fontSize="md" />
                <Textarea
                  placeholder="Candidate requirements..."
                  borderColor="#d4d4d8cc"
                  size="md"
                  rows={4}
                  {...register("requirements_post")}
                />
                <FormErrorMessage>{errors.requirements_post?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.benefits_post}>
                <LabelItem label="Benefits" fontSize="md" />
                <Textarea
                  placeholder="Benefits offered..."
                  borderColor="#d4d4d8cc"
                  size="md"
                  rows={3}
                  {...register("benefits_post")}
                />
                <FormErrorMessage>{errors.benefits_post?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* 3) AUTOMATION */}
            <Text fontWeight={700} mb={3}>
              Automation settings
            </Text>

            <Box px={1}>
              <HStack spacing={8} wrap="wrap">
                <FormControl w="auto">
                  <Checkbox
                    colorScheme="blue"
                    size="md"
                    {...register("auto_rotation")}
                  >
                    <Text fontSize="sm" fontWeight="500">
                      Auto rotation
                    </Text>
                  </Checkbox>
                </FormControl>

                <FormControl w="auto">
                  <Checkbox
                    colorScheme="blue"
                    size="md"
                    {...register("auto_eli_candidate")}
                  >
                    <Text fontSize="sm" fontWeight="500">
                      Auto eliminate candidate
                    </Text>
                  </Checkbox>
                </FormControl>

                <FormControl w="auto">
                  <Checkbox
                    colorScheme="blue"
                    size="md"
                    {...register("auto_near")}
                  >
                    <Text fontSize="sm" fontWeight="500">
                      Auto near
                    </Text>
                  </Checkbox>
                </FormControl>

                <FormControl w="auto">
                  <Checkbox
                    colorScheme="blue"
                    size="md"
                    {...register("is_active")}
                  >
                    <Text fontSize="sm" fontWeight="500">
                      Is active
                    </Text>
                  </Checkbox>
                </FormControl>
              </HStack>
            </Box>
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
