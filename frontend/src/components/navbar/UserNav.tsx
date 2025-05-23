import {
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineLogout,
} from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserNav = () => {
  const [hoverHeart, setHoverHeart] = useState(false);
  const [hoverCart, setHoverCart] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("user_token");
    window.location.href = "/";
  };

  const handleClickWishlist = () => {
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    if (userId && role === "customer") {
      navigate(`/wishlist?user_id=${userId}`);
    } else {
      toast.error("Login Akun customer terlebih dahulu");
    }
  };

  const handleClickCart = () => {
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    if (userId && role === "customer") {
      navigate(`/cart?user_id=${userId}`);
    } else {
      toast.error("Login Akun customer terlebih dahulu");
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <button
        className="flex items-center justify-center text-black text-2xl hover:text-orange-500"
        onMouseEnter={() => setHoverHeart(true)}
        onMouseLeave={() => setHoverHeart(false)}
        onClick={handleClickWishlist}
      >
        {hoverHeart ? <FaHeart /> : <FiHeart />}
      </button>

      <button
        className="flex items-center justify-center text-black text-2xl hover:text-orange-500"
        onMouseEnter={() => setHoverCart(true)}
        onMouseLeave={() => setHoverCart(false)}
        onClick={handleClickCart}
      >
        {hoverCart ? <FaShoppingCart /> : <FiShoppingCart />}
      </button>

      <div className="relative flex items-center" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center text-black text-2xl hover:text-orange-500"
        >
          <AiOutlineUser />
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-48 bg-white p-4 shadow-md z-50">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition text-sm border rounded-md my-2"
            >
              <IoPersonOutline className="text-lg" />
              Profile
            </button>

            <button
              onClick={() => navigate("/setting")}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition text-sm border rounded-md my-2"
            >
              <AiOutlineSetting className="text-lg" />
              Settings
            </button>

            {role === "seller" && (
              <button
                onClick={() => navigate("/allproducts")}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition text-sm border rounded-md my-2"
              >
                <MdStorefront className="text-lg" />
                Kelola Toko
              </button>
            )}

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
