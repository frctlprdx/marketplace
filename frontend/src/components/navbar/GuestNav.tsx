import { useState } from "react";
import LoginModal from "../Auth/LoginModal";
import RegisterModal from "../Auth/RegisterModal";
import { AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const GuestNav = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const navigate = useNavigate();

  const handleClickWishlist = () => {
    navigate("/wishlist");
  };

  const handleClickCart = () => {
    navigate("/cart");
  };

  return (
    <>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="text-black text-2xl sm:text-4xl hover:text-orange-500"
          onClick={handleClickWishlist}
        >
          <AiOutlineHeart />
        </button>
        <button className="text-black text-2xl sm:text-4xl hover:text-orange-500"
          onClick={handleClickCart}
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

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
};

export default GuestNav;
