import type { ReportTabKey } from "../types";
import type { ComponentWithAs, IconProps } from "@chakra-ui/react";
import {
  ViewIcon,
  CheckCircleIcon,
  WarningIcon,
  TimeIcon,
  InfoIcon,
  SettingsIcon,
} from "@chakra-ui/icons";

type SidebarItem = {
  key: ReportTabKey;
  label: string;
  icon: ComponentWithAs<"svg", IconProps>;
};

export const sibarItems: SidebarItem[] = [
  { key: "dashboard", label: "Tổng quan", icon: ViewIcon },
  { key: "performance", label: "Hiệu quả", icon: CheckCircleIcon },
  { key: "cost", label: "Chi phí", icon: WarningIcon },
  { key: "plan", label: "Kế hoạch", icon: TimeIcon },
  { key: "rejected", label: "Ứng viên bị loại", icon: InfoIcon },
  { key: "settings", label: "Thiết lập dữ liệu", icon: SettingsIcon },
];