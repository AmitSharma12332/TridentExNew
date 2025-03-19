/* eslint-disable react/prop-types */
"use client";

import {
  FileTextIcon,
  Gamepad,
  LayoutDashboardIcon,
  Lock,
  SettingsIcon,
  UserCogIcon,
} from "lucide-react";
import { LayoutWrapper } from "../../components/layout-wrapper";

const superAdminNavigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Withdrawl Requests",
        to: "/superadmin/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Deposit History",
        to: "/superadmin/reports",
        icon: FileTextIcon,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "All Masters",
        to: "/superadmin/alladmins",
        icon: UserCogIcon,
      },
      {
        title: "All Bets",
        to: "/superadmin/allbets",
        icon: Gamepad,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        to: "/superadmin/website-management",
        icon: SettingsIcon,
      },
      {
        title: "Change Password",
        to: "/superadmin/change-password",
        icon: Lock,
      },
    ],
  },
];

export default function SuperAdminLayout({ children }) {
  return (
    <LayoutWrapper
      navigation={superAdminNavigation}
      userRole="superAdmin"
      portalTitle="Super Admin Portal"
    >
      {children}
    </LayoutWrapper>
  );
}
