/* eslint-disable react/prop-types */
"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { MenuIcon } from "lucide-react"


export function LayoutWrapper({ children, navigation, userRole }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen pt-28 lg:pt-16 overflow-hidden">
      <Sidebar
        sections={navigation}
        userRole={userRole}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-[rgb(var(--color-border))] bg-white px-4">
          <button
            className="mr-4 rounded-md p-1.5 text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-primary-lighter))] md:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </button>
        </header>
        <main className="container mx-auto p-4">{children}</main>
      </div>
    </div>
  )
}

