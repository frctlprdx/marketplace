import { AiOutlineUser } from "react-icons/ai";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const UserNav = () => {
  const [hoverHeart, setHoverHeart] = useState(false);
  const [hoverCart, setHoverCart] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // refresh biar navbar update
  };

  const navigate = useNavigate();

  const handleClickWishlist = () => {
    navigate("/wishlist");
  };

  const handleClickCart = () => {
    navigate("/cart");
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <button
        className="text-black text-2xl sm:text-2xl hover:text-orange-500"
        onMouseEnter={() => setHoverHeart(true)}
        onMouseLeave={() => setHoverHeart(false)}
        onClick={handleClickWishlist}
      >
        {hoverHeart ? <FaHeart /> : <FiHeart />}
      </button>

      <button
        className="text-black text-2xl sm:text-2xl hover:text-orange-500"
        onMouseEnter={() => setHoverCart(true)}
        onMouseLeave={() => setHoverCart(false)}
        onClick={handleClickCart}
      >
        {hoverCart ? <FaShoppingCart /> : <FiShoppingCart />}
      </button>
      <button
        onClick={handleLogout}
        className="text-black text-2xl sm:text-2xl hover:text-orange-500"
      >
        <AiOutlineUser />
      </button>
    </div>
  );
};
export default UserNav;
