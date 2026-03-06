import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Controller } from "react-hook-form";
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
  Box,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import theme from "../../../theme";
import LabelItem from "../../../components/common/Label";
import { useNotify } from "../../../components/notification/NotifyProvider";

import type { BussinessType, IInforCompany, InforCompanyFormValues } from "../types";
import { BUSSINESS_TYPE } from "../constant";
import { useCreateCompany } from "../api/add_company";
import { useUpdateCompany } from "../api/update_company";
import { INFOR_COMPANY_STATUS_DISPLAY, type InforCompanyStatusType } from "../../../constant";



interface InformModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  data?: IInforCompany;
  onSuccess?: () => void;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");
const safeStr = (v?: string | null) => v ?? "";

export default function InformModal({
  isOpen,
  onClose,
  mode,
  data,
  onSuccess,
}: InformModalProps) {
  const notify = useNotify();
  const { mutateAsync: createInform } = useCreateCompany();
  const { mutateAsync: updateInform } = useUpdateCompany();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const defaultValues: InforCompanyFormValues = useMemo(
    () => ({
      infor_code: "",

      full_name: "",
      acronym_name: "",
      business_type: BUSSINESS_TYPE.LLC_ONE_MEMBER as BussinessType,
      tax_idennumber: "",
      code_company: "",

      date_stablish: "",
      image_logo: "",

      code_business: "",
      date_of_issue: "",
      place_of_issue: "",

      address: "",
      phone_number: "",
      fax: "",
      email: "",
      website: "",

      status: "",
      field_of_activity: "",

      is_active: true,
    }),
    []
  );
  const normalizeVNPhone = (value: string) => {
  const digits = (value || "").replace(/\D/g, ""); // chỉ lấy số
  // 84xxxx -> 0xxxx (VN)
  if (digits.startsWith("84")) return "0" + digits.slice(2);
  if (digits.startsWith("0")) return digits;
  return digits;
};
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InforCompanyFormValues>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && data) {
      reset({
        infor_code: safeStr(data.infor_code),

        full_name: safeStr(data.full_name),
        acronym_name: safeStr(data.acronym_name),
        business_type:
          (data.business_type as BussinessType) ??
          (BUSSINESS_TYPE.LLC_ONE_MEMBER as BussinessType),
        tax_idennumber: safeStr(data.tax_idennumber),
        code_company: safeStr(data.code_company),

        date_stablish: toDateInput(data.date_stablish),
        image_logo: safeStr(data.image_logo),

        code_business: safeStr(data.code_business),
        date_of_issue: toDateInput(data.date_of_issue),
        place_of_issue: safeStr(data.place_of_issue),

        address: safeStr(data.address),
        phone_number: safeStr(data.phone_number),
        fax: safeStr(data.fax),
        email: safeStr(data.email),
        website: safeStr(data.website),

        status: (data.status as InforCompanyStatusType) ?? (INFOR_COMPANY_STATUS_DISPLAY.Active as InforCompanyStatusType),
        field_of_activity: safeStr(data.field_of_activity),

        is_active: Boolean(data.is_active),
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, mode, data, reset, defaultValues]);

  const onSubmit = async (values: InforCompanyFormValues) => {
    setIsSubmittingForm(true);

    // ✅ Payload: không gửi infor_code vì backend auto generate (service createInfor)
    const payload = {
      full_name: values.full_name.trim() || null,
      acronym_name: values.acronym_name.trim() || null,
      business_type: values.business_type ?? null,
      tax_idennumber: values.tax_idennumber.trim() || null,
      code_company: values.code_company.trim() || null,

      // date input already "YYYY-MM-DD" => backend new Date(date)
      date_stablish: values.date_stablish ? values.date_stablish : null,
      image_logo: values.image_logo.trim() || null,

      code_business: values.code_business.trim() || null,
      date_of_issue: values.date_of_issue ? values.date_of_issue : null,
      place_of_issue: values.place_of_issue.trim() || null,

      address: values.address.trim() || null,
      phone_number: normalizeVNPhone(values.phone_number),
      fax: values.fax.trim() || null,
      email: values.email.trim() || null,
      website: values.website.trim() || null,

      status: values.status.trim() || null,
      field_of_activity: values.field_of_activity.trim() || null,

      is_active: Boolean(values.is_active),
    };

    try {
      if (mode === "add") {
        await createInform(payload as any);
        console.log(values.date_stablish); // sẽ ra "2026-02-06"
        notify({ message: "Company created successfully", type: "success" });
      } else {
        if (!data?.id) return;
        await updateInform({ id: data.id, data: payload as any });
        console.log(values.date_stablish); // sẽ ra "2026-02-06"
        notify({ message: "Company updated successfully", type: "success" });
      }

      onSuccess?.();
      reset(defaultValues);
      onClose();
    } catch (err: any) {
      let msg = "An error occurred";
      if (err?.response?.data) {
        const d = err.response.data;
        console.log(values.date_stablish); // sẽ ra "2026-02-06"
        if (Array.isArray(d.message)) msg = d.message.join(", ");
        else if (typeof d.message === "string") msg = d.message;
        else if (d.message) msg = d.message;
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
        overflow={'auto'}
      >
        <ModalHeader
          color={theme.colors.primary}
          textAlign="center"
          fontWeight={700}
          fontSize="lg"
          py={4}
        >
          {mode === "add" ? "ADD INFORMATION COMPANY" : "UPDATE INFORMATION COMPANY"}
        </ModalHeader>

        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pb={4} px={{ base: 4, md: 6 }}>
            {/* 1) COMPANY INFO */}
            <Text fontWeight={700} mb={2}>
              Company information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                    <LabelItem label="Company Code (Auto)"></LabelItem>
                    <Input
                        value={data?.infor_code ?? "Auto generate after save"}
                        isReadOnly
                        bg="gray.50"
                        borderColor="#d4d4d8cc"
                        size="sm"
                    />
                </FormControl>


              <FormControl isInvalid={!!errors.full_name}>
                <LabelItem label="Full name" required />
                <Input
                  placeholder="Enter full name"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("full_name", {
                    required: "Full name is required",
                    maxLength: { value: 255, message: "Max 255 characters" },
                  })}
                />
                <FormErrorMessage>{errors.full_name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.acronym_name}>
                <LabelItem label="Acronym name" />
                <Input
                  placeholder="Enter acronym"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("acronym_name", {
                    maxLength: { value: 50, message: "Max 50 characters" },
                  })}
                />
                <FormErrorMessage>{errors.acronym_name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.business_type}>
                <LabelItem label="Business type" required />
                <Select
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("business_type", { required: "Business type is required" })}
                >
                  {Object.values(BUSSINESS_TYPE).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.business_type?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.tax_idennumber}>
                <LabelItem label="Tax identification number" />
                <Input
                  placeholder="Enter tax id"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("tax_idennumber", {
                    maxLength: { value: 13, message: "Max 13 characters" },
                  })}
                />
                <FormErrorMessage>{errors.tax_idennumber?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.code_company}>
                <LabelItem label="Business registration code" />
                <Input
                  placeholder="Enter registration code"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("code_company", {
                    maxLength: { value: 10, message: "Max 10 characters" },
                  })}
                />
                <FormErrorMessage>{errors.code_company?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.date_stablish}>
                <LabelItem label="Establish date" />
                <Input
                  type="date"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("date_stablish")}
                />
                <FormErrorMessage>{errors.date_stablish?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.image_logo}>
                <LabelItem label="Logo URL" />
                <Input
                  placeholder="https://..."
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("image_logo")}
                />
                <FormErrorMessage>{errors.image_logo?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* 2) BUSINESS LICENSE */}
            <Text fontWeight={700} mb={2}>
              Business registration / license
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.code_business}>
                <LabelItem label="License number" />
                <Input
                  placeholder="Enter license number"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("code_business")}
                />
                <FormErrorMessage>{errors.code_business?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.date_of_issue}>
                <LabelItem label="Date of issue" />
                <Input
                  type="date"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("date_of_issue")}
                />
                <FormErrorMessage>{errors.date_of_issue?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.place_of_issue}>
                <LabelItem label="Place of issue" />
                <Input
                  placeholder="Enter place"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("place_of_issue")}
                />
                <FormErrorMessage>{errors.place_of_issue?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* 3) CONTACT */}
            <Text fontWeight={700} mb={2}>
              Contact information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.address}>
                <LabelItem label="Address" />
                <Input
                  placeholder="Enter address"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("address")}
                />
                <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
              </FormControl>

<FormControl isInvalid={!!errors.phone_number}>
  <LabelItem label="Phone number" required />

  <Controller
    name="phone_number"
    control={control}
    rules={{
      required: "Phone number is required",
      validate: (v) => {
        // v kiểu: "84917261221" (thường không có dấu +)
        const digits = (v || "").replace(/\D/g, "");
        if (digits.length < 9) return "Phone number is too short";
        if (digits.length > 15) return "Max 15 digits";
        return true;
      },
    }}
    render={({ field, fieldState }) => {
      const isError = fieldState.invalid;

      return (
        <PhoneInput
            country="vn"
            value={field.value || ""}
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
            enableSearch
            specialLabel=""
            containerStyle={{ width: "100%" }}
            inputStyle={{
                width: "100%",
                height: "32px",              // giống size="sm"
                fontSize: "14px",
                borderRadius: "3px",
                border: `1px solid ${isError ? "#E53E3E" : "#d4d4d8cc"}`,
                paddingLeft: "52px",         // chừa chỗ cho cờ
                background: "white",
            }}
            buttonStyle={{
                width: "44px",
                borderRadius: "3px 0 0 3px",
                border: `1px solid ${isError ? "#E53E3E" : "#d4d4d8cc"}`,
                background: "white",
            }}
            dropdownStyle={{
                width: "260px",
                borderRadius: "8px",
            }}
            />
      );
    }}
  />

  <FormErrorMessage>{errors.phone_number?.message as any}</FormErrorMessage>
</FormControl>
              <FormControl isInvalid={!!errors.email}>
                <LabelItem label="Email" />
                <Input
                  placeholder="Enter email"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("email")}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.website}>
                <LabelItem label="Website" />
                <Input
                  placeholder="https://..."
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("website")}
                />
                <FormErrorMessage>{errors.website?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.fax}>
                <LabelItem label="Fax" />
                <Input
                  placeholder="Enter fax"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("fax")}
                />
                <FormErrorMessage>{errors.fax?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* 4) OTHER */}
            <Text fontWeight={700} mb={2}>
              Other
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.status}>
                <LabelItem label="Status" />
                <Select size="sm" {...register("status")}>
  <option value={INFOR_COMPANY_STATUS_DISPLAY.Active}>Active</option>
  <option value={INFOR_COMPANY_STATUS_DISPLAY.Inactive}>Inactive</option>
</Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.field_of_activity}>
                <LabelItem label="Field of activity" />
                <Input
                  placeholder="Software / Data Engineering / ..."
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("field_of_activity")}
                />
                <FormErrorMessage>{errors.field_of_activity?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button size="sm" mr={3} onClick={onClose}>
              CANCEL
            </Button>
            <Button
              bg={theme.colors.primary}
              color={theme.colors.white}
              type="submit"
              isLoading={isSubmitting || isSubmittingForm}
              size="sm"
            >
              SAVE
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}