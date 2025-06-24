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
  const [rememberMe, setRememberMe] = useState(false); // State untuk "Ingat Saya"
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      console.log("Token from response:", response.data.token); // Debugging

      // Simpan token dan user_id ke localStorage
      localStorage.setItem("user_token", response.data.token); // Menyimpan token
      localStorage.setItem("user", JSON.stringify(response.data.user)); // Menyimpan user data lengkap jika perlu
      localStorage.setItem("user_id", response.data.user_id); // Menyimpan hanya user_id
      localStorage.setItem("role", response.data.role); // Simpan role
      window.dispatchEvent(new Event("login"));
      onClose(); // Tutup modal setelah login
    } catch (error) {
      console.error("Login error", error);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg p-6 ">
        <img className="w-30 mx-auto" src={logo} alt="" />
        <h2 className="text-lg font-semibold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969] pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Ingat Saya</label>
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 rounded-md bg-button"
          >
            Login
          </button>
        </form>
        {/* Display email error */}
        {errors.email && (
          <p className="text-sm text-red-500 text-center">{errors.email[0]}</p>
        )}
        {/* Display password error */}
        {errors.password && (
          <p className="text-sm text-red-500 text-center">
            {errors.password[0]}
          </p>
        )}
        {errors.general && (
          <p className="text-sm text-red-500 text-center">
            Gagal login. Periksa kembali email dan password Anda.
          </p>
        )}
        <p className="text-sm text-center mt-4">
          Belum punya akun?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default LoginModal;
