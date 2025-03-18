import axios from "axios";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import ProtectedRoute from "./components/ProtectedRoute";
import { server } from "./constants/config";
import {
  setLoading,
  userExist,
  userNotExist,
} from "./redux/reducer/userReducer";
const AccountsPayouts = lazy(() => import("./pages/legal/AccountsPayouts"));
const KycPage = lazy(() => import("./pages/legal/KycPage"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const SelfExclusion = lazy(() => import("./pages/legal/SelfExclusion"));
const AmlPolicy = lazy(() => import("./pages/legal/AmlPolicy"));
const About = lazy(() => import("./pages/About"));
const ResponsibleGambling = lazy(() =>
  import("./pages/legal/ResponsibleGambling")
);
const TermsConditions = lazy(() => import("./pages/legal/TermsConditions"));
const DisputeResolution = lazy(() => import("./pages/legal/DisputeResolution"));
const BettingRules = lazy(() => import("./pages/legal/BettingRules"));
const FairnessRng = lazy(() => import("./pages/legal/FairnessRng"));
const SuperAdminLayout = lazy(() => import("./pages/superadmin/SuperAdminLayout"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));
const UserLayout = lazy(() => import("./pages/user/UserLayout"));
const AllAdmins = lazy(() => import("./pages/superadmin/AllAdmin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Users = lazy(() => import("./pages/admin/Users"));
const Allbets = lazy(() => import("./pages/superadmin/AllBets"));
const Withdrawal = lazy(() => import("./pages/admin/Withdrawl"));
const Reports = lazy(() => import("./pages/superadmin/Reports"));
const WebsiteManagement = lazy(() => import("./pages/superadmin/WebsiteManagement"));
const RequestedWithdrawl = lazy(() => import("./pages/admin/RequestedWithdrawl"));
const DepositHistory = lazy(() => import("./pages/admin/DepositHistory"));
const RequestedDeposit = lazy(() => import("./pages/admin/RequestedDeposit"));
const MyWithdrawls = lazy(() => import("./pages/user/MyWithdrawls.jsx"));
const MyDeposit = lazy(() => import("./pages/user/MyDeposit.jsx"));

// Lazy loading components for better performance
const Loader = lazy(() => import("./components/Loader"));
const Navbar = lazy(() => import("./components/Navbar"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const MyBets = lazy(() => import("./pages/MyBets"));
const Casino = lazy(() => import("./pages/Casino"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MatchDetails = lazy(() => import("./pages/MatchDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const AllGames = lazy(() => import("./components/AllGames"));


// Create API instance
const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

// Socket configuration with improved connection options
const socket = io(server, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

const App = () => {
  const { user, loading } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const [showsidebar, setShowSideBar] = useState(false);
  const [sportsData, setSportsData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = useCallback(() => {
    setShowSideBar((prev) => !prev);
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setShowSideBar(false);
    }
  }, []);

  // User authentication setup
  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch(setLoading(true));
        const token = localStorage.getItem("authToken");

        if (!token) {
          const retryFetchUser = async (retries) => {
            if (retries <= 0) {
              localStorage.removeItem("authToken");
              dispatch(userNotExist());
              return;
            }

            try {
              const response = await api.get("api/v1/user/me", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.data.user.status === "banned") {
                toast.error("Your account has been banned.", { icon: "⚠️" });
                localStorage.removeItem("authToken");
                dispatch(userNotExist());
                return;
              }
            } catch (error) {
              console.error("Retrying authentication error:", error);
              setTimeout(() => retryFetchUser(retries - 1), 1000);
            }
          };

          retryFetchUser(5);
          return;
        }

        const response = await api.get("api/v1/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.user.status === "banned") {
          toast.error("Your account has been banned.", { icon: "⚠️" });
          localStorage.removeItem("authToken");
          dispatch(userNotExist());
          return;
        }

        dispatch(userExist(response.data.user));
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("authToken");
        dispatch(userNotExist());

        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (error.response) {
          toast.error(error.response.data.message || "Authentication failed");
        } else {
          toast.error("Connection error. Please try again later.");
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [dispatch]);

  // Socket connection management
  useEffect(() => {
    // Connect socket
    socket.connect();

    // Socket event handlers
    const onConnect = () => {
      console.log("Socket connected successfully");
      setSocketConnected(true);
    };

    const onDisconnect = (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setSocketConnected(false);
    };

    const onConnectError = (err) => {
      console.error("Socket connection error:", err.message);
      setSocketConnected(false);
    };

    const onSportsData = (data) => {
      if (data) {
        setSportsData(data);
        // Handle different data formats
      } else {
        console.warn("Received unexpected sportsData format:", data);
      }
    };

    // Register socket event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("sportsData", onSportsData);

    // Cleanup on component unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("sportsData", onSportsData);
      socket.disconnect();
    };
  }, []);

  // Sidebar click outside handler
  useEffect(() => {
    if (showsidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showsidebar, handleClickOutside]);

  if (loading) {
    return (
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <Loader />
      </Suspense>
    );
  }

  return (
    <Router>
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        {window.location.pathname !== "/login" && (
          <Navbar showsidebar={showsidebar} toggleSidebar={toggleSidebar} />
        )}
        {showsidebar && window.location.pathname !== "/login" && (
          <div
            ref={sidebarRef}
            className="md:col-span-2 lg:hidden fixed h-full w-80  overflow-y-auto z-[99] shadow-lg"
          >
            <AllGames sportsData={socketConnected ? sportsData : []} />
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                sportsData={socketConnected ? sportsData : []}
                showsidebar={showsidebar}
                toggleSidebar={toggleSidebar}
              />
            }
          />
          <Route
            path="/match/:sportId/:eventId/:eventname"
            element={
              <MatchDetails sportsData={socketConnected ? sportsData : []} />
            }
          />

          <Route path="/casino" element={<Casino />} />
          <Route path="/slot" element={<Casino />} />
          <Route path="/fantasy" element={<Casino />} />

          {/* Public Route: Login */}
          <Route
            path="/login"
            element={
              <ProtectedRoute isAuthenticated={!user}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* Protected Route: Only logged-in users */}
          {/* <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={user}>
                <Profile />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/mybets"
            element={
              <ProtectedRoute isAuthenticated={user}>
                <MyBets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/*"
            element={
              <ProtectedRoute isAuthenticated={user}>
                <UserLayout>
                  <Routes>
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/withdrawl"
                      element={<MyWithdrawls />}
                    /> <Route
                      path="/deposit"
                      element={<MyDeposit />}
                    />
                   
                  </Routes>
                </UserLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Route */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute
                isAuthenticated={user}
                adminOnly={true}
                admin={user?.role === "admin"}
              >
                <AdminLayout>
                  <Routes>
                  <Route
                      path="/profile"
                      element={<Profile />}
                    />  
                   
                  <Route
                      path="/dashboard"
                      element={<RequestedWithdrawl />}
                    />

                     <Route
                      path="/requested-deposit"
                      element={<DepositHistory />}
                    />
                    
                    <Route
                      path="/users"
                      element={<Users />}
                    />  
                    <Route
                      path="/withdrawl"
                      element={<Withdrawal />}
                    /> <Route
                      path="/deposit-history"
                      element={<RequestedDeposit />}
                    />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Suoer Admin Protected Route */}
          <Route
            path="/superadmin/*"
            element={
              <ProtectedRoute
                isAuthenticated={user}
                superAdminOnly={true}
                admin={user?.role === "super_admin"}
              >
                <SuperAdminLayout>
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={<SuperAdminDashboard />}
                    />
                    <Route path="/allbets" element={<Allbets />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/website-management" element={<WebsiteManagement />} />
                    <Route
                      path="/alladmins"
                      element={<AllAdmins />}
                    />
                  </Routes>
                </SuperAdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Terms and Conditions */}
          <Route path="/kyc" element={<KycPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/self-exclusion" element={<SelfExclusion />} />
          <Route path="/aml" element={<AmlPolicy />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/responsible-gambling"
            element={<ResponsibleGambling />}
          />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/betting-rules" element={<BettingRules />} />
          <Route path="/dispute" element={<DisputeResolution />} />
          <Route path="/fairness" element={<FairnessRng />} />
          <Route path="/accounts" element={<AccountsPayouts />} />
          <Route path="/about" element={<About />} />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-center" />
    </Router>
  );
};

export default App;
