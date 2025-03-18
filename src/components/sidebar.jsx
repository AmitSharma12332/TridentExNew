/* eslint-disable react/prop-types */
"use client";

import { Link, useLocation } from "react-router-dom";

export function Sidebar({ sections, userRole, isMobileOpen, setIsMobileOpen }) {
  const pathname = useLocation();

  // Close mobile sidebar when clicking a link
  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 md:pt-0 pt-20 lg:pt-0 z-50 w-64 transform border-r border-[rgb(var(--color-border))] bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-14 items-center border-b border-[rgb(var(--color-border))] px-4">
          <h2 className="text-lg font-semibold capitalize text-[rgb(var(--color-primary))]">
            {userRole} Dashboard
          </h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {sections?.map((section) => (
              <div key={section.title} className="space-y-1 py-2">
                <h3 className="px-3 text-xs font-semibold text-[rgb(var(--color-text-muted))]">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))]"
                            : "hover:bg-[rgb(var(--color-primary-lighter))] hover:text-[rgb(var(--color-primary-dark))]"
                        }`}
                        onClick={handleLinkClick}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
