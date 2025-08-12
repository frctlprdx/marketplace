import { useState } from "react";
import LoginModal from "../Auth/LoginModal";
import RegisterModal from "../Auth/RegisterModal";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { RiHistoryFill, RiHistoryLine } from "react-icons/ri";
import { HiMenu, HiX } from "react-icons/hi";

const GuestNav = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [hoverHeart, setHoverHeart] = useState(false);
  const [hoverCart, setHoverCart] = useState(false);
  const [hoverHistory, setHoverHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleProtectedClick = () => {
    setShowAlert(true);
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
        <button
          className="flex items-center justify-center text-primary text-2xl hover:text-[#507969]"
          onMouseEnter={() => setHoverHeart(true)}
          onMouseLeave={() => setHoverHeart(false)}
          onClick={handleProtectedClick}
        >
          {hoverHeart ? <FaHeart /> : <FiHeart />}
        </button>

        <button
          className="flex items-center justify-center text-primary text-2xl hover:text-[#507969]"
          onMouseEnter={() => setHoverCart(true)}
          onMouseLeave={() => setHoverCart(false)}
          onClick={handleProtectedClick}
        >
          {hoverCart ? <FaShoppingCart /> : <FiShoppingCart />}
        </button>

        <button
          className="flex items-center justify-center text-primary text-2xl hover:text-[#507969]"
          onMouseEnter={() => setHoverHistory(true)}
          onMouseLeave={() => setHoverHistory(false)}
          onClick={handleProtectedClick}
        >
          {hoverHistory ? <RiHistoryFill /> : <RiHistoryLine />}
        </button>

        <button
          className="text-[15px] font-medium text-white bg-button sm:px-6 px-4 py-1 rounded-full"
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden flex items-center">
        <button
          className="text-3xl text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <HiX /> : <HiMenu />}
        </button>

        {isMenuOpen && (
          <div className="absolute top-14 right-4 bg-white shadow-md rounded-lg p-4 flex flex-col space-y-3 z-50">
            <button
              className="flex items-center justify-start text-primary text-xl"
              onClick={() => {
                setIsMenuOpen(false);
                handleProtectedClick();
              }}
            >
              <FiHeart />
              <span className="ml-2">Wishlist</span>
            </button>

            <button
              className="flex items-center justify-start text-primary text-xl"
              onClick={() => {
                setIsMenuOpen(false);
                handleProtectedClick();
              }}
            >
              <FiShoppingCart />
              <span className="ml-2">Cart</span>
            </button>

            <button
              className="flex items-center justify-start text-primary text-xl"
              onClick={() => {
                setIsMenuOpen(false);
                handleProtectedClick();
              }}
            >
              <RiHistoryLine />
              <span className="ml-2">History</span>
            </button>

            <button
              className="text-[15px] font-medium text-white bg-button px-4 py-1 rounded-full"
              onClick={() => {
                setIsMenuOpen(false);
                setShowLogin(true);
              }}
            >
              Login
            </button>
          </div>
        )}
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
              className="bg-button text-white px-4 py-2 rounded-full mr-2"
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
