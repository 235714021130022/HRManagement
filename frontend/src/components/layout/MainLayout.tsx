import { useState, useEffect, useMemo } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../modules/auth/store/auth.store';
import AppBreadcrumb from '../common/Breadcrumb';
import Header from './Header';
import Sidebar from './Sidebar';


export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // lấy role từ store (khuyên dùng hasAnyRole)
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);

  // chỉ Admin/Employee mới có quyền xem menu admin
  const canUseAdminMenu = useMemo(
    () => hasAnyRole(['Admin', 'Employee']),
    [hasAnyRole]
  );

  // state menu đang dùng
  const [menuMode, setMenuMode] = useState('main');

  const toggleMenuMode = () => {
    if (!canUseAdminMenu) return;
    setMenuMode((m) => (m === 'main' ? 'admin' : 'main'));
  };

  // nếu user không có quyền, ép về main (đỡ trường hợp đang ở admin menu rồi logout/login role khác)
  useEffect(() => {
    if (!canUseAdminMenu) setMenuMode('main');
  }, [canUseAdminMenu]);

  return (
    <Flex height="100vh" bg="white" overflow="hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        menuMode={menuMode}
      />

      <Flex
        flex="1"
        direction="column"
        pt="70px"
        ml={isCollapsed ? '80px' : '250px'}
        transition="margin-left 0.2s ease"
        minW="0"
        w={`calc(100% - ${isCollapsed ? '80px' : '250px'})`}
        overflow="hidden"
        position="relative"
      >
        <Box flex="0 0 auto">
          <Header
            menuMode={menuMode}
            canUseAdminMenu={canUseAdminMenu}
            onToggleMenuMode={toggleMenuMode}
          />
        </Box>

        <Box flex="1" p={6} overflowY="auto" overflowX="hidden" minW="0" className="hide-scrollbar">
          <AppBreadcrumb />
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}