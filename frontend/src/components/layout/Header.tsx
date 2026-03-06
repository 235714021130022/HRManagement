import {
  Flex,
  Text,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  HStack,
  Avatar,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { logo } from "../../assets/logo";
import { useAuthStore } from "../../modules/auth/store/auth.store";
import { FiArrowLeft, FiGrid } from "react-icons/fi";
import type { MenuMode } from "../../types";

type HeaderProps = {
  menuMode: MenuMode,
  canUseAdminMenu: boolean;
  onToggleMenuMode: () => void;
}

export default function Header({menuMode, canUseAdminMenu,onToggleMenuMode}: HeaderProps) {
  const { user, logout } = useAuthStore();

  // const displayRoles = Array.isArray(user?.roles)
  //   ? user.roles.map((r: any) => (typeof r === 'string' ? r : r.role)).join(', ')
  //   : '';

    const displayRoles = Array.isArray(user?.roles)
  ? user.roles
      .map((r: any) => {
        if (typeof r === "string") return r;

        // trường hợp phổ biến: r.role là object role
        if (typeof r?.role === "string") return r.role;
        return r?.role?.name_role || r?.name_role || r?.name || r?.role?.role_code || "";
      })
      .filter(Boolean)
      .join(", ")
  : "";
  const LEFT_ICON_W = 10;
  return (
    <Flex
      align="center"
      justify="space-between"
      bg="white"
      p={4}
      boxShadow="sm"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={120}
    >
      <Flex align="center" gap={3}>
    <Box w={LEFT_ICON_W}>
      {canUseAdminMenu ? (
        <IconButton
          aria-label="Toggle menu"
          icon={menuMode === "admin" ? <FiArrowLeft size={20} /> : <FiGrid size={20} />}
          variant="ghost"
          size="md"
          onClick={onToggleMenuMode}
        />
      ): null}
    </Box>

    <Image src={logo} alt="Logo" boxSize="36px" />

    <Text fontSize="xl" fontWeight="600" lineHeight="1" noOfLines={1}>
      Information Technology Tool
    </Text>
  </Flex>
      <Flex gap={4} align="center">
        {/* <NotificationPopover /> */}
        <Menu>
          <MenuButton>
            <HStack spacing={2}>
              <Avatar
                size="sm"
                name={user?.employee_name ?? undefined}
                bg="#E4E4E7"
                color="#070707"
              />
              <Text fontSize="sm" color="gray.600" fontWeight="500">
                {user?.employee_name}
              </Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <Box px={3} py={2}>
              <Text fontWeight="bold">{user?.employee_name}</Text>
              <Text fontSize="sm" color="gray.500">
                {user?.email}
              </Text>
              <Text fontSize="sm" color="gray.400">
                Roles: {displayRoles}
              </Text>
            </Box>
            <MenuItem onClick={logout} color="red.500">
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
}
