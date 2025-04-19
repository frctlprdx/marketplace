import { useState } from "react";
import axios from "axios";
import Modal from "../Modals/Modal";

interface Props {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ onClose, onSwitchToLogin }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


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
      address,
      phone_number: phoneNumber,
    };

    try {
      const response = await axios.post("http://localhost:8000/api/register", data);
      console.log("Registration successful", response.data);
      onClose();
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors); // Menyimpan errors dari backend ke state errors
      } else {
        console.error("Unknown error", error);
      }
    }    
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email[0]}</p>
          )}

          {/* Input for Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          {/* Display Password Error */}
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password[0]}</p>
          )}

          {/* Input for Confirm Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />

          {/* Hidden role input */}
          <input type="hidden" value="customer" />
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role[0]}</p>
          )}

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address[0]}</p>
          )}
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.phone_number && (
            <p className="text-sm text-red-500">{errors.phone_number[0]}</p>
          )}
          {/* Display Confirm Password Error */}
          {errors.confirm_password && (
            <p className="text-sm text-red-500 text-center">{errors.confirm_password[0]}</p>
          )}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Sudah punya akun?{" "}
          <button onClick={onSwitchToLogin} className="text-orange-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default RegisterModal;
