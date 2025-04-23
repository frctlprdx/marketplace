import { useState } from "react";
import LoginModal from "../Auth/LoginModal";
import RegisterModal from "../Auth/RegisterModal";
import { AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";

const GuestNav = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleProtectedClick = () => {
    setShowAlert(true);
  };

  return (
    <>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          className="text-black text-2xl sm:text-3xl hover:text-orange-500"
          onClick={handleProtectedClick}
        >
          <AiOutlineHeart />
        </button>
        <button
          className="text-black text-2xl sm:text-3xl hover:text-orange-500"
          onClick={handleProtectedClick}
        >
          <AiOutlineShoppingCart />
        </button>
        <button
          className="text-[15px] font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded-full"
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {/* Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-[rgba(156,163,175,0.5)] flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
            <p className="text-lg font-semibold mb-4">
              Anda harus login terlebih dahulu
            </p>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full mr-2"
              onClick={() => {
                setShowAlert(false);
                setShowLogin(true);
              }}
            >
              Login
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-full"
              onClick={() => setShowAlert(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestNav;
