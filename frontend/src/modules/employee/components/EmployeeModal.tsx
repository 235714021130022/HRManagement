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
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { useEffect, useMemo } from "react";

import theme from "../../../theme";
import LabelItem from "../../../components/common/Label";
import { useNotify } from "../../../components/notification/NotifyProvider";

import type { FormEmployeeValues, IEmployee } from "../types";
import {
  EmployeeStatus,
  type EmployeeStatusType,
  EMPLOYEE_STATUS_DISPLAY,
  GenderEmployee,
  type GenderEmployeeType,
  GENDER_EMPLOYEE_DISPLAY,
} from "../../../constant";

import { useCreateEmployee } from "../api/add_employee";
import { useUpdateEmployee } from "../api/update_employee";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useGetRoles } from "../api/get_role";

const toDateInput = (v?: any) => {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return "";
};

const normalizeVNPhone = (value: string) => {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("84")) return "0" + digits.slice(2);
  if (digits.startsWith("0")) return digits;
  return digits;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  data?: IEmployee; 
  onSuccess?: () => void;
};

export default function EmployeeModal({
  isOpen,
  onClose,
  mode,
  data,
  onSuccess,
}: Props) {
  const notify = useNotify();
  const createM = useCreateEmployee();
  const updateM = useUpdateEmployee();

  const defaultValues: FormEmployeeValues = useMemo(
    () => ({
      emp_code: "",
      employee_name: "",
      password: "",

      date_of_birth: "",
      gender: null,

      address: "",
      email: "",

      status: EmployeeStatus.Active as EmployeeStatusType,

      email_account: "",
      phone_account: "",

      is_active: true,
      role_ids: [],
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
    formState: { errors, isSubmitting },
  } = useForm<FormEmployeeValues>({
    mode: "onChange",
    defaultValues: {
        role_ids: []
    },
  });

  // fill form when edit
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && data) {
      reset({
        emp_code: data.emp_code ?? "",
        employee_name: data.employee_name ?? "",
        password: "",

        date_of_birth: toDateInput(data.date_of_birth),
        gender: (data.gender as GenderEmployeeType) ?? null,

        address: data.address ?? "",
        email: data.email ?? "",

        status: data.status as EmployeeStatusType,

        email_account: data.email_account ?? "",
        phone_account: data.phone_account ?? "",

        is_active: Boolean(data.is_active),

        role_ids: (data.roles ?? []).map((x: any) => x?.role?.id ?? x?.id_role ?? x?.id)
                                    .filter(Boolean),
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, mode, data, reset, defaultValues]);

  const onSubmit = async (values: FormEmployeeValues) => {
    const payload: any = {
      emp_code: values.emp_code?.trim() || null,
      employee_name: values.employee_name?.trim() || null,

      // add: bắt buộc; edit: optional
      ...(mode === "add"
        ? { password: values.password?.trim() || "000000" }
        : values.password?.trim()
          ? { password: values.password.trim() }
          : {}),

      date_of_birth: values.date_of_birth ? new Date(values.date_of_birth) : null,
      gender: values.gender ?? null,

      address: values.address?.trim() || null,
      email: values.email?.trim() || null,

      status: values.status,

      email_account: values.email_account?.trim() || "",
      phone_account: normalizeVNPhone(values.phone_account),

      is_active: Boolean(values.is_active),

      role_ids: values.role_ids ?? [],
    };

    try {
      if (mode === "add") {
        await createM.mutateAsync(payload);
        notify({ message: "Employee created successfully", type: "success" });
      } else {
        if (!data?.id) return;
        await updateM.mutateAsync({ id: data.id, data: payload });
        notify({ message: "Employee updated successfully", type: "success" });
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
    }
  };

    const rolesQuery = useGetRoles({ pages: 1, limit: 200 });

    const roles = rolesQuery.data?.data ?? [];

    console.log("data.roles:", data?.roles);
    console.log("mapped:", (data?.roles ?? []).map((x:any) => x?.role?.id ?? x?.id_role ?? x?.id));
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW={{ base: "95%", md: "860px" }} w="100%" borderRadius="18px" maxH="85vh" overflow="auto">
        <ModalHeader color={theme.colors.primary} textAlign="center" fontWeight={700} fontSize="lg" py={4}>
          {mode === "add" ? "ADD EMPLOYEE" : "UPDATE EMPLOYEE"}
        </ModalHeader>

        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody pb={4} px={{ base: 4, md: 6 }}>
            {/* BASIC INFO */}
            <Text fontWeight={700} mb={2}>
              Basic information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* <FormControl isInvalid={!!errors.password}>
                <LabelItem label={mode === "add" ? "Password" : "New password"} required={mode === "add"} />
                <Input
                  type="password"
                  placeholder={mode === "add" ? "Enter password" : "Leave blank to keep old password"}
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("password", {
                    required: mode === "add" ? "Password is required" : false,
                    minLength: mode === "add" ? { value: 6, message: "Min 6 characters" } : undefined,
                  })}
                />
                <FormErrorMessage>{errors.password?.message as any}</FormErrorMessage>
              </FormControl> */}
                {mode === "edit" && (
                <FormControl>
                    <LabelItem label="Employee Code" />
                    <Input
                    value={data?.emp_code ?? ""}
                    isReadOnly
                    bg="gray.50"
                    borderColor="#d4d4d8cc"
                    size="sm"
                    />
                </FormControl>
                )}
              <FormControl isInvalid={!!errors.employee_name}>
                <LabelItem label="Employee name" required />
                <Input
                  placeholder="Enter employee name"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("employee_name", {
                    required: "Employee name is required",
                    maxLength: { value: 300, message: "Max 300 characters" },
                  })}
                />
                <FormErrorMessage>{errors.employee_name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <LabelItem label="Personal email" />
                <Input
                  placeholder="Enter email"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("email", { maxLength: { value: 100, message: "Max 100 characters" } })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <LabelItem label="Date of birth" />
                <Input type="date" borderColor="#d4d4d8cc" size="sm" {...register("date_of_birth")} />
              </FormControl>

              <FormControl>
                <LabelItem label="Gender" />
                <Select borderColor="#d4d4d8cc" size="sm" {...register("gender")}>
                  <option value="">-- Select --</option>
                  {Object.values(GenderEmployee).map((v) => (
                    <option key={v} value={v}>
                      {GENDER_EMPLOYEE_DISPLAY[v as GenderEmployeeType]}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <LabelItem label="Address" />
                <Input placeholder="Enter address" borderColor="#d4d4d8cc" size="sm" {...register("address")} />
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* ACCOUNT INFO */}
            <Text fontWeight={700} mb={2}>
              Account information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.email_account}>
                <LabelItem label="Account email" required />
                <Input
                  placeholder="account@company.com"
                  borderColor="#d4d4d8cc"
                  size="sm"
                  {...register("email_account", {
                    required: "Account email is required",
                    maxLength: { value: 100, message: "Max 100 characters" },
                  })}
                />
                <FormErrorMessage>{errors.email_account?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.phone_account}>
                <LabelItem label="Account phone" required />
                <Controller
                  name="phone_account"
                  control={control}
                  rules={{
                    required: "Phone is required",
                    validate: (v) => {
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
                          height: "32px",
                          fontSize: "14px",
                          borderRadius: "3px",
                          border: `1px solid ${isError ? "#E53E3E" : "#d4d4d8cc"}`,
                          paddingLeft: "52px",
                          background: "white",
                        }}
                        buttonStyle={{
                          width: "44px",
                          borderRadius: "3px 0 0 3px",
                          border: `1px solid ${isError ? "#E53E3E" : "#d4d4d8cc"}`,
                          background: "white",
                        }}
                        dropdownStyle={{ width: "260px", borderRadius: "8px" }}
                      />
                    );
                  }}
                />
                <FormErrorMessage>{errors.phone_account?.message as any}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            {/* OTHER */}
            <Text fontWeight={700} mb={2}>
              Other
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.status}>
                <LabelItem label="Status" required />
                <Select borderColor="#d4d4d8cc" size="sm" {...register("status", { required: "Status is required" })}>
                  {Object.values(EmployeeStatus).map((v) => (
                    <option key={v} value={v}>
                      {EMPLOYEE_STATUS_DISPLAY[v as EmployeeStatusType]}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.role_ids}>
                <LabelItem label="Roles" required />

                <Controller
                    name="role_ids"
                    control={control}
                    render={({ field }) => {
                        const selectedIds: string[] = field.value ?? [];
                    return (
                        <>
                        <Menu closeOnSelect={false} matchWidth>
                            <MenuButton
                                as={Button}
                                width="100%"
                                variant="outline"
                                size="sm"              // ✅ thêm
                                height="32px"          // ✅ giống Select size sm (hoặc "40px" nếu design m đang 40)
                                borderColor="#d4d4d8cc"// ✅ cho đồng bộ
                                textAlign="left"
                                justifyContent="flex-start"
                                overflowX="auto"
                                pr="10px"
                                rightIcon={<ChevronDownIcon fontSize="18px" />}
                                >
                            <Box display="flex" gap="6px" flexWrap="wrap">
                                {selectedIds.length > 0 ? (
                                selectedIds.map((id) => {
                                    const role = roles.find((r) => r.id === id);
                                    return (
                                    <Tag key={id} size="sm" borderRadius="full" variant="subtle" colorScheme="gray">
                                        <TagLabel>{role?.name_role ?? id}</TagLabel>
                                    </Tag>
                                    );
                                })
                                ) : (
                                <Box color="gray.400" fontSize={'sm'} fontWeight={'normal'}>Select roles</Box>
                                )}
                            </Box>
                            </MenuButton>

                            <Portal>
                            <MenuList
                                mt="-10px"
                                maxH="220px"
                                overflowY="auto"
                                zIndex={2000}
                                minW="unset"
                                w="var(--menu-button-width)"
                                borderRadius={0}
                            >
                                {roles.map((r) => {
                                const active = selectedIds.includes(r.id);

                                return (
                                    <MenuItem
                                    key={r.id}
                                    onClick={() => {
                                        if (active) field.onChange(selectedIds.filter((x) => x !== r.id));
                                        else field.onChange([...selectedIds, r.id]);
                                    }}
                                    bg={active ? '#334371' : 'white'}
                                    color={active ? 'white' : 'black'}
                                    fontSize={'sm'}
                                    _hover={{ bg: '#334371', color: 'white' }}
                                    >
                                    {r.name_role ?? r.id}
                                    </MenuItem>
                                );
                                })}
                            </MenuList>
                            </Portal>
                        </Menu>

                        <FormErrorMessage>{errors.role_ids?.message}</FormErrorMessage>
                        </>
                    );
                    }}
                />
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
              isLoading={isSubmitting || createM.isPending || updateM.isPending}
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