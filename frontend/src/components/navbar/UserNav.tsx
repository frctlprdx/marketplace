import {
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineLogout,
} from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const UserNav = () => {
  const [hoverHeart, setHoverHeart] = useState(false);
  const [hoverCart, setHoverCart] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // refresh biar navbar update
  };

  const navigate = useNavigate();

  const handleClickWishlist = () => {
    // Mengambil user_id dari localStorage
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");
    const userToken = localStorage.getItem("user_token");

    // Cek apakah user_id ada, jika ada baru navigasi
    if (userId && role === "customer") {
      console.log("User ID:", userId); // Menampilkan user_id di console
      console.log("Role:", role); // Menampilkan role di console
      console.log("User Token:", userToken); // Menampilkan user_token di console
      navigate(`/wishlist?user_id=${userId}`);
    } else {
      console.log("User ID atau role tidak ditemukan di localStorage");
      // Bisa menampilkan pesan atau redirect ke halaman lain jika role bukan customer
    }
  };

  const handleClickCart = () => {
    const userId = localStorage.getItem("user_id");

    // Cek apakah user_id ada, jika ada baru navigasi
    if (userId) {
      console.log("User ID:", userId); // Menampilkan user_id di console
      navigate(`/cart?user_id=${userId}`);
    } else {
      console.log("User ID tidak ditemukan di localStorage");
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Wishlist Icon */}
      <button
        className="flex items-center justify-center text-black text-2xl hover:text-orange-500"
        onMouseEnter={() => setHoverHeart(true)}
        onMouseLeave={() => setHoverHeart(false)}
        onClick={handleClickWishlist}
      >
        {hoverHeart ? <FaHeart /> : <FiHeart />}
      </button>

      {/* Cart Icon */}
      <button
        className="flex items-center justify-center text-black text-2xl hover:text-orange-500"
        onMouseEnter={() => setHoverCart(true)}
        onMouseLeave={() => setHoverCart(false)}
        onClick={handleClickCart}
      >
        {hoverCart ? <FaShoppingCart /> : <FiShoppingCart />}
      </button>

      {/* User Icon + Dropdown */}
      <div className="relative flex items-center">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center text-black text-2xl hover:text-orange-500"
        >
          <AiOutlineUser />
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-48 bg-transparent p-4 shadow-md z-50">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition text-sm border rounded-md my-2 "
            >
              <IoPersonOutline className="text-lg bo" />
              Profile
            </button>
            <button
              onClick={() => navigate("/setting")}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition text-sm border rounded-md my-2"
            >
              <AiOutlineSetting className="text-lg" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition text-sm text-red-500 border rounded-md my-2"
            >
              <AiOutlineLogout className="text-lg" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserNav;
