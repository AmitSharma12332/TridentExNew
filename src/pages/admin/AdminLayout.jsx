/* eslint-disable react/prop-types */
import { FileTextIcon, LayoutDashboardIcon, UserCheck, UsersIcon } from "lucide-react"
import { LayoutWrapper } from "../../components/layout-wrapper"


const adminNavigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Profile",
        to: "/admin/profile",
        icon: UserCheck,
      },
      {
        title: "Requested Withdrawls",
        to: "/admin/dashboard",
        icon: LayoutDashboardIcon,
      },
        {
        title: "Requested Deposit",
        to: "/admin/requested-deposit",
        icon: LayoutDashboardIcon,
      },
     
     
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: " All Users",
        to: "/admin/users",
        icon: UsersIcon,
      },
      {
        title: "My Withdrawls",
        to: "/admin/withdrawl",
        icon: FileTextIcon,
      },
      {
        title: "My Deposit",
        to: "/admin/deposit-history",
        icon: FileTextIcon,
      },
    ],
  },
 
]

export default function AdminLayout({ children }) {
  return (
    <LayoutWrapper navigation={adminNavigation} userRole="admin" portalTitle="Admin Portal">
      {children}
    </LayoutWrapper>
  )
}

