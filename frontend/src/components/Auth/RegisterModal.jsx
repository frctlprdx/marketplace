import { useState } from "react";
import axios from "axios";
import Modal from "../Modals/Modal";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logo from "../../../public/assets/logo.png";

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("customer"); // default role
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrors({
        ...errors,
        confirm_password: ["Password dan Konfirmasi Password tidak cocok"],
      });
      return;
    }

    setErrors((prevErrors) => {
      const { confirm_password, ...rest } = prevErrors;
      return rest;
    });

    const data = {
      name,
      email,
      password,
      password_confirmation: password,
      role, // kirim role langsung
      phone_number: phoneNumber,
      profileimage:
        "https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/profile/default.jpg",
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        data
      );
      console.log("Registration successful", response.data);
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrors(error.response.data.message);
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
          {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
            required
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}

          {/* Password */}
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password[0]}</p>}

          {/* Confirm Password */}
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
              onClick={() => setShowConfirmationPassword(!showConfirmationPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
            >
              {showConfirmationPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>

          {/* Phone Number */}
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#507969]"
          />
          {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number[0]}</p>}

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Daftar sebagai:</label>
            <div className="flex items-center space-x-4 mt-1">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                  className="form-radio text-[#507969]"
                />
                <span className="text-sm">Pembeli</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={role === "seller"}
                  onChange={() => setRole("seller")}
                  className="form-radio text-[#507969]"
                />
                <span className="text-sm">Penjual</span>
              </label>
            </div>
          </div>

          {/* Error Confirm Password */}
          {errors.confirm_password && (
            <p className="text-sm text-red-500 text-center">
              {errors.confirm_password[0]}
            </p>
          )}

          <button type="submit" className="w-full text-white py-2 rounded-md bg-button">
            Register
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Sudah punya akun?{" "}
          <button onClick={onSwitchToLogin} className="text-primary hover:underline">
            Login
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default RegisterModal;
