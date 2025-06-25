import { AiOutlineUser } from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { RiHistoryFill, RiHistoryLine } from "react-icons/ri";
import { MdStorefront } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hoverHeart, setHoverHeart] = useState(false);
  const [hoverCart, setHoverCart] = useState(false);
  const [hoverHistory, setHoverHistory] = useState(false);

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
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickWishlist = () => {
    const userId = localStorage.getItem("user_id");
    if (userId && role === "customer") {
      navigate(`/wishlist?user_id=${userId}`);
    } else {
      toast.error("Login akun customer terlebih dahulu");
    }
  };

  const handleClickCart = () => {
    const userId = localStorage.getItem("user_id");
    if (userId && role === "customer") {
      navigate(`/cart?user_id=${userId}`);
    } else {
      toast.error("Login akun customer terlebih dahulu");
    }
  };

  const handleClickHistory = () => {
    const userId = localStorage.getItem("user_id");
    if (userId && role === "customer") {
      navigate(`/history?user_id=${userId}`);
    } else {
      toast.error("Login akun customer terlebih dahulu");
    }
  };

  const handleClickProfile = () => {
    const userId = localStorage.getItem("user_id");
    navigate(`/profile?user_id=${userId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Desktop View */}
      <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
        <button
          className="text-primary text-2xl hover:text-red-500 transition"
          onMouseEnter={() => setHoverHeart(true)}
          onMouseLeave={() => setHoverHeart(false)}
          onClick={handleClickWishlist}
        >
          {hoverHeart ? <FaHeart /> : <FiHeart />}
        </button>

        {/* <button onClick={handleLogout}>
            logout
        </button> */}

        <button
          className="text-primary text-2xl hover:text-black transition"
          onMouseEnter={() => setHoverCart(true)}
          onMouseLeave={() => setHoverCart(false)}
          onClick={handleClickCart}
        >
          {hoverCart ? <FaShoppingCart /> : <FiShoppingCart />}
        </button>

        {role === "customer" && (
          <button
            className="text-primary text-2xl hover:text-black transition"
            onMouseEnter={() => setHoverHistory(true)}
            onMouseLeave={() => setHoverHistory(false)}
            onClick={handleClickHistory}
          >
            {hoverHistory ? <RiHistoryFill /> : <RiHistoryLine />}
          </button>
        )}

        {role === "seller" && (
          <button
            className="text-primary text-2xl hover:text-black transition"
            onMouseEnter={() => setHoverHistory(true)}
            onMouseLeave={() => setHoverHistory(false)}
            onClick={() => navigate("/allproducts")}
          >
            {hoverHistory ? <MdStorefront /> : <MdStorefront />}
          </button>
        )}

        <button
          onClick={handleClickProfile}
          className="text-primary text-2xl hover:text-primary"
        >
          <AiOutlineUser />
        </button>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-3xl text-primary"
        >
          {isMenuOpen ? <HiX /> : <HiMenu />}
        </button>

        {isMenuOpen && (
          <div className="absolute top-14 right-4 bg-white shadow-md rounded-lg p-4 flex flex-col space-y-3 z-50 w-64">
            <button
              onClick={() => {
                handleClickWishlist();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-primary text-lg"
            >
              <FiHeart /> Wishlist
            </button>

            <button
              onClick={() => {
                handleClickCart();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-primary text-lg"
            >
              <FiShoppingCart /> Cart
            </button>

            {role === "customer" && (
              <button
                onClick={() => {
                  handleClickHistory();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-primary text-lg"
              >
                <RiHistoryLine /> History Transaksi
              </button>
            )}

            <button
              onClick={() => {
                handleClickProfile();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-primary text-lg"
            >
              <IoPersonOutline /> Profile
            </button>

            {role === "seller" && (
              <button
                onClick={() => {
                  navigate("/allproducts");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-primary text-lg"
              >
                <MdStorefront /> Kelola Toko
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNav;
