/* eslint-disable react/prop-types */
"use client"

import { BellIcon, FileTextIcon, Lock } from "lucide-react"
import { LayoutWrapper } from "../../components/layout-wrapper"
import { GiRamProfile } from "react-icons/gi"


const userNavigation = [
  {
    title: "Overview",
    items: [
     {
        title: "Profile",
        to: "/user/profile",
        icon: GiRamProfile,
      },
     
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "My Withdrawls",
        to: "/user/withdrawl",
        icon: FileTextIcon,
      },
      {
        title: "My Deposits",
        to: "/user/deposit",
        icon: BellIcon,
      },
      {
        title: "Change Password",
        to: "/user/change-password",
        icon: Lock,
      },
    ],
  }, 


]

export default function UserLayout({ children }) {
  return (
    <LayoutWrapper navigation={userNavigation} userRole="user">
      {children}
    </LayoutWrapper>
  )
}

