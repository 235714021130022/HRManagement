import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  Select,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import theme from "../../../theme";
import SearchCombobox from "../../../components/common/SearchCombobox";
import { useNotify } from "../../../components/notification/NotifyProvider";
import {
  SCHEDULE_TYPE_DISPLAY,
  ScheduleType,
  type ScheduleTypeType,
} from "../../../constant";
import { useGetApplication } from "../api/get_application";
import {
  type CreateInterviewScheduleDto,
  useCreateInterviewSchedule,
} from "../api/create";
import { useUpdateInterviewSchedule } from "../api/update";
import type { IInterviewScheduleDetail } from "../types";
import {
  addMinutesToTime,
  formatDateToInputDate,
  formatDateToInputTime,
  getInitials,
} from "../utils";

export interface IInterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  data?: IInterviewScheduleDetail;
  onSubmit?: (payload: CreateInterviewScheduleDto) => Promise<void> | void;
  onSuccess?: () => void;
}

type InterviewScheduleFormValues = {
  interview_date: string;
  start_time: string;
  time_duration: number;
  is_simultaneous: boolean;
  interview_room: string;
  schedule_type: ScheduleTypeType | "";
  meeting_link: string;
  note: string;
  send_email_candidate: boolean;
};

const fieldProps = {
  size: "md" as const,
  bg: "white",
  borderColor: "gray.200",
  borderRadius: "10px",
  _hover: { borderColor: "gray.300" },
  _focusVisible: {
    borderColor: "blue.400",
    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
  },
};

const labelProps = {
  mb: 1.5,
  fontWeight: 600,
  color: "gray.700",
};

const safeString = (value?: string | null) => value ?? "";

const normalizeTypeToken = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const toScheduleTypeValue = (rawType?: string | null): ScheduleTypeType | "" => {
  const raw = rawType?.trim();
  if (!raw) {
    return "";
  }

  const normalizedRaw = normalizeTypeToken(raw);

  const enumMatch = (Object.values(ScheduleType) as ScheduleTypeType[]).find(
    (type) => normalizeTypeToken(type) === normalizedRaw,
  );

  if (enumMatch) {
    return enumMatch;
  }

  const displayMatch = (Object.entries(SCHEDULE_TYPE_DISPLAY) as Array<
    [ScheduleTypeType, string]
  >).find(([, label]) => normalizeTypeToken(label) === normalizedRaw);

  if (displayMatch) {
    return displayMatch[0];
  }

  return "";
};

export default function InterviewScheduleModal({
  isOpen,
  onClose,
  mode = "add",
  data,
  onSubmit,
  onSuccess,
}: IInterviewScheduleModalProps) {
  const notify = useNotify();
  const { mutateAsync: createInterview } = useCreateInterviewSchedule();
  const { mutateAsync: updateInterview } = useUpdateInterviewSchedule();

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [selectedRecruitmentID, setSelectedRecruitmentID] = useState("");
  const [candidatePickerValue, setCandidatePickerValue] = useState("");
  const [selectedCandidateIDs, setSelectedCandidateIDs] = useState<string[]>([]);

  const {
    data: applicationRes,
    isLoading: isApplicationLoading,
    isError,
  } = useGetApplication({
    pages: 1,
    limit: 100,
  });

  const defaultValues = useMemo<InterviewScheduleFormValues>(
    () => ({
      interview_date: "",
      start_time: "",
      time_duration: 30,
      is_simultaneous: true,
      interview_room: "",
      schedule_type: "",
      meeting_link: "",
      note: "",
      send_email_candidate: true,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InterviewScheduleFormValues>({
    mode: "onChange",
    defaultValues,
  });

  const interviewDate = watch("interview_date");
  const startTime = watch("start_time");
  const duration = watch("time_duration");
  const isSimultaneous = watch("is_simultaneous");
  const scheduleType = watch("schedule_type");

  const applications = applicationRes?.data ?? [];

  const recruitmentOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();

    applications.forEach((app) => {
      if (!app.recruitment_infor_id || map.has(app.recruitment_infor_id)) {
        return;
      }

      map.set(app.recruitment_infor_id, {
        value: app.recruitment_infor_id,
        label: app.recruitment_infor?.post_title || "Untitled Job",
      });
    });

    return Array.from(map.values());
  }, [applications]);

  const selectedWorkLocation = useMemo(() => {
    if (!selectedRecruitmentID) {
      return "";
    }

    const selectedApp = applications.find(
      (app) => app.recruitment_infor_id === selectedRecruitmentID,
    );

    return selectedApp?.recruitment_infor?.workLocation?.full_name || "";
  }, [applications, selectedRecruitmentID]);

  const candidateOptions = useMemo(() => {
    return applications
      .filter((app) => app.recruitment_infor_id === selectedRecruitmentID)
      .map((app) => ({
        id: app.candidate?.id || app.candidate_id,
        name: app.candidate?.candidate_name || "Unnamed Candidate",
      }));
  }, [applications, selectedRecruitmentID]);

  const availableCandidateOptions = useMemo(() => {
    return candidateOptions.filter(
      (candidate) => !selectedCandidateIDs.includes(candidate.id),
    );
  }, [candidateOptions, selectedCandidateIDs]);

  const selectedCandidates = useMemo(() => {
    return candidateOptions.filter((candidate) =>
      selectedCandidateIDs.includes(candidate.id),
    );
  }, [candidateOptions, selectedCandidateIDs]);

  const endTime = useMemo(() => {
    return addMinutesToTime(interviewDate, startTime, duration);
  }, [interviewDate, startTime, duration]);

  const isExternalOnlineInterview =
    scheduleType === ScheduleType.ExternalOnlineInterview;

  const getCandidateTime = (index: number) => {
    if (isSimultaneous) {
      return {
        start: startTime,
        end: endTime,
      };
    }

    const startOffset = index * duration;
    const start = addMinutesToTime(interviewDate, startTime, startOffset);
    const end = addMinutesToTime(interviewDate, startTime, startOffset + duration);

    return {
      start,
      end,
    };
  };

  const handleRecruitmentChange = (value: string) => {
    setSelectedRecruitmentID(value);
    setCandidatePickerValue("");
    setSelectedCandidateIDs([]);
  };

  const handleRemoveCandidate = (candidateId: string) => {
    setSelectedCandidateIDs((prev) => prev.filter((id) => id !== candidateId));
  };

  const onFormSubmit = async (values: InterviewScheduleFormValues) => {
    if (!selectedRecruitmentID) {
      notify({ message: "Please select a job posting", type: "warning" });
      return;
    }

    if (selectedCandidateIDs.length === 0) {
      notify({ message: "Please select at least one candidate", type: "warning" });
      return;
    }

    setIsSubmittingForm(true);

    const payload: CreateInterviewScheduleDto = {
      interview_date: values.interview_date || null,
      interview_location: selectedWorkLocation || null,
      interview_room: values.interview_room.trim() || null,
      time_duration: Number(values.time_duration) || 0,
      type_schedule: values.schedule_type || null,
      times:
        values.interview_date && values.start_time
          ? `${values.interview_date}T${values.start_time}:00`
          : null,
      meeting_link: isExternalOnlineInterview
        ? values.meeting_link.trim() || null
        : null,
      note: values.note.trim() || null,
      candidate_ids: selectedCandidateIDs,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (mode === "edit") {
        if (!data?.id) {
          notify({ message: "Interview schedule id is missing", type: "error" });
          return;
        }

        await updateInterview({
          id: data.id,
          data: payload,
        });
      } else {
        await createInterview(payload);
      }

      notify({
        message:
          mode === "edit"
            ? "Interview schedule updated successfully"
            : "Interview schedule created successfully",
        type: "success",
      });

      onSuccess?.();
      onClose();
      reset(defaultValues);
      setSelectedRecruitmentID("");
      setCandidatePickerValue("");
      setSelectedCandidateIDs([]);
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : typeof rawMessage === "string"
          ? rawMessage
          : "An error occurred while saving interview schedule";

      notify({ message, type: "error" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === "edit" && data) {
      const interviewDateFromData = data.interview_date
        ? formatDateToInputDate(new Date(data.interview_date))
        : "";
      const startTimeFromData = data.times
        ? formatDateToInputTime(new Date(data.times))
        : "";

      reset({
        interview_date: interviewDateFromData,
        start_time: startTimeFromData,
        time_duration: data.time_duration || 30,
        is_simultaneous: true,
        interview_room: safeString(data.interview_room),
        schedule_type: toScheduleTypeValue(data.type_schedule),
        meeting_link: safeString(data.meeting_link),
        note: safeString(data.note),
        send_email_candidate: true,
      });

      setCandidatePickerValue("");
      setSelectedCandidateIDs(data.candidates?.map((item) => item.candidate_id) ?? []);
      return;
    }

    const now = new Date();

    reset({
      ...defaultValues,
      interview_date: formatDateToInputDate(now),
      start_time: formatDateToInputTime(now),
    });

    setSelectedRecruitmentID("");
    setCandidatePickerValue("");
    setSelectedCandidateIDs([]);
  }, [isOpen, mode, data, defaultValues, reset]);

  useEffect(() => {
    if (!isExternalOnlineInterview) {
      setValue("meeting_link", "");
    }
  }, [isExternalOnlineInterview, setValue]);

  useEffect(() => {
    if (!candidatePickerValue) {
      return;
    }

    setSelectedCandidateIDs((prev) => {
      if (prev.includes(candidatePickerValue)) {
        return prev;
      }

      return [...prev, candidatePickerValue];
    });

    setCandidatePickerValue("");
  }, [candidatePickerValue]);

  useEffect(() => {
    if (!isOpen || mode !== "edit" || selectedRecruitmentID) {
      return;
    }

    if (selectedCandidateIDs.length === 0 || applications.length === 0) {
      return;
    }

    const matchedApplication = applications.find((app) =>
      selectedCandidateIDs.includes(app.candidate?.id || app.candidate_id),
    );

    if (matchedApplication?.recruitment_infor_id) {
      setSelectedRecruitmentID(matchedApplication.recruitment_infor_id);
    }
  }, [
    applications,
    isOpen,
    mode,
    selectedCandidateIDs,
    selectedRecruitmentID,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />

      <ModalContent
        maxW="1080px"
        my={8}
        borderRadius="18px"
        overflow="hidden"
        boxShadow="0 24px 80px rgba(15, 23, 42, 0.18)"
      >
        <ModalHeader
          textAlign="center"
          px={6}
          py={5}
          fontSize="25px"
          fontWeight="800"
          lineHeight="1.1"
        >
          {mode === "edit" ? "UPDATE INTERVIEW SCHEDULE" : "SCHEDULE INTERVIEW"}
        </ModalHeader>
        <ModalCloseButton top={5} right={5} />

        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <ModalBody p={0}>
            <Grid templateColumns={{ base: "1fr", lg: "1.15fr 0.85fr" }}>
              <GridItem px={6} py={2} bg="white">
                <VStack spacing={3} align="stretch">
                  <FormControl isRequired>
                    <FormLabel sx={labelProps}>Job Posting</FormLabel>
                    <SearchCombobox
                      value={selectedRecruitmentID}
                      onChange={handleRecruitmentChange}
                      isLoading={isApplicationLoading}
                      options={recruitmentOptions.map((item) => ({
                        id: item.value,
                        name: item.label,
                      }))}
                      placeholder="Select job posting..."
                    />
                    {isError && (
                      <Text mt={1} fontSize="sm" color="red.500">
                        Failed to load job postings from applications.
                      </Text>
                    )}
                  </FormControl>

                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                    gap={3.5}
                  >
                    <FormControl isRequired isInvalid={!!errors.interview_date}>
                      <FormLabel sx={labelProps}>Date</FormLabel>
                      <Input
                        type="date"
                        {...register("interview_date", {
                          required: "Date is required",
                        })}
                        {...fieldProps}
                      />
                      <FormErrorMessage>{errors.interview_date?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.start_time}>
                      <FormLabel sx={labelProps}>Start Time</FormLabel>
                      <Input
                        type="time"
                        {...register("start_time", {
                          required: "Start time is required",
                        })}
                        {...fieldProps}
                      />
                      <FormErrorMessage>{errors.start_time?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.time_duration}>
                      <FormLabel sx={labelProps}>Duration (minutes)</FormLabel>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        {...register("time_duration", {
                          required: "Duration is required",
                          valueAsNumber: true,
                          min: {
                            value: 15,
                            message: "Duration must be at least 15 minutes",
                          },
                        })}
                        {...fieldProps}
                      />
                      <FormErrorMessage>{errors.time_duration?.message}</FormErrorMessage>
                    </FormControl>
                  </Grid>

                  <Checkbox colorScheme="blue" size="md" {...register("is_simultaneous")}>
                    <Text fontWeight="500" color="gray.700">
                      Candidates join simultaneously
                    </Text>
                  </Checkbox>

                  <Grid
                    templateColumns={{ base: "1fr", md: "1.35fr 0.85fr" }}
                    gap={3.5}
                  >
                    <FormControl isRequired>
                      <FormLabel sx={labelProps}>Location</FormLabel>
                      <Input
                        value={selectedWorkLocation}
                        placeholder={
                          selectedRecruitmentID
                            ? "No work location found"
                            : "Select job posting first"
                        }
                        isReadOnly
                        {...fieldProps}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel sx={labelProps}>Room</FormLabel>
                      <Input
                        placeholder="Enter room name"
                        {...register("interview_room")}
                        {...fieldProps}
                      />
                    </FormControl>
                  </Grid>

                  <FormControl isRequired isInvalid={!!errors.schedule_type}>
                    <FormLabel sx={labelProps}>Schedule Type</FormLabel>
                    <Select
                      placeholder="Select schedule type"
                      {...register("schedule_type", {
                        required: "Schedule type is required",
                      })}
                      {...fieldProps}
                    >
                      {Object.values(ScheduleType).map((value) => (
                        <option key={value} value={value}>
                          {SCHEDULE_TYPE_DISPLAY[value]}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.schedule_type?.message}</FormErrorMessage>
                  </FormControl>

                  {isExternalOnlineInterview && (
                    <FormControl isRequired isInvalid={!!errors.meeting_link}>
                      <FormLabel sx={labelProps}>Meeting Link (URL)</FormLabel>
                      <Input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        {...register("meeting_link", {
                          validate: (value) => {
                            if (!isExternalOnlineInterview) {
                              return true;
                            }

                            if (!value.trim()) {
                              return "Meeting link is required";
                            }

                            try {
                              new URL(value);
                              return true;
                            } catch {
                              return "Meeting link must be a valid URL";
                            }
                          },
                        })}
                        {...fieldProps}
                      />
                      <FormErrorMessage>{errors.meeting_link?.message}</FormErrorMessage>
                    </FormControl>
                  )}

                  <FormControl>
                    <FormLabel sx={labelProps}>Notes for Candidate</FormLabel>
                    <Textarea
                      placeholder="Example: Candidate should bring a personal laptop or arrive 10 minutes early"
                      maxH="92px"
                      resize="vertical"
                      {...register("note")}
                      {...fieldProps}
                    />
                  </FormControl>

                  <HStack spacing={6} pt={1} pb={2} flexWrap="wrap">
                    <Checkbox colorScheme="blue" size="md" {...register("send_email_candidate")}>
                      <Text fontWeight="500" color="gray.700">
                        Email to candidate
                      </Text>
                    </Checkbox>
                  </HStack>
                </VStack>
              </GridItem>

              <GridItem borderLeft="1px solid" borderColor="gray.200" px={6}>
                <VStack align="stretch" spacing={3} h="full">
                  <Text
                    fontSize="xl"
                    fontWeight="800"
                    letterSpacing="0.02em"
                    color="gray.800"
                  >
                    Candidate
                  </Text>

                  {!selectedRecruitmentID ? (
                    <Text color="gray.500" lineHeight="1.7">
                      Please select a job posting first.
                    </Text>
                  ) : (
                    <>
                      <FormControl>
                        <FormLabel sx={labelProps}>Select Candidate</FormLabel>
                        <SearchCombobox
                          value={candidatePickerValue}
                          onChange={setCandidatePickerValue}
                          isLoading={isApplicationLoading}
                          options={availableCandidateOptions.map((candidate) => ({
                            id: candidate.id,
                            name: candidate.name,
                          }))}
                          placeholder="Search and select candidate..."
                          isClearable
                        />
                      </FormControl>

                      {selectedCandidates.length === 0 ? (
                        <Box
                          borderWidth="1px"
                          borderStyle="dashed"
                          borderColor="gray.300"
                          borderRadius="md"
                          px={4}
                          py={5}
                          bg="gray.50"
                        >
                          <Text color="gray.500">No candidate selected yet.</Text>
                        </Box>
                      ) : (
                        <Box
                          bg="gray.50"
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Grid templateColumns="1.4fr 0.9fr 40px">
                            <Box
                              px={5}
                              py={4}
                              borderBottom="1px solid"
                              borderColor="gray.200"
                            >
                              <Text fontWeight="800" fontSize="15px">
                                Họ và tên
                              </Text>
                            </Box>

                            <Box
                              px={5}
                              py={4}
                              borderBottom="1px solid"
                              borderColor="gray.200"
                            >
                              <Text fontWeight="800" fontSize="15px">
                                Thời gian
                              </Text>
                            </Box>

                            <Box
                              borderBottom="1px solid"
                              borderColor="gray.200"
                            />

                            {selectedCandidates.map((candidate, index) => (
                              <Fragment key={candidate.id}>
                                <Box px={5} py={4} bg="white">
                                  <HStack spacing={4}>
                                    <Box
                                      w="40px"
                                      h="40px"
                                      rounded="full"
                                      bg={theme.colors.primary}
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      fontWeight="800"
                                      fontSize="16px"
                                      color="white"
                                    >
                                      {getInitials(candidate.name)}
                                    </Box>

                                    <Text fontWeight="700" fontSize="15px">
                                      {candidate.name}
                                    </Text>
                                  </HStack>
                                </Box>

                                <Box
                                  px={5}
                                  py={4}
                                  bg="white"
                                  display="flex"
                                  alignItems="center"
                                >
                                  <Text fontWeight="500" fontSize="15px">
                                    {(() => {
                                      const time = getCandidateTime(index);
                                      return `${time.start} - ${time.end}` || "--:--";
                                    })()}
                                  </Text>
                                </Box>

                                <Box
                                  px={3}
                                  py={4}
                                  bg="white"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <IconButton
                                    aria-label="Remove candidate"
                                    icon={<CloseIcon boxSize={2.5} />}
                                    size="sm"
                                    variant="ghost"
                                    color="gray.500"
                                    onClick={() => handleRemoveCandidate(candidate.id)}
                                    _hover={{ bg: "red.50", color: "red.500" }}
                                  />
                                </Box>
                              </Fragment>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </>
                  )}
                </VStack>
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter
            bg="#FCFCFD"
            borderTop="1px solid"
            borderColor="gray.200"
            px={6}
            py={4}
          >
            <HStack w="full" justify="flex-end" spacing={3}>
              <Button
                variant="ghost"
                onClick={onClose}
                fontWeight="600"
                minW="88px"
              >
                CANCEL
              </Button>
              <Button
                bg={theme.colors.primary}
                color="white"
                type="submit"
                isLoading={isSubmitting || isSubmittingForm}
                px={6}
                minW="112px"
                borderRadius="10px"
                fontWeight="700"
              >
                {mode === "edit" ? "UPDATE" : "SAVE"}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}