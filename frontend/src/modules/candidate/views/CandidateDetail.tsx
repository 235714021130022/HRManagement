import { useMemo, useRef, useState } from "react";
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
  Radio,
  RadioGroup,
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
} from "@chakra-ui/react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import type { ICandidate } from "../types";
import { useCandidateByID } from "../api/get";
import { useupdateCandidate } from "../api/update";
import { usePotentialTypes } from "../api/potential_type";
import {
  APPLICATION_STATUS_STEPS,
  getApplicationStatusIndex,
  useUpdateApplicationStatus,
} from "../api/update_status";
import { formatDateShort, formatMonth } from "../../../types";
import InfoRow from "../components/InforRow";
import CandidateAuditLog from "../components/CandidateAuditLog";
import JobCandidate from "../components/JobCandidate";
import ReviewCandidate from "../components/ReviewCandidate";
import Stars from "../components/Star";
import CandidateCvTab, {
  type CandidateCvTabHandle,
} from "../components/CandidateCVTabs";
import { FiUploadCloud } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import theme from "../../../theme";
import { useNotify } from "../../../components/notification/NotifyProvider";

export default function CandidateDetail() {
  const notify = useNotify();
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const candidateId = paramId ?? "";
  const cvTabRef = useRef<CandidateCvTabHandle | null>(null);
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
    onSuccess: () => {
      refetch();
      notify({
        type: "success",
        message: "Updated successfully",
        description: "Candidate has been moved to talent pool.",
      });
    },
    onError: (error) => {
      notify({
        type: "error",
        message: "Move failed",
        description: error?.message || "Unable to move candidate to talent pool.",
      });
    },
  });

  const {
    data: potentialTypeRes,
    isLoading: isPotentialTypeLoading,
  } = usePotentialTypes();

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

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    APPLICATION_STATUS_STEPS[0].value,
  );
  const [isTalentPoolModalOpen, setIsTalentPoolModalOpen] = useState(false);
  const [selectedPotentialTypeId, setSelectedPotentialTypeId] = useState<string>("");

  const currentStageIndex = useMemo(
    () => getApplicationStatusIndex(latestApplication?.status),
    [latestApplication],
  );

  const openStatusModal = () => {
    if (!latestApplication?.id) return;
    const defaultStatus =
      currentStageIndex >= 0
        ? APPLICATION_STATUS_STEPS[currentStageIndex].value
        : APPLICATION_STATUS_STEPS[0].value;
    setSelectedStatus(defaultStatus);
    setIsStatusModalOpen(true);
  };

  const handleSubmitStatus = () => {
    if (!latestApplication?.id) return;
    updateStatusMutation.mutate(
      {
        id: latestApplication.id,
        data: {
          status: selectedStatus,
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
                  <Avatar
                    bg="#334371"
                    color="white"
                    name={candidate.candidate_name ?? ""}
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

                <Divider my={4} />

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
                    </VStack>

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
                          {/* <MenuItem fontSize={"sm"}>
                            Move to Another Job
                          </MenuItem> */}

                          <MenuItem fontSize={"sm"} onClick={openTalentPoolModal}>
                            Move to Talent Pool
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
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
                    borderBottom="1px solid"
                    borderColor="gray.200"
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
                            variant="outline"
                          >
                            UPLOAD CV
                          </Button>
                        </HStack>

                        <TabPanels flex="1" overflow="auto">
                          <TabPanel p={0}>
                            <TabPanel p={0}>
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
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        isCentered
        size="sm"
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent>
          <ModalHeader textAlign="center">UPDATE STATUS</ModalHeader>
          <ModalBody>
            <RadioGroup value={selectedStatus} onChange={setSelectedStatus}>
              <VStack align="stretch" spacing={3}>
                {APPLICATION_STATUS_STEPS.map((step) => (
                  <Radio
                    key={step.value}
                    value={step.value}
                    sx={{
                      ".chakra-radio__control": {
                        borderColor: "gray.400", // default border
                        _hover: { borderColor: "#334371" },
                        _checked: {
                          bg: "#334371",
                          borderColor: "#334371", // checked border
                        },
                        _focusVisible: {
                          boxShadow: "0 0 0 3px rgba(51, 67, 113, 0.25)",
                        },
                      },
                    }}
                  >
                    {step.label}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button
                variant="ghost"
                onClick={() => setIsStatusModalOpen(false)}
              >
                CANCEL
              </Button>
              <Button
                background={"#334371"}
                color={"white"}
                onClick={handleSubmitStatus}
                isLoading={updateStatusMutation.isPending}
              >
                SAVE
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
    </Modal>
  );
}
