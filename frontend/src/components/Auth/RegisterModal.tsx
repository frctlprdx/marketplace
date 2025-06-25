import { useState } from "react";
import axios from "axios";
import Modal from "../Modals/Modal";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logo from "../../../public/assets/logo.png";

interface Props {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ onClose, onSwitchToLogin }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] =
    useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Memastikan password dan konfirmasi password cocok
    if (password !== confirmPassword) {
      setErrors({
        ...errors,
        confirm_password: ["Password dan Konfirmasi Password tidak cocok"],
      });
      return;
    }

    // Menghapus error jika password valid
    setErrors((prevErrors) => {
      const { confirm_password, ...rest } = prevErrors;
      return rest;
    });

    const data = {
      name,
      email,
      password,
      password_confirmation: password, // harus dikirim!
      role: "customer", // Role default customer
      phone_number: phoneNumber,
      profileimage: "https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/profile/20250625.jpg",
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        data
      );
      console.log("Registration successful", response.data);
      onClose();
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrors(error.response.data.message); // <- gunakan message di sini
      } else {
        console.error("Unknown error", error);
      }
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg p-6">
        <img className="w-30 mx-auto" src={logo} alt="" />
        <h2 className="text-lg font-semibold mb-4 text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
            required
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name[0]}</p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email[0]}</p>
          )}

          {/* Input for Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2  text-primary"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>
          {/* Display Password Error */}
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password[0]}</p>
          )}

          {/* Input for Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmationPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmationPassword(!showConfirmationPassword)
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
            >
              {showConfirmationPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>

          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
          />
          {errors.phone_number && (
            <p className="text-sm text-red-500">{errors.phone_number[0]}</p>
          )}
          {/* Display Confirm Password Error */}
          {errors.confirm_password && (
            <p className="text-sm text-red-500 text-center">
              {errors.confirm_password[0]}
            </p>
          )}
          <button
            type="submit"
            className="w-full text-white py-2 rounded-md bg-button"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Sudah punya akun?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-primary hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default RegisterModal;
