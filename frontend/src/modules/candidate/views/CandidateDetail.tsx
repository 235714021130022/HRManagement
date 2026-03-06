import React, { useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
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
import { formatDateShort, formatMonth } from "../../../types";
import InfoRow from "../components/InforRow";
import Stars from "../components/Star";
import CandidateCvTab, { type CandidateCvTabHandle } from "../components/CandidateCVTabs";
import { FiUploadCloud } from "react-icons/fi";




export default function CandidateDetail() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
      const inputRef = useRef<HTMLInputElement | null>(null);
const [isUploading, setIsUploading] = useState(false);
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

  const onClose = () => {
    navigate(-1);
    // hoặc muốn chắc chắn về list:
    // navigate("/candidates");
  };

  const appliedDate = useMemo(
    () => formatDateShort((candidate as ICandidate | undefined)?.date_applied),
    [candidate]
  );
  const dob = useMemo(
    () => formatDateShort((candidate as ICandidate | undefined)?.date_of_birth),
    [candidate]
  );

  // tab chính
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
      <ModalContent maxW="1200px" h="90vh" overflow="hidden">
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
                w="360px"
                borderRight="1px solid"
                borderColor="gray.200"
                p={4}
                overflowY="auto"
              >
                <HStack spacing={3} align="flex-start">
                  <Avatar  bg="#334371" color="white" name={candidate.candidate_name ?? ""} />

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
                    aria-label="Đặt lịch"
                    icon={<FaRegCalendarAlt />}
                    size="sm"
                    variant="outline"
                  />
                </HStack>

                <Divider my={4} />

                {/* THÔNG TIN ỨNG TUYỂN */}
                <Text fontWeight="700" mb={2}>
                  THÔNG TIN ỨNG TUYỂN
                </Text>

                <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={3}>
                  <HStack justify="space-between" align="flex-start">
                    <VStack align="flex-start" spacing={1}>
                      <HStack>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.400" />
                        <Text color="#334371" fontWeight="600" fontSize="sm">
                          Business Analysis
                        </Text>
                      </HStack>

                      <Text fontSize="sm" color="gray.600">
                        Phỏng vấn
                      </Text>

                      <HStack spacing={1} mt={1}>
                        <Box w="24px" h="6px" borderRadius="full" bg="green.400" />
                        <Box w="24px" h="6px" borderRadius="full" bg="green.400" />
                        <Box w="24px" h="6px" borderRadius="full" bg="green.400" />
                        <Box w="24px" h="6px" borderRadius="full" bg="gray.200" />
                        <Box w="24px" h="6px" borderRadius="full" bg="gray.200" />
                      </HStack>
                    </VStack>

                    <Button size="sm" colorScheme="green" variant="outline">
                      Chuyển vòng
                    </Button>
                  </HStack>

                  <Divider my={3} />

                  <InfoRow
                    label="Nhân sự khai thác"
                    value={
                      <HStack spacing={2}>
                        <Avatar size="xs" name="Giang Do" />
                        <Text fontSize="sm" noOfLines={1}>
                          Giang Do Thi Giang Do Thi
                        </Text>
                      </HStack>
                    }
                  />

                  <InfoRow
                    label="Gắn thẻ"
                    value={
                      <Button size="xs" variant="outline">
                        +
                      </Button>
                    }
                  />
                </Box>

                <Divider my={4} />

                {/* THÔNG TIN CÁ NHÂN */}
                <Text fontWeight="700" mb={2}>
                  THÔNG TIN CÁ NHÂN
                </Text>

                <VStack align="stretch" spacing={3}>
                  <InfoRow label="Số điện thoại" value={candidate.phone_number ?? ""} />
                  <InfoRow
                    label="Email"
                    value={
                      <Text fontSize="sm" color="#334371" noOfLines={1}>
                        {candidate.email ?? "-"}
                      </Text>
                    }
                  />
                  <InfoRow label="Ngày sinh" value={dob} />
                  <InfoRow label="Giới tính" value={candidate.gender ?? ""} />
                  <InfoRow label="Địa chỉ" value={candidate.address ?? ""} />
                </VStack>

                <Divider my={4} />

                {/* KINH NGHIỆM */}
<Text fontWeight="700" mb={2}>
  WORK EXPERIENCE
</Text>

<Stack spacing={4}>
  {candidate?.candidateExperiences?.length ? (
    candidate.candidateExperiences
      .filter((exp) => exp.is_active !== false)
      .map((exp, idx, arr) => {
        const from = exp.from_month ? formatMonth(exp.from_month) : "-";
        const to = exp.to_month ? formatMonth(exp.to_month) : "Present";
        const isLast = idx === arr.length - 1;

        return (
          <Flex key={exp.id} gap={1} align="flex-start">
            {/* CỘT THỜI GIAN (LEFT) */}
            <Box w="120px" flexShrink={0} pt="1px">
              <Text fontSize="sm" color="gray.600" fontWeight="600">
                {from}
              </Text>
              <Text justifyContent={'center'} alignItems={'center'}>–</Text>
              <Text fontSize="sm" color="gray.500">
                {to}
              </Text>
            </Box>

            {/* TIMELINE (DOT + LINE) */}
            {/* <Flex direction="column" align="center" pt="6px">
              <Box w="10px" h="10px" borderRadius="full" bg="#334371" />
              {!isLast && <Box w="2px" flex="1" minH="42px" bg="gray.200" mt="2px" />}
            </Flex> */}

            {/* NỘI DUNG (RIGHT) */}
            <Box flex="1" pb={isLast ? 0 : 2}>
              <Text fontWeight="600" color="gray.800">
                {exp.position || "Vị trí chưa cập nhật"}
              </Text>

              <Text fontSize="sm" color="gray.600" fontWeight="600" mt="2px">
                {exp.company_name || "Tên tổ chức chưa cập nhật"}
              </Text>

              {exp.job_description ? (
                <Box mt={2}>
                  {/* nếu mô tả của bạn là text dài, giữ nguyên */}
                  <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">
                    {exp.job_description}
                  </Text>

                  {/* nếu muốn giống TopCV hơn: bullet list (khi desc có xuống dòng) */}
                  {/* {exp.job_description
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <HStack key={i} align="flex-start" spacing={2} mt={1}>
                        <Box mt="7px" w="5px" h="5px" borderRadius="full" bg="gray.400" />
                        <Text fontSize="sm" color="gray.700">
                          {line}
                        </Text>
                      </HStack>
                    ))} */}
                </Box>
              ) : (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  (Chưa có mô tả)
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
                  <Box px={4} pt={3} borderBottom="1px solid" borderColor="gray.200">
                    <TabList whiteSpace="nowrap" >
                      <Tab fontSize={'15'} color={'#334371'} fontWeight={'700'}>HỒ SƠ ỨNG VIÊN</Tab>
                      <Tab fontSize={'15'} color={'#334371'} fontWeight={'700'}>EMAIL</Tab>
                      <Tab fontSize={'15'} color={'#334371'} fontWeight={'700'}>ĐÁNH GIÁ</Tab>
                      <Tab fontSize={'15'} color={'#334371'} fontWeight={'700'}>CÔNG VIỆC</Tab>
                      <Tab fontSize={'15'} color={'#334371'} fontWeight={'700'}>LỊCH SỬ</Tab>
                    </TabList>
                  </Box>

                  <TabPanels flex="1" overflow="hidden">
                    {/* HỒ SƠ ỨNG VIÊN */}
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
                                >CV ứng viên</Tab>
                            <Tab
                                fontWeight="600"
                                _hover={{ color: "#334371" }}
                                _selected={{
                                    color: "#334371",
                                    borderBottom: "2px solid #334371",
                                }}
                                >Thông tin ứng tuyển</Tab>
                          </TabList>

                          <Button
                            onClick={pickFile}
                            leftIcon={<FiUploadCloud />}
                            size="sm"
                            variant="outline"
                            >
                            Tải lên CV mới
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
                          <TabPanel>
                            <VStack align="stretch" spacing={4}>
                              <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={4}
                              >
                                <Text fontWeight="700" mb={3}>
                                  Thông tin ứng tuyển
                                </Text>
                                <VStack align="stretch" spacing={3}>
                                  <InfoRow label="Vị trí" value={"Business Analysis"} />
                                  <InfoRow label="Ngày apply" value={appliedDate} />
                                  <InfoRow
                                    label="Trạng thái"
                                    value={
                                      <Badge
                                        colorScheme={candidate.is_active ? "green" : "gray"}
                                        variant="subtle"
                                      >
                                        {candidate.is_active ? "ACTIVE" : "INACTIVE"}
                                      </Badge>
                                    }
                                  />
                                  <InfoRow
                                    label="Tiềm năng"
                                    value={
                                      <Badge
                                        colorScheme={candidate.is_potential ? "purple" : "gray"}
                                        variant="subtle"
                                      >
                                        {candidate.is_potential ? "POTENTIAL" : "NORMAL"}
                                      </Badge>
                                    }
                                  />
                                </VStack>
                              </Box>

                              <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={4}
                              >
                                <Text fontWeight="700" mb={3}>
                                  Ghi chú
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  (chỗ này sau bạn nhét note/comment của candidate)
                                </Text>
                              </Box>
                            </VStack>
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
                        (sau bạn build inbox/outbox theo candidate)
                      </Text>
                    </TabPanel>

                    {/* ĐÁNH GIÁ */}
                    <TabPanel p={4} h="100%" overflow="auto">
                      <Text fontWeight="700" mb={2}>
                        Đánh giá
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        (list đánh giá/phỏng vấn, rating, form add review)
                      </Text>
                    </TabPanel>

                    {/* CÔNG VIỆC */}
                    <TabPanel p={4} h="100%" overflow="auto">
                      <Text fontWeight="700" mb={2}>
                        Công việc
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        (todo/task liên quan candidate)
                      </Text>
                    </TabPanel>

                    {/* LỊCH SỬ */}
                    <TabPanel p={4} h="100%" overflow="auto">
                      <Text fontWeight="700" mb={2}>
                        Lịch sử
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        (audit log: chuyển vòng, sửa info, upload CV...)
                      </Text>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}