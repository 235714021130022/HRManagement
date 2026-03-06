import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Controller, useForm } from "react-hook-form";
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
  Box,
  Switch,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import theme from "../../../theme";
import LabelItem from "../../../components/common/Label";
import { useNotify } from "../../../components/notification/NotifyProvider";

import type { FormValues, ICompanyRegistrationRequest } from "../types";
import { CompanyRegistrationStatus, COMPANY_REGISTRATION_STATUS_DISPLAY, type CompanyRegistrationStatusType } from "../../../constant";
import { useCreateCompanyRegister } from "../api/add_comregis";
import { useUpdateCompanyRegister } from "../api/update_comregis";
import { todayDateInput, safeStr, toDateInput, normalizeVNPhone } from "../utils";



interface CompanyRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  data?: ICompanyRegistrationRequest;
  onSuccess?: () => void;
}

export default function CompanyRegisterModal({
  isOpen,
  onClose,
  mode,
  data,
  onSuccess,
}: CompanyRegisterModalProps) {
  const notify = useNotify();
  const { mutateAsync: createRegister } = useCreateCompanyRegister();
  const { mutateAsync: updateRegister } = useUpdateCompanyRegister();

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const defaultValues: FormValues = useMemo(
    () => ({
      companyName: "",
      email: "",
      phone: "",
      address: "",
      status: CompanyRegistrationStatus.Pending,
      approvedAt: "",
      adminNote: "",
      is_active: true,
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues,
  });

  const statusWatch = watch("status");
  const approvedAtWatch = watch("approvedAt");

  // auto fill approvedAt when status=approved
  useEffect(() => {
    if (!isOpen) return;

    if (statusWatch === CompanyRegistrationStatus.Approved) {
      if (!approvedAtWatch) setValue("approvedAt", todayDateInput(), { shouldDirty: true });
    } else {
      // nếu không approved thì clear approvedAt cho đúng logic (tuỳ bạn muốn giữ hay không)
      if (approvedAtWatch) setValue("approvedAt", "", { shouldDirty: true });
    }
  }, [isOpen, statusWatch, approvedAtWatch, setValue]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && data) {
      reset({
        companyName: safeStr(data.companyName),
        email: safeStr(data.email),
        phone: safeStr(data.phone),
        address: safeStr(data.address),
        status: (data.status as CompanyRegistrationStatusType) ?? CompanyRegistrationStatus.Pending,
        approvedAt: toDateInput(data.approvedAt as any),
        adminNote: safeStr(data.adminNote),
        is_active: Boolean(data.is_active),
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, mode, data, reset, defaultValues]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmittingForm(true);

    // payload gửi backend
    const payload = {
      companyName: values.companyName.trim(),
      email: values.email.trim(),
      phone: values.phone ? normalizeVNPhone(values.phone) : null,
      address: values.address.trim() || null,
      status: values.status,
      approvedAt: values.approvedAt ? values.approvedAt : null, // backend new Date()
      adminNote: values.adminNote.trim() || null,
      is_active: Boolean(values.is_active),
    };

    try {
      if (mode === "add") {
        await createRegister(payload as any);
        notify({ message: "Request created successfully", type: "success" });
      } else {
        if (!data?.id) return;
        await updateRegister({ id: data.id, data: payload as any });
        notify({ message: "Request updated successfully", type: "success" });
      }

      onSuccess?.();
      reset(defaultValues);
      onClose();
    } catch (err: any) {
      let msg = "An error occurred";
      const d = err?.response?.data;
      if (d) {
        if (Array.isArray(d.message)) msg = d.message.join(", ");
        else if (typeof d.message === "string") msg = d.message;
        else if (d.message) msg = String(d.message);
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
          {mode === "add" ? "ADD COMPANY REGISTRATION" : "UPDATE COMPANY REGISTRATION"}
        </ModalHeader>

        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pb={4} px={{ base: 4, md: 6 }}>
            {/* 1) REQUEST INFO */}
            <Text fontWeight={700} mb={2}>
              Request information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {mode === "edit" && (
                <FormControl>
                  <LabelItem label="Request ID" />
                  <Input value={data?.id ?? ""} isReadOnly bg="gray.50" borderColor="#d4d4d8cc" size="sm" />
                </FormControl>
              )}

              <FormControl isInvalid={!!errors.companyName}>
                <LabelItem label="Company name" required />
                <Input
                  placeholder="Enter company name"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("companyName", {
                    required: "Company name is required",
                    maxLength: { value: 255, message: "Max 255 characters" },
                  })}
                />
                <FormErrorMessage>{errors.companyName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <LabelItem label="Email" required />
                <Input
                  placeholder="company@email.com"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
                  })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.phone}>
                <LabelItem label="Phone" />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Box
                      border="1px solid"
                      borderColor="#d4d4d8cc"
                      borderRadius="md"
                      overflow="hidden"
                      _focusWithin={{ borderColor: theme.colors.primary }}
                    >
                      <PhoneInput
                        country={"vn"}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        inputStyle={{
                          width: "100%",
                          border: "none",
                          height: "32px",
                          fontSize: "14px",
                        }}
                        buttonStyle={{ border: "none" }}
                      />
                    </Box>
                  )}
                />
                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.address}>
                <LabelItem label="Address" />
                <Input
                  placeholder="Enter address"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("address", { maxLength: { value: 300, message: "Max 300 characters" } })}
                />
                <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* 2) STATUS */}
            <Text fontWeight={700} mb={2}>
              Status & approval
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.status}>
                <LabelItem label="Status" required />
                <Select
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("status", { required: "Status is required" })}
                >
                  {Object.values(CompanyRegistrationStatus).map((v) => (
                    <option key={v} value={v}>
                      {COMPANY_REGISTRATION_STATUS_DISPLAY[v]}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <LabelItem label="Active" />
                <Flex align="center" h="32px">
                  <Switch {...register("is_active")} />
                </Flex>
              </FormControl>

              {mode === "edit" && (
                <FormControl>
                  <LabelItem label="Created at" />
                  <Input
                    value={toDateInput((data?.createdAt as any) ?? "")}
                    isReadOnly
                    bg="gray.50"
                    borderColor="#d4d4d8cc"
                    size="sm"
                  />
                </FormControl>
              )}
            </SimpleGrid>

            <Divider my={4} />

            {/* 3) ADMIN NOTE */}
            <Text fontWeight={700} mb={2}>
              Admin note
            </Text>

            <FormControl isInvalid={!!errors.adminNote}>
              <LabelItem label="Note" />
              <Textarea
                placeholder="Example: Please verify company email domain / Call to confirm phone number..."
                borderColor="#d4d4d8cc"
                size="sm"
                rows={4}
                {...register("adminNote", { maxLength: { value: 1000, message: "Max 1000 characters" } })}
              />
              <FormErrorMessage>{errors.adminNote?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3} px={{ base: 4, md: 6 }} pb={5}>
            <Button variant="outline" onClick={onClose}>
              CANCEL
            </Button>

            <Button
              type="submit"
              bg={theme.colors.primary}
              color="white"
              _hover={{ opacity: 0.9 }}
              isLoading={isSubmittingForm}
              loadingText={mode === "add" ? "Creating..." : "Updating..."}
            >
              {mode === "add" ? "ADD" : "UPDATE"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}