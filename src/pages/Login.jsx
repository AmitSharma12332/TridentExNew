import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { server } from "../constants/config";
import { userExist } from "../redux/reducer/userReducer";
import { Eye, EyeClosed } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging In...");

    try {
      const { data } = await axios.post(
        `${server}api/v1/user/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("authToken", data.token);
      dispatch(userExist(data.user));
      toast.success(data.message, { id: toastId });
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message, {
          id: toastId,
        });
      } else {
        toast.error("Something went wrong. Please try again later.", {
          id: toastId,
        });
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
      <div className=" h-full lg:pt-16 pt-24 lg:min-h-screen bg-[rgb(var(--color-background))] flex">
        {/* Left side with logo */}
        <div className="w-[60%] hidden lg:flex flex-col justify-center items-start p-12">
          <div className="max-w-2xl"></div>
          {/* <img src="/logo.webp" alt="Logo" className="w-24 h-24 mb-8" /> */}
          <h1 className="text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
            Welcome back to{" "}
            <span className="text-[rgb(var(--color-primary))]">
              TRIDENT EXCHANGE
            </span>
          </h1>
          <p className="text-[rgb(var(--color-text-muted))] text-lg">
            Sign in to continue to your account and access all features
          </p>
        </div>
     

      <div className="lg:w-[40%] w-full flex h-[calc(100vh-68px)] flex-col items-center justify-center p-6  relative">
        <div className="max-w-md w-full  space-y-8 relative">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-start mb-8">
            {/* <img src="/logo.webp" alt="Logo" className="w-16 h-16 mb-4" /> */}
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
              Sign in to{" "}
              <span className="text-[rgb(var(--color-primary))]">TRIDENT</span>
            </h2>
          </div>

          <div className=" lg:p-8 rounded-2xl ">
            {/* <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))] mb-6">
              Sign in to your account
            </h2> */}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-[rgb(var(--color-text-muted))]"
                  >
                    {showPassword ?  <Eye/> : <EyeClosed/>}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  className="w-full px-6 py-3 text-sm font-medium text-white bg-[rgb(var(--color-primary))] rounded-lg hover:bg-[rgb(var(--color-primary-dark))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-2 transition-all duration-200"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full px-6 py-3 text-sm font-medium text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-background-hover))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-border))] transition-all duration-200"
                >
                  Back to Home
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
  );
};

export default Login;
