/* eslint-disable react/prop-types */
"use client";
import {
  Home,
  Gamepad2,
  Joystick,
  Trophy,
  History,
  Menu,
  X,
  User,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import isEqual from "react-fast-compare";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userNotExist } from "../redux/reducer/userReducer";
import Exposure from "./Exposure";

// Extracted NavItem component to prevent re-renders of all items
const NavItem = memo(({ item, isActive }) => {
  return (
    <Link
      to={item.href}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
        isActive
          ? "text-orange-900 bg-orange-200"
          : "text-gray-100 hover:text-orange-900 hover:bg-orange-200"
      }`}
    >
      <item.icon className="h-4 w-4" />
      <span className="text-base font-medium">{item.name}</span>
    </Link>
  );
});
NavItem.displayName = "NavItem";

// Extracted MobileNavItem component
const MobileNavItem = memo(({ item, isActive }) => {
  return (
    <Link
      to={item.href}
      className={`flex justify-center gap-1 items-center text-gray-100 py-1 px-2 rounded-lg transition-colors text-xs font-medium ${
        isActive ? "text-orange-900 bg-orange-200" : ""
      }`}
    >
      <item.icon className="h-4 w-4" />
      {item.name}
    </Link>
  );
});
MobileNavItem.displayName = "MobileNavItem";

// Extracted WalletInfo component
const WalletInfo = memo(({ wallet, exposure }) => {
  return (
    <div className="flex items-center w-fit gap-2 rounded-full px-4 py-1.5">
      <span className="text-white flex flex-col w-full text-sm">
        <span className="flex gap-1 justify-start items-center"> </span>
        Balance : {wallet.toFixed(2)}
        <span className="">Exposure : -{exposure.toFixed(2)}</span>
      </span>
    </div>
  );
});
WalletInfo.displayName = "WalletInfo";

// Extracted MobileWalletInfo component
const MobileWalletInfo = memo(({ wallet, exposure }) => {
  return (
    <div className="flex items-center w-fit gap-2 rounded-full px-4 py-1.5">
      <span className="text-white flex flex-col w-full text-xs">
        Balance : {wallet.toFixed(2)}
        <span className="">Exposure : -{exposure.toFixed(2)}</span>
      </span>
    </div>
  );
});
MobileWalletInfo.displayName = "MobileWalletInfo";

// Extracted ProfileDropdown component
const ProfileDropdown = memo(({ isOpen, toggleDropdown, user, onLogout }) => {
  return (
    <div className="relative profile-dropdown">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-white bg-[rgb(var(--color-primary-dark))] px-4 py-1.5 rounded-lg transition-colors"
      >
        <User className="h-4 w-4" />
        Profile
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-primary-dark))] rounded-lg shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-[rgb(var(--color-primary-darker))]">
            <p className="text-white capitalize font-medium">
              {user?.name || "User"}
            </p>
          </div>
          {user.role === "user" && (
            <Link to="/user/profile">
              <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                Dashboard
              </button>
            </Link>
          )}
          {user?.role === "master" && (
            <Link to="/admin/profile">
              <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                Master Panel
              </button>
            </Link>
          )}
          {user?.role === "super_admin" && (
            <Link to="/superadmin/dashboard">
              <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                Super Admin
              </button>
            </Link>
          )}
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
});
ProfileDropdown.displayName = "ProfileDropdown";

// Extracted MobileProfileDropdown component
const MobileProfileDropdown = memo(
  ({ isOpen, toggleDropdown, user, onLogout }) => {
    return (
      <div className="relative profile-dropdown">
        <button
          onClick={toggleDropdown}
          className="text-white text-sm font-medium bg-[rgb(var(--color-primary-dark))] px-3 py-1 rounded-full hover:bg-[rgb(var(--color-primary-darker))] transition-colors"
        >
          Profile
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-[rgb(var(--color-primary-dark))] rounded-lg shadow-lg py-1 z-10">
            <div className="px-3 py-2 border-b border-[rgb(var(--color-primary-darker))]">
              <p className="text-white text-sm font-medium">
                {user?.name || "User"}
              </p>
            </div>
            {user.role !== "super_admin" && (
              <Link to="/user/profile">
                <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                  My Profile
                </button>
              </Link>
            )}
            {user?.role === "master" && (
              <Link to="/admin/dashboard">
                <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                  Master Panel
                </button>
              </Link>
            )}
            {user?.role === "super_admin" && (
              <Link to="/superadmin/dashboard">
                <button className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors">
                  Super Admin
                </button>
              </Link>
            )}
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-white hover:bg-[rgb(var(--color-primary-darker))] transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }
);
MobileProfileDropdown.displayName = "MobileProfileDropdown";

const NavbarComponent = ({ toggleSidebar, showsidebar }) => {
  const { user, loading } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [exposure, setExposure] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Memoize nav items to prevent recreation on each render
  const navItems = useMemo(
    () => [
      { name: "Home", href: "/", icon: Home },
      { name: "Casino", href: "/casino", icon: Gamepad2 },
      { name: "Slot", href: "/slot", icon: Joystick },
      { name: "Fantasy", href: "/fantasy", icon: Trophy },
      { name: "MyBets", href: "/mybets", icon: History },
    ],
    []
  );

  // Memoize filtered nav items
  const filteredNavItems = useMemo(
    () => navItems.filter((item) => item.name !== "MyBets" || user),
    [navItems, user]
  );

  // Use useCallback for event handlers
  const toggleProfileDropdown = useCallback(() => {
    setProfileDropdownOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    dispatch(userNotExist());
    navigate("/login");
  }, [dispatch, navigate]);

  // Callbacks for updating wallet and exposure from the ExposureCalculator
  const handleWalletUpdate = useCallback((amount) => {
    setWallet(amount);
  }, []);

  const handleExposureUpdate = useCallback((amount) => {
    setExposure(amount);
  }, []);

  // Handle clicks outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <nav className="bg-[rgb(var(--color-primary))] fixed w-full z-[99] shadow-md">
      {/* Use the ExposureCalculator component */}
      {user && (
        <Exposure
          user={user}
          onWalletUpdate={handleWalletUpdate}
          onExposureUpdate={handleExposureUpdate}
        />
      )}

      <div className="max-w-full mx-auto p-2 sm:px-4">
        {/* Marquee for important announcements */}
        <div className="marquee flex bg-red-600 text-white py-1 px-2 rounded-md mb-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-sm font-medium">
            🚨 IMPORTANT: Event IDs 34440606 & 34448947 - Bangladesh vs Sri Lanka and West Indies v Australia
            match bets will be canceled due to odds glitch. All bets will be
            canceled and amounts will be refunded. 🚨
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between h-fit lg:hidden">
          <div className="flex items-center gap-2">
            {showsidebar ? (
              <X className="h-6 w-6 text-white" onClick={toggleSidebar} />
            ) : (
              <Menu className="h-6 w-6 text-white" onClick={toggleSidebar} />
            )}
            <h1 className="flex text-xs md:text-base text-white font-semibold">
              TRIDENT
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!loading && user ? (
              <div className="flex items-center gap-1">
                <MobileWalletInfo wallet={wallet} exposure={exposure} />
                <MobileProfileDropdown
                  isOpen={profileDropdownOpen}
                  toggleDropdown={toggleProfileDropdown}
                  user={user}
                  onLogout={handleLogout}
                />
              </div>
            ) : (
              <Link to="/login">
                <button className="text-white text-sm font-medium bg-[rgb(var(--color-primary-dark))] px-3 py-1 rounded-lg transition-colors">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex h-fit">
          {/* Left: Logo & Company Name */}
          <div className="flex items-center gap-2 w-1/4">
            <img src="/logo.webp" className="h-12 w-12" alt="Logo" />
            <Link to="/">
              <h1 className="text-white font-semibold text-2xl">TRIDENT</h1>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center justify-center flex-1">
            <div className="flex gap-2">
              {filteredNavItems.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>
          </div>

          {/* Right: Auth & Wallet */}
          <div className="flex items-center justify-end w-1/4 gap-3">
            {!loading && user ? (
              <>
                <WalletInfo wallet={wallet} exposure={exposure} />
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  toggleDropdown={toggleProfileDropdown}
                  user={user}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <Link to="/login">
                <button className="text-white text-sm font-medium bg-[rgb(var(--color-primary-dark))] px-3 py-1 rounded-lg transition-colors">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-evenly lg:hidden overflow-auto w-full">
          {filteredNavItems.map((item) => (
            <MobileNavItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

// Optimized comparison function
const arePropsEqual = (prevProps, nextProps) => {
  return (
    isEqual(prevProps.toggleSidebar, nextProps.toggleSidebar) &&
    prevProps.showsidebar === nextProps.showsidebar
  );
};

const Navbar = memo(NavbarComponent, arePropsEqual);
Navbar.displayName = "Navbar";

export default Navbar;
