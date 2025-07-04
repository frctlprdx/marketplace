import Modal from "../Modals/Modal";
import { useState } from "react";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logo from "../../../public/assets/logo.png";

interface Props {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal = ({ onClose, onSwitchToRegister }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Reset errors sebelum request

    const data = {
      email,
      password,
      remember_me: rememberMe,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        data
      );
      console.log("Login successful", response.data);

      // Periksa apakah token ada dalam respons
      console.log("Token from response:", response.data.token);

      // Simpan token dan user_id ke localStorage
      localStorage.setItem("user_token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("user_id", response.data.user_id);
      localStorage.setItem("role", response.data.role);
      window.dispatchEvent(new Event("login"));
      onClose(); // Tutup modal setelah login
    } catch (error: any) {
      console.error("Login error", error);
      
      if (error.response) {
        // Server merespons dengan error status
        if (error.response.status === 422) {
          // Validation errors
          setErrors(error.response.data.errors || {});
        } else if (error.response.status === 401) {
          // Unauthorized - kredensial salah
          setErrors({
            general: "Email atau password tidak sesuai. Silakan coba lagi."
          });
        } else if (error.response.status === 404) {
          // User tidak ditemukan
          setErrors({
            general: "Akun dengan email tersebut tidak ditemukan."
          });
        } else if (error.response.status >= 500) {
          // Server error
          setErrors({
            general: "Terjadi kesalahan server. Silakan coba lagi nanti."
          });
        } else if (error.response.data?.message) {
          // Custom error message dari server
          setErrors({
            general: error.response.data.message
          });
        } else {
          setErrors({
            general: "Gagal login. Silakan coba lagi."
          });
        }
      } else if (error.request) {
        // Network error
        setErrors({
          general: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        });
      } else {
        // Something else happened
        setErrors({
          general: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg p-6">
        <img className="w-30 mx-auto" src={logo} alt="" />
        <h2 className="text-lg font-semibold mb-4 text-center">Login</h2>
        
        {/* Display general error at the top */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 text-center">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969] ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {/* Display email error */}
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969] pr-10 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {/* Display password error */}
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
              disabled={isLoading}
            />
            <label className="text-sm text-gray-700">Ingat Saya</label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white py-2 rounded-md bg-button hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Sedang Login..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Belum punya akun?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:underline"
            disabled={isLoading}
          >
            Register
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default LoginModal;