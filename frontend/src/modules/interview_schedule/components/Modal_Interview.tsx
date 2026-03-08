import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
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
import { AddIcon } from "@chakra-ui/icons";
import theme from "../../../theme";

export interface IInterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  recruitmentOptions?: Array<{ label: string; value: string }>;
  locationOptions?: Array<{ label: string; value: string }>;
  scheduleTypeOptions?: Array<{ label: string; value: string }>;
  evaluationOptions?: Array<{ label: string; value: string }>;
  candidateOptions?: Array<{ id: string; name: string; email?: string }>;
}

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

export default function InterviewScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  recruitmentOptions = [
    { label: "Frontend Developer", value: "1" },
    { label: "Backend Developer", value: "2" },
  ],
  locationOptions = [
    { label: "Hanoi Office", value: "hn" },
    { label: "Ho Chi Minh Office", value: "hcm" },
  ],
  scheduleTypeOptions = [
    { label: "In-person Interview", value: "offline" },
    { label: "Online Interview", value: "online" },
  ],
  evaluationOptions = [
    { label: "Round 1 Evaluation Form", value: "1" },
    { label: "Technical Evaluation Form", value: "2" },
  ],
  candidateOptions = [],
}: IInterviewScheduleModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'4xl'} isCentered>
      <ModalOverlay/>

      <ModalContent
        maxW="1080px"
        my={8}
        borderRadius="18px"
        overflow="hidden"
        boxShadow="0 24px 80px rgba(15, 23, 42, 0.18)"
      >
        <ModalHeader textAlign={'center'} px={6} py={5} fontSize="25px" fontWeight="800" lineHeight="1.1">
          SCHEDULE INTERVIEW
        </ModalHeader>
        <ModalCloseButton top={5} right={5} />

        <ModalBody p={0}         >
          <Grid  templateColumns={{ base: "1fr", lg: "1.15fr 0.85fr" }}>
            <GridItem px={6} py={2} bg="white">
              <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                  <FormLabel sx={labelProps}>Job Posting</FormLabel>
                  <Select placeholder="Select job posting" {...fieldProps}>
                    {recruitmentOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={3.5}>
                  <FormControl isRequired>
                    <FormLabel sx={labelProps}>Date</FormLabel>
                    <Input type="date" {...fieldProps} />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel sx={labelProps}>Start Time</FormLabel>
                    <Input type="time" {...fieldProps} />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel sx={labelProps}>Duration (minutes)</FormLabel>
                    <Input type="number" min={15} step={15} defaultValue={30} {...fieldProps} />
                  </FormControl>
                </Grid>

                <Checkbox colorScheme="blue" size="md">
                  <Text  fontWeight="500" color="gray.700">
                    Candidates join simultaneously
                  </Text>
                </Checkbox>

                <Grid templateColumns={{ base: "1fr", md: "1.35fr 0.85fr" }} gap={3.5}>
                  <FormControl isRequired>
                    <FormLabel sx={labelProps}>Location</FormLabel>
                    <Select placeholder="Select work location" {...fieldProps}>
                      {locationOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel sx={labelProps}>Room</FormLabel>
                    <Input placeholder="Enter room name" {...fieldProps} />
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel sx={labelProps}>Schedule Type</FormLabel>
                  <Select placeholder="Select schedule type" defaultValue="offline" {...fieldProps}>
                    {scheduleTypeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel sx={labelProps}>Notes for Candidate</FormLabel>
                  <Textarea
                    placeholder="Example: Candidate should bring a personal laptop or arrive 10 minutes early"
                    maxH="92px"
                    resize="vertical"
                    {...fieldProps}
                  />
                </FormControl>

                <HStack spacing={6} pt={1} pb={2} flexWrap="wrap">
                  <Checkbox colorScheme="blue" size="md" defaultChecked>
                    <Text  fontWeight="500" color="gray.700">
                      Email to candidate
                    </Text>
                  </Checkbox>

                  <Checkbox colorScheme="blue" size="md" defaultChecked>
                    <Text  fontWeight="500" color="gray.700">
                      Internal email
                    </Text>
                  </Checkbox>
                </HStack>
              </VStack>
            </GridItem>

            <GridItem borderLeft="1px solid" borderColor="gray.200" px={6} py={5}>
              <VStack align="stretch" spacing={4} h="full">
                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="800" letterSpacing="0.02em" color="gray.800">
                    Candidates
                  </Text>

                  <IconButton
                    aria-label="Add candidate"
                    icon={<AddIcon boxSize={3} />}
                    size="sm"
                    rounded="full"
                    bg="white"
                    color="gray.700"
                    borderWidth="1px"
                    borderColor="gray.200"
                    _hover={{ bg: "gray.50" }}
                  />
                </HStack>

                <Divider borderColor="gray.200" />

                {candidateOptions.length === 0 ? (
                  <Box pt={1}>
                    <Text  color="gray.500" lineHeight="1.7">
                      The selected job posting has no candidates yet.
                    </Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {candidateOptions.map((candidate) => (
                      <Box
                        key={candidate.id}
                        bg="white"
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="14px"
                        px={4}
                        py={3}
                      >
                        <Text  fontWeight="700" color="gray.800">
                          {candidate.name}
                        </Text>
                        {candidate.email ? (
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {candidate.email}
                          </Text>
                        ) : null}
                      </Box>
                    ))}
                  </VStack>
                )}
              </VStack>
            </GridItem>
          </Grid>
        </ModalBody>

        <ModalFooter bg="#FCFCFD" borderTop="1px solid" borderColor="gray.200" px={6} py={4}>
          <HStack w="full" justify="flex-end" spacing={3}>
            <Button variant="ghost" onClick={onClose} fontWeight="600" minW="88px">
              CANCEL
            </Button>
            <Button
              bg={theme.colors.primary}
              color={'white'}
              onClick={onSubmit}
              isLoading={isLoading}
              px={6}
              minW="112px"
              borderRadius="10px"
              fontWeight="700"
            >
              CONTINUE
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/*
const [isOpen, setIsOpen] = React.useState(false);

<InterviewScheduleModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={() => console.log("submit")}
/>
*/