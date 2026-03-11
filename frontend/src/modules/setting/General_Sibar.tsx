import { Box, Button, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import {
  SettingsIcon,
  StarIcon,
  InfoOutlineIcon,
  CheckCircleIcon,
  EmailIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import { AuditLog } from "./auditlog_history/views/AuditlogHistory";
import { PositionPost } from "./position_post/views/PositionPost";
import { Rank } from "./rank/views/Rank";
import { SendEmail } from "./send_email/views/Email";
import { Skill } from "./skill/views/Skill";
import { TypePotential } from "./type_potential/views/TypePotential";
import { theme } from "../../theme";

type SettingTabKey = "auditlog" | "position_post" | "rank" | "send_email" | "skill" | "type_potential";

const { PRIMARY, PRIMARY_200, PRIMARY_500, PRIMARY_900, BORDER } = theme.colors.charts;

const menuItems: { key: SettingTabKey; label: string; icon: any }[] = [
  { key: "auditlog", label: "Audit Log", icon: ViewIcon },
  { key: "position_post", label: "Position Post", icon: CheckCircleIcon },
  { key: "rank", label: "Rank", icon: StarIcon },
  { key: "send_email", label: "Send Email", icon: EmailIcon },
  { key: "skill", label: "Skills", icon: InfoOutlineIcon },
  { key: "type_potential", label: "Type Potential", icon: SettingsIcon },
];

const tabDescriptions: Record<SettingTabKey, string> = {
  auditlog: "Xem lịch sử thao tác và hoạt động hệ thống của người dùng.",
  position_post: "Quản lý danh mục vị trí tuyển dụng trong hệ thống.",
  rank: "Cấu hình các cấp bậc, chức danh dùng trong quá trình tuyển dụng.",
  send_email: "Thiết lập và quản lý các mẫu email gửi đến ứng viên.",
  skill: "Quản lý danh sách kỹ năng để gắn nhãn ứng viên và tin tuyển dụng.",
  type_potential: "Phân loại các nhóm ứng viên tiềm năng theo từng tiêu chí.",
};

const renderContent = (activeTab: SettingTabKey) => {
  switch (activeTab) {
    case "auditlog":
      return <AuditLog />;
    case "position_post":
      return <PositionPost />;
    case "rank":
      return <Rank />;
    case "send_email":
      return <SendEmail />;
    case "skill":
      return <Skill />;
    case "type_potential":
      return <TypePotential />;
  }
};

export default function General_Sibar() {
  const [activeTab, setActiveTab] = useState<SettingTabKey>("auditlog");

  const activeItem = menuItems.find((item) => item.key === activeTab);

  return (
    <Box minH="100vh"  position="relative">
      <Flex maxW="1540px" mx="auto" gap={{ base: 3, md: 5 }} align="stretch" direction={{ base: "column", lg: "row" }}>
        {/* Sidebar */}
        <Box
          w={{ base: "100%", lg: "250px" }}
          bg="white"
          border="1px solid"
          borderColor={BORDER}
          borderRadius="7px"
          boxShadow="0 12px 34px rgba(26, 39, 68, 0.06)"
          py={4}
          px={{ base: 3, lg: 4 }}
          position={{ base: "relative", lg: "sticky" }}
          top={{ base: "auto", lg: "16px" }}
          h={{ base: "auto", lg: "calc(100vh - 32px)" }}
        >
          <VStack align="stretch" spacing={4} h="100%">
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color={PRIMARY_500} fontWeight="700">
                Cài đặt hệ thống
              </Text>
            </Box>

            <VStack spacing={2} align="stretch" flex="1" overflowY="auto" className="hide-scrollbar">
              {menuItems.map((item) => {
                const isActive = item.key === activeTab;
                return (
                  <Button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    h="52px"
                    justifyContent={{ base: "center", lg: "flex-start" }}
                    px={{ base: 3, lg: 4 }}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={isActive ? PRIMARY_200 : "transparent"}
                    bg={isActive ? "rgba(51, 67, 113, 0.10)" : "transparent"}
                    color={isActive ? PRIMARY : "gray.500"}
                    _hover={{ bg: isActive ? "rgba(51, 67, 113, 0.12)" : "gray.50" }}
                    _active={{ bg: isActive ? "rgba(51, 67, 113, 0.14)" : "gray.100" }}
                    transition="all 0.2s ease"
                  >
                    <HStack w="full" spacing={3} justify={{ base: "center", lg: "flex-start" }}>
                      <Icon as={item.icon} boxSize={5} />
                      <Text display={{ base: "none", lg: "block" }} fontWeight="700" fontSize="sm">
                        {item.label}
                      </Text>
                    </HStack>
                  </Button>
                );
              })}
            </VStack>
          </VStack>
        </Box>

        {/* Content */}
        <Box flex="1" minW={0}>
          <VStack spacing={5} align="stretch">
            {/* Header */}
                <Box
                bg="white"
                border="1px solid"
                borderColor={BORDER}
                borderRadius="md"
                px={{ base: 5, md: 7 }}
                py={{ base: 5, md: 6 }}
                boxShadow="0 12px 34px rgba(26, 39, 68, 0.06)"
                >
                <HStack spacing={3} mb={2}>
                    {activeItem && <Icon as={activeItem.icon} boxSize={5} color={PRIMARY} />}
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" color={PRIMARY_900}>
                    {activeItem?.label}
                    </Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                    {tabDescriptions[activeTab]}
                </Text>
                </Box>

            {/* Tab content */}
            <Box
              bg="white"
              border="1px solid"
              borderColor={BORDER}
              borderRadius="md"
              px={{ base: 4, md: 6 }}
              py={{ base: 4, md: 5 }}
              boxShadow="0 12px 34px rgba(26, 39, 68, 0.06)"
            >
              {renderContent(activeTab)}
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}