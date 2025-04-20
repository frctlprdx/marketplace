import Modal from "../Modals/Modal";
import { useState } from "react";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      email,
      password,
      remember_me: rememberMe, // Kirim status "Ingat Saya"
    };

    try {
      const response = await axios.post("http://localhost:8000/api/login", data);
      console.log("Login successful", response.data);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // atau token jika pakai token
      window.dispatchEvent(new Event("login")); // Trigger event agar navbar update
      onClose(); // tutup modal
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        setErrors(data.errors || { general: [data.message || "Terjadi kesalahan."] });
      } else {
        setErrors({ general: ["Terjadi kesalahan yang tidak diketahui."] });
      }
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="h-4 w-4 text-orange-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Ingat Saya</label>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
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
          <p className="text-sm text-red-500 text-center">{errors.password[0]}</p>
        )}
        {errors.general && (
          <p className="text-sm text-red-500 text-center">Gagal login. Periksa kembali email dan password Anda.</p>
        )}
        <p className="text-sm text-center mt-4">
          Belum punya akun?{" "}
          <button onClick={onSwitchToRegister} className="text-orange-600 hover:underline">
            Register
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default LoginModal;
