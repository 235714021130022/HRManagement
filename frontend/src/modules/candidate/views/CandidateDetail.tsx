import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import { useDebounce } from "use-debounce";
import SearchCombobox from "../../../components/common/SearchCombobox";
import type { ICandidate } from "../types";
import { useCandidateByID } from "../api/get";
import { useupdateCandidate } from "../api/update";
import { useUploadCandidateAvatar } from "../api/upload_avatar";
import { useCreateApplication } from "../api/create_application";
import { usePotentialTypes } from "../api/potential_type";

import { formatDateShort, formatMonth } from "../../../types";
import InfoRow from "../components/InforRow";
import CandidateAuditLog from "../components/CandidateAuditLog";
import JobCandidate from "../components/JobCandidate";
import ReviewCandidate from "../components/ReviewCandidate";
import Stars from "../components/Star";
import CandidateCvTab, {
  type CandidateCvTabHandle,
} from "../components/CandidateCVTabs";
import UpdateStatus from "../components/UpdateStatus";
import { FiUploadCloud } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import theme from "../../../theme";
import { useNotify } from "../../../components/notification/NotifyProvider";
import { BASE_URL } from "../../../constant/config";

import { useGetInform } from "../../recruit_inf/api/get";
import type { IRecruitmentInfor } from "../../recruit_inf/types";
import { useUpdateApplicationStatus } from "../api/update_status";
import { getApplicationStatusIndex } from "../utils";
import { APPLICATION_STATUS_STEPS } from "../../../constant";
export default function CandidateDetail() {
  const notify = useNotify();
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const candidateId = paramId ?? "";
  const cvTabRef = useRef<CandidateCvTabHandle | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const pickFile = () => {
    cvTabRef.current?.pickFile();
  };
  const {
    data: candidate,
    isLoading,
    isError,
    refetch,
  } = useCandidateByID(candidateId, { enabled: !!candidateId });

  const updateStatusMutation = useUpdateApplicationStatus({
    onSuccess: () => {
      refetch();
    },
  });

  const updateCandidateMutation = useupdateCandidate({
    config: {
      onSuccess: () => {
        refetch();
        notify({
          type: "success",
          message: "Updated successfully",
          description: "Candidate has been moved to talent pool.",
        });
      },
      onError: (error: Error) => {
        notify({
          type: "error",
          message: "Move failed",
          description: error?.message || "Unable to move candidate to talent pool.",
        });
      },
    },
  });

  const {
    data: potentialTypeRes,
    isLoading: isPotentialTypeLoading,
  } = usePotentialTypes();

  const uploadAvatarMutation = useUploadCandidateAvatar({
    onSuccess: () => {
      refetch();
      notify({
        type: "success",
        message: "Avatar updated",
        description: "Candidate avatar has been uploaded successfully.",
      });
    },
    onError: (error) => {
      notify({
        type: "error",
        message: "Upload failed",
        description: error.message || "Unable to upload avatar.",
      });
    },
  });

  const onClose = () => {
    navigate(-1);
    // or force navigation back to the list:
    // navigate("/candidates");
  };

  const appliedDate = useMemo(
    () => formatDateShort((candidate as ICandidate | undefined)?.date_applied),
    [candidate],
  );
  const dob = useMemo(
    () => formatDateShort((candidate as ICandidate | undefined)?.date_of_birth),
    [candidate],
  );

  const latestApplication = useMemo(
    () => (candidate as ICandidate | undefined)?.statusApplication?.[0],
    [candidate],
  );

  const applicationTitle = useMemo(() => {
    return (
      latestApplication?.recruitment_infor?.post_title ||
      latestApplication?.recruitment_infor?.internal_title ||
      "No job posting yet"
    );
  }, [latestApplication]);

  const applicationStatus = latestApplication?.status || "No status yet";

  const avatarUrl = useMemo(() => {
    if (!candidate?.avatar_file) return undefined;
    return `${BASE_URL}/uploads/avatar/${candidate.avatar_file}`;
  }, [candidate?.avatar_file]);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTalentPoolModalOpen, setIsTalentPoolModalOpen] = useState(false);
  const [selectedPotentialTypeId, setSelectedPotentialTypeId] = useState<string>("");
  

  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState("");
  const [assigningNote, setAssigningNote] = useState("");
  const [debouncedJobSearch] = useDebounce(jobSearch, 300);

  const { data: recruitmentRes, isLoading: isLoadingRecruitments } = useGetInform({
    pages: 1,
    limit: 100,
    search: debouncedJobSearch,
  });

  const createApplicationMutation = useCreateApplication({
    config: {
      onSuccess: () => {
        notify({
          type: "success",
          message: "Candidate moved",
          description: "Candidate has been assigned to the selected job posting.",
        });
        setShowAssignPanel(false);
        setSelectedRecruitmentId("");
        setAssigningNote("");
        refetch();
      },
      onError: (error) => {
        const err = error as {
          response?: { data?: { message?: string | string[] } };
          message?: string;
        };

        const raw = err?.response?.data?.message ?? err?.message ?? "Failed to assign candidate.";
        const message = Array.isArray(raw) ? raw.join(", ") : raw;

        notify({
          type: "error",
          message: "Assign failed",
          description: message,
        });
      },
    },
  });

  const recruitmentOptions = useMemo(() => {
    const list = recruitmentRes?.data ?? [];
    return list.filter((item) => item.is_active !== false);
  }, [recruitmentRes]);

  const recruitmentComboOptions = recruitmentOptions.map((item: IRecruitmentInfor) => {
    return {
      id: item.id,
      name: item.post_title || item.internal_title || "Untitled posting",
    };
  });

  const hasApplication = Boolean(latestApplication?.id);

  const currentStageIndex = useMemo(
    () => getApplicationStatusIndex(latestApplication?.status),
    [latestApplication],
  );

  const openStatusModal = () => {
    if (!latestApplication?.id) return;
    setIsStatusModalOpen(true);
  };

  const handleSubmitStatus = async (newStatus: string) => {
    if (!latestApplication?.id) return;
    updateStatusMutation.mutate(
      {
        id: latestApplication.id,
        data: {
          status: newStatus,
        },
      },
      {
        onSuccess: () => {
          setIsStatusModalOpen(false);
        },
      },
    );
  };



  const potentialTypeOptions = useMemo(
    () => potentialTypeRes?.data ?? [],
    [potentialTypeRes],
  );

  const openTalentPoolModal = () => {
    setSelectedPotentialTypeId((candidate as ICandidate | undefined)?.potential_type_id ?? "");
    setIsTalentPoolModalOpen(true);
  };

  const handleMoveToTalentPool = () => {
    if (!selectedPotentialTypeId) {
      notify({
        type: "warning",
        message: "Potential type is required",
        description: "Please select a potential type before moving this candidate.",
      });
      return;
    }

    updateCandidateMutation.mutate(
      {
        id: candidateId,
        data: {
          is_potential: true,
          potential_type_id: selectedPotentialTypeId,
        },
      },
      {
        onSuccess: () => {
          setIsTalentPoolModalOpen(false);
        },
      },
    );
  };

  const handleAssignCandidate = () => {
    if (!candidateId || !selectedRecruitmentId) {
      notify({
        type: "warning",
        message: "Job posting is required",
        description: "Please select a job posting before assigning this candidate.",
      });
      return;
    }

    createApplicationMutation.mutate({
      candidate_id: candidateId,
      recruitment_infor_id: selectedRecruitmentId,
      note: assigningNote.trim() || undefined,
    });
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["jpg", "jpeg", "png", "webp"];
    const maxSizeMb = 5;

    if (!ext || !allowedExt.includes(ext)) {
      notify({
        type: "warning",
        message: "Invalid file",
        description: "Only .jpg, .jpeg, .png, .webp files are allowed.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      notify({
        type: "warning",
        message: "File too large",
        description: `Maximum file size is ${maxSizeMb}MB.`,
      });
      event.target.value = "";
      return;
    }

    uploadAvatarMutation.mutate({
      candidateId,
      file,
      currentAvatarFile: candidate?.avatar_file ?? null,
    });

    event.target.value = "";
  };

  // main tabs
  const [mainTab, setMainTab] = useState(0);
  const [profileSubTab, setProfileSubTab] = useState(0);

  if (!candidateId) {
    return (
      <Center p={10}>
        <Text color="red.500">Candidate ID not found.</Text>
      </Center>
    );
  }
  return (
    <Modal isOpen={true} onClose={onClose} isCentered size="6xl">
      <ModalOverlay />
      <ModalContent maxW="1250px" h="90vh" overflow="hidden">
        <ModalCloseButton />

        <ModalBody p={0} h="100%">
          {isLoading ? (
            <Center h="100%">
              <Spinner size="xl" />
            </Center>
          ) : isError || !candidate ? (
            <Center h="100%" flexDir="column" gap={3} p={6}>
              <Text color="red.500" fontWeight="600">
                Failed to load candidate info.
              </Text>
              <HStack>
                <Button variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button onClick={onClose} background="#334371" color="white">
                  Back
                </Button>
              </HStack>
            </Center>
          ) : (
            <Flex h="100%">
              {/* LEFT PANE */}
              <Box
                w="380px"
                borderRight="1px solid"
                borderColor="gray.200"
                p={4}
                overflowY="auto"
              >
                <HStack spacing={3} align="flex-start">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />

                 <Avatar
                      bg="#334371"
                      color="white"
                      name={candidate.candidate_name ?? ""}
                      src={avatarUrl}
                    />

                  <Box minW={0} flex="1">
                    <HStack spacing={2}>
                      <Text fontWeight="700" noOfLines={1}>
                        {candidate.candidate_name ?? "N/A"}
                      </Text>
                    </HStack>

                    <Text fontSize="sm" color="gray.600">
                      Applied date {appliedDate || "-"}
                    </Text>

                    <Box mt={2}>
                      <Stars value={0} />
                    </Box>
                  </Box>

                  <IconButton
                    aria-label="Schedule"
                    icon={<FaRegCalendarAlt />}
                    size="sm"
                    variant="outline"
                  />
                </HStack>

                <Divider my={3} />

                {/* APPLICATION INFORMATION */}
                <Text fontWeight="700" mb={2}>
                  APPLICATION INFORMATION
                </Text>

                <Box
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                >
                  <HStack justify="space-between" align="flex-start">
                    <VStack align="flex-start" spacing={1}>
                      <HStack>
                        <Text color="#334371" fontWeight="600" fontSize="sm">
                          {applicationTitle}
                        </Text>
                      </HStack>

                      <Text fontSize="sm" color="gray.600">
                        {applicationStatus}
                      </Text>

                      <HStack spacing={1} mt={1}>
                        {APPLICATION_STATUS_STEPS.map((stage, index) => (
                          <Box
                            key={stage.value}
                            w="24px"
                            h="6px"
                            borderRadius="full"
                            bg={
                              index <= currentStageIndex
                                ? "green.400"
                                : "gray.200"
                            }
                            title={stage.label}
                          />
                        ))}
                      </HStack>
{!hasApplication && (
  <Box pt={2} w="100%">
    <Button
      size="sm"
      bg="#334371"
      color="white"
      borderRadius="full"
      px={4}
      fontWeight="600"
      _hover={{ bg: "#2b3760" }}
      _active={{ bg: "#253050" }}
      onClick={() => setShowAssignPanel((prev) => !prev)}
      isLoading={createApplicationMutation.isPending}
    >
      {showAssignPanel ? "Close Assign Panel" : "Assign to Job"}
    </Button>

    {showAssignPanel && (
      <Box
        mt={3}
        w="100%"
        p={4}
        bg="gray.50"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        boxShadow="sm"
      >
        <VStack spacing={3} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={1}>
              Assign to job posting
            </Text>
            <Text fontSize="xs" color="gray.500">
              Select a job posting to attach this candidate.
            </Text>
          </Box>

          <Box>
            <SearchCombobox
              value={selectedRecruitmentId}
              onChange={setSelectedRecruitmentId}
              options={recruitmentComboOptions}
              placeholder={
                isLoadingRecruitments
                  ? "Loading job postings..."
                  : "Search and select job posting"
              }
              isDisabled={isLoadingRecruitments}
              isClearable
              zIndex={3000}
            />
          </Box>

          <Input
            size="sm"
            placeholder="Optional note"
            value={assigningNote}
            onChange={(e) => setAssigningNote(e.target.value)}
            bg="white"
            borderColor="gray.200"
            _hover={{ borderColor: "gray.300" }}
            _focus={{
              borderColor: "#334371",
              boxShadow: "0 0 0 1px #334371",
            }}
          />

          <HStack justify="flex-end" pt={1}>
            <Button
              size="sm"
              variant="ghost"
              color="gray.600"
              onClick={() => {
                setShowAssignPanel(false);
                setSelectedRecruitmentId("");
                setAssigningNote("");
                setJobSearch("");
              }}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              bg="#334371"
              color="white"
              px={4}
              borderRadius="md"
              _hover={{ bg: "#2b3760" }}
              _active={{ bg: "#253050" }}
              onClick={handleAssignCandidate}
              isLoading={createApplicationMutation.isPending}
              isDisabled={!selectedRecruitmentId}
            >
              Assign Candidate
            </Button>
          </HStack>
        </VStack>
      </Box>
    )}
  </Box>
)}
                          </VStack>

                    {hasApplication && (
                      <Flex alignItems={"center"} gap={1}>
                        <Button
                          size="sm"
                          background={"#334371"}
                          color={"white"}
                          onClick={openStatusModal}
                          isDisabled={!latestApplication?.id}
                        >
                          UPDATE
                        </Button>
                        <Menu placement="bottom-end">
                          <MenuButton
                            as={IconButton}
                            icon={<BsThreeDotsVertical />}
                            variant="ghost"
                            size="sm"
                            aria-label="Options"
                          />

                          <MenuList w={"fit-content"} minW={"unset"}>
                            <MenuItem fontSize={"sm"} onClick={openTalentPoolModal}>
                              Move to Talent Pool
                            </MenuItem>
                            <MenuItem color={'red'} fontSize={"sm"}>
                              Reject Candidate
                            </MenuItem>

                          </MenuList>
                        </Menu>
                      </Flex>
                    )}
                  </HStack>
                </Box>

                <Divider my={4} />

                {/* PERSONAL INFORMATION */}
                <Text fontWeight="700" mb={2}>
                  PERSONAL INFORMATION
                </Text>

                <VStack align="stretch" spacing={3}>
                  <InfoRow
                    label="Phone Number"
                    value={candidate.phone_number ?? ""}
                  />
                  <InfoRow
                    label="Email"
                    value={
                      <Text fontSize="sm" color={theme.colors.primary} noOfLines={1}>
                        {candidate.email ?? "-"}
                      </Text>
                    }
                  />
                  <InfoRow label="Date of Birth" value={dob} />
                  <InfoRow label="Gender" value={candidate.gender ?? ""} />
                  <InfoRow label="Address" value={candidate.address ?? ""} />
                </VStack>

                <Divider my={4} />

                {/* WORK EXPERIENCE */}
                <Text fontWeight="700" mb={2}>
                  WORK EXPERIENCE
                </Text>

                <Stack spacing={4}>
                  {candidate?.candidateExperiences?.length ? (
                    candidate.candidateExperiences
                      .filter((exp) => exp.is_active !== false)
                      .map((exp, idx, arr) => {
                        const from = exp.from_month
                          ? formatMonth(exp.from_month)
                          : "-";
                        const to = exp.to_month
                          ? formatMonth(exp.to_month)
                          : "Present";
                        const isLast = idx === arr.length - 1;

                        return (
                          <Flex key={exp.id} gap={1} align="flex-start">
                            {/* TIME COLUMN (LEFT) */}
                            <Box w="120px" flexShrink={0} pt="1px">
                              <Text
                                fontSize="sm"
                                color="gray.600"
                                fontWeight="600"
                              >
                                {from}
                              </Text>
                              <Text
                                justifyContent={"center"}
                                alignItems={"center"}
                              >
                                –
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {to}
                              </Text>
                            </Box>


                            {/* CONTENT (RIGHT) */}
                            <Box flex="1" pb={isLast ? 0 : 2}>
                              <Text fontWeight="600" color="gray.800">
                                {exp.position || "Position not updated"}
                              </Text>

                              <Text
                                fontSize="sm"
                                color="gray.600"
                                fontWeight="600"
                                mt="2px"
                              >
                                {exp.company_name ||
                                  "Organization name not updated"}
                              </Text>

                              {exp.job_description ? (
                                <Box mt={2}>
                                  {/* if the description is long text, keep it as-is */}
                                  <Text
                                    fontSize="sm"
                                    color="gray.700"
                                    whiteSpace="pre-line"
                                  >
                                    {exp.job_description}
                                  </Text>
                                </Box>
                              ) : (
                                <Text fontSize="sm" color="gray.500" mt={2}>
                                  (No description yet)
                                </Text>
                              )}
                            </Box>
                          </Flex>
                        );
                      })
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No work experience yet.
                    </Text>
                  )}
                </Stack>
              </Box>

              {/* RIGHT PANE */}
              <Box flex="1" overflow="hidden">
                <Tabs
                  index={mainTab}
                  onChange={setMainTab}
                  variant="enclosed"
                  h="100%"
                  display="flex"
                  flexDirection="column"
                >
                  <Box
                    px={4}
                    pt={3}
                  >
                    <TabList whiteSpace="nowrap">
                      <Tab fontSize={"14"} color={"#334371"} fontWeight={"700"}>
                        CANDIDATE PROFILE
                      </Tab>
                      <Tab fontSize={"14"} color={"#334371"} fontWeight={"700"}>
                        EMAIL
                      </Tab>
                      <Tab fontSize={"14"} color={"#334371"} fontWeight={"700"}>
                        REVIEWS
                      </Tab>
                      <Tab fontSize={"14"} color={"#334371"} fontWeight={"700"}>
                        JOBS
                      </Tab>
                      <Tab fontSize={"14"} color={"#334371"} fontWeight={"700"}>
                        HISTORY
                      </Tab>
                    </TabList>
                  </Box>

                  <TabPanels flex="1" overflow="hidden">
                    {/* CANDIDATE PROFILE */}
                    <TabPanel p={0} h="100%">
                      <Tabs
                        index={profileSubTab}
                        onChange={setProfileSubTab}
                        h="100%"
                        display="flex"
                        flexDirection="column"
                      >
                        <HStack px={4} py={3} justify="space-between">
                          <TabList>
                            <Tab
                              fontWeight="600"
                              _hover={{ color: "#334371" }}
                              _selected={{
                                color: "#334371",
                                borderBottom: "2px solid #334371",
                              }}
                            >
                              Candidate CV
                            </Tab>
                          </TabList>

                          <Button
                            onClick={pickFile}
                            leftIcon={<FiUploadCloud />}
                            size="sm"
                            
                          >
                            UPLOAD CV
                          </Button>
                        </HStack>

                        <TabPanels flex="1">
                          <TabPanel p={0}>
                            <TabPanel p={0} h={'Z'}>
                              <CandidateCvTab
                                ref={cvTabRef}
                                candidateId={candidateId}
                                cvFile={candidate.cv_file}
                                onUploaded={refetch}
                              />
                            </TabPanel>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </TabPanel>

                    {/* EMAIL */}
                    <TabPanel p={4} h="100%" overflow="auto">
                      <Text fontWeight="700" mb={2}>
                        Email
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        (Build candidate inbox/outbox here later.)
                      </Text>
                    </TabPanel>

                    {/* REVIEWS */}
                    <TabPanel p={4} h="100%" overflow="auto">
                      <ReviewCandidate candidateId={candidateId} />
                    </TabPanel>

                    {/* JOBS */}
                    <TabPanel p={4} h="100%" overflow="auto">
                      <JobCandidate
                        jobCandidates={candidate.jobCandidates ?? []}
                      />
                    </TabPanel>

                    {/* HISTORY */}
                    <TabPanel p={4} h="100%" overflow="auto">
                      <CandidateAuditLog candidateId={candidateId} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>

      <Modal
        isOpen={isTalentPoolModalOpen}
        onClose={() => setIsTalentPoolModalOpen(false)}
        isCentered
        size="sm"
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent>
          <ModalHeader textAlign="center">MOVE TO TALENT POOL</ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="gray.600">
                Select a potential type for this candidate.
              </Text>
              <Select
                placeholder={isPotentialTypeLoading ? "Loading potential types..." : "Select potential type"}
                value={selectedPotentialTypeId}
                onChange={(e) => setSelectedPotentialTypeId(e.target.value)}
                isDisabled={isPotentialTypeLoading}
              >
                {potentialTypeOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button
                variant="ghost"
                onClick={() => setIsTalentPoolModalOpen(false)}
              >
                CANCEL
              </Button>
              <Button
                background="#334371"
                color="white"
                onClick={handleMoveToTalentPool}
                isLoading={updateCandidateMutation.isPending}
              >
                SAVE
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <UpdateStatus
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={latestApplication?.status}
        onUpdate={handleSubmitStatus}
        isLoading={updateStatusMutation.isPending}
      />
    </Modal>
  );
}
