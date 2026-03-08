import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AddIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import InterviewIllustration from "../components/InterviewIllustration";
import theme from "../../../theme";
import { useState } from "react";
import Modal_Interview from "../components/Modal_Interview";

export const Interview_Schedule = () => {
    const [openModal, setOpenModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
  return (
    <Box minH="100vh">
      <VStack align="stretch">
        <Flex
          bg="white"
          justify="space-between"
          align="center"
          wrap="nowrap"
          gap={2}
        >
          <HStack flexShrink={0} whiteSpace="nowrap">
            <Button bg={theme.colors.primary} color="white"px={4}>
              ADD
            </Button>
          </HStack>

          <HStack flex="1" minW="0" justify="flex-end" spacing={1} whiteSpace="nowrap">
            <InputGroup w="50ch" bg="white" flexShrink={0}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search schedules by candidate name, job posting..."
                borderColor="gray.200"
                _placeholder={{ color: "gray.400" }}
              />
            </InputGroup>

            <HStack spacing={2}>
              <IconButton
                aria-label="Previous week"
                icon={<ChevronLeftIcon boxSize={5} />}
                variant="outline"
                bg="white"
                borderColor="gray.200"
              />
              <Text whiteSpace="nowrap">
                2/3/2026 - 8/3/2026
              </Text>
              <IconButton
                aria-label="Next week"
                icon={<ChevronRightIcon boxSize={5} />}
                variant="outline"
                bg="white"
                borderColor="gray.200"
              />
            </HStack>

            <HStack color="gray.700" fontWeight="600" flexShrink={0} whiteSpace="nowrap">
              
            </HStack>
            <Button
              leftIcon={<CalendarIcon />}
              variant="outline"
              bg="white"
              borderColor="gray.200"
              fontWeight="600"
              flexShrink={0}
              px={3}
            >
              WEEKLY
            </Button>

            <Select
              w="180px"
              fontWeight="600"
              borderColor="gray.200"
              bg="white"
              defaultValue="all"
              flexShrink={0}
            >
              <option value="all">All companies</option>
            </Select>
          </HStack>
        </Flex>

        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius={6}
          minH="calc(100vh - 132px)"
          px={6}
          py={10}
          position="relative"
          overflow="hidden"
        >

          <Flex
            align="center"
            justify="center"
            minH={{ base: "420px", md: "500px" }}
          >
            <VStack spacing={3}>
              <Box
                transform={{
                  base: "scale(0.72)",
                  md: "scale(0.82)",
                  lg: "scale(0.9)",
                }}
                transformOrigin="top center"
              >
                <InterviewIllustration />
              </Box>

              <Text
                fontSize={{ base: "1xl", md: "2xl" }}
                fontWeight="800"
                color="gray.800"
                mt={1}
              >
                No interview schedules yet
              </Text>

              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="gray.500"
                textAlign="center"
                maxW="700px"
              >
                Create a schedule to manage candidates' interview timelines
              </Text>

              <Button
                mt={4}
                bg={theme.colors.primary}
                color="white"
                px={8}
                size={'lg'}
                fontSize="lg"
                borderRadius="lg"
                onClick={() => {
                    setOpenModal(true);
                }}
              >
                ADD
              </Button>
            </VStack>
          </Flex>
        </Box>
      </VStack>
      <Modal_Interview isOpen={openModal} onClose={() => setOpenModal(false)} />
    </Box>
  );
};

export default Interview_Schedule;
