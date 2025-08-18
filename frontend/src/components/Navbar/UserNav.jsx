import { AiOutlineUser } from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { RiHistoryFill, RiHistoryLine } from "react-icons/ri";
import { MdStorefront } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

const UserNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const dropdownRef = useRef(null);
  const [hoverHeart, setHoverHeart] = useState(false);
  const [hoverCart, setHoverCart] = useState(false);
  const [hoverHistory, setHoverHistory] = useState(false);

  // Notifikasi custom state
  const [notification, setNotification] = useState(null);

  // Auto logout states
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(120);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const warningIntervalRef = useRef(null);

  const navigate = useNavigate();

  // Konfigurasi auto logout (dalam milidetik)
  const INACTIVITY_TIMEOUT = 90 * 60 * 1000; // 90 menit (1.5 jam) - optimal untuk e-commerce
  const WARNING_TIME = 2 * 60 * 1000; // 2 menit warning sebelum logout

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi notifikasi custom
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Auto logout functions
  const performLogout = useCallback(() => {
    // Clear semua timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    // Reset states
    setShowLogoutWarning(false);
    setWarningCountdown(120);

    // Logout
    localStorage.clear();
    showNotification("Sesi Anda telah berakhir karena tidak ada aktivitas");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }, []);

  const startWarningCountdown = useCallback(() => {
    setWarningCountdown(120);
    setShowLogoutWarning(true);

    // Countdown interval
    warningIntervalRef.current = setInterval(() => {
      setWarningCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(warningIntervalRef.current);
          performLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto logout setelah warning time
    countdownRef.current = setTimeout(() => {
      performLogout();
    }, WARNING_TIME);
  }, [performLogout]);

  const resetAutoLogoutTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    // Reset warning state
    setShowLogoutWarning(false);
    setWarningCountdown(120);

    // Hanya set timer jika user sudah login
    const userId = localStorage.getItem("user_id");
    if (userId) {
      // Set warning timer
      warningTimeoutRef.current = setTimeout(() => {
        startWarningCountdown();
      }, INACTIVITY_TIMEOUT - WARNING_TIME);
    }
  }, [startWarningCountdown, INACTIVITY_TIMEOUT, WARNING_TIME]);

  const extendSession = () => {
    resetAutoLogoutTimer();
    setShowLogoutWarning(false);
  };

  // Setup auto logout ketika component mount
  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    // Hanya setup auto logout jika user sudah login
    if (userId) {
      // Event yang dianggap sebagai aktivitas user
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
      ];

      const handleUserActivity = () => {
        resetAutoLogoutTimer();
      };

      // Start timer
      resetAutoLogoutTimer();

      // Add event listeners
      events.forEach((event) => {
        document.addEventListener(event, handleUserActivity, true);
      });

      // Cleanup
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (countdownRef.current) clearTimeout(countdownRef.current);
        if (warningIntervalRef.current)
          clearInterval(warningIntervalRef.current);

        events.forEach((event) => {
          document.removeEventListener(event, handleUserActivity, true);
        });
      };
    }
  }, [resetAutoLogoutTimer]);

  const requireCustomer = (callback) => {
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserId) {
      showNotification("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    if (storedRole === "customer") {
      callback();
    } else {
      showNotification("Fitur ini hanya untuk pelanggan.");
    }
  };

  const handleClickWishlist = () => {
    requireCustomer(() => navigate("/wishlist"));
  };

  const handleClickCart = () => {
    requireCustomer(() => navigate("/cart"));
  };

  const handleClickHistory = () => {
    requireCustomer(() => navigate("/history"));
  };

  const handleClickProfile = () => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      showNotification("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }
    navigate("/profile");
  };

  const handleLogout = () => {
    // Clear auto logout timers sebelum logout manual
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notifikasi custom */}
      {notification && (
        <div className="fixed top-5 right-5 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification}
        </div>
      )}

      {/* Warning Modal untuk Auto Logout */}
      {showLogoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-mx">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sesi Akan Berakhir
              </h3>
              <p className="text-gray-600 mb-4">
                Sesi Anda akan berakhir dalam{" "}
                <span className="font-bold text-red-600">
                  {warningCountdown}
                </span>{" "}
                detik karena tidak ada aktivitas.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={extendSession}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Perpanjang Sesi
                </button>
                <button
                  onClick={performLogout}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Logout Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
        {/* <button onClick={handleLogout}>logout</button> */}
        {role === "customer" && (
          <div className="items-center space-x-2 sm:space-x-4">
            {/* <button
              className="text-primary text-2xl hover:text-red-500 transition cursor-pointer"
              onMouseEnter={() => setHoverHeart(true)}
              onMouseLeave={() => setHoverHeart(false)}
              onClick={handleClickWishlist}
            >
              {hoverHeart ? <FaHeart /> : <FiHeart />}
            </button>
            <button
              className="text-primary text-2xl hover:text-black transition cursor-pointer"
              onMouseEnter={() => setHoverCart(true)}
              onMouseLeave={() => setHoverCart(false)}
              onClick={handleClickCart}
            >
              {hoverCart ? <FaShoppingCart /> : <FiShoppingCart />}
            </button> */}
          </div>
        )}

        {role === "seller" && (
          <button
            className="text-primary mb-2 text-2xl hover:text-black transition cursor-pointer"
            onMouseEnter={() => setHoverHistory(true)}
            onMouseLeave={() => setHoverHistory(false)}
            onClick={() => navigate("/allproducts")}
          >
            <MdStorefront />
          </button>
        )}

        <button
          onClick={handleClickProfile}
          className="text-primary mb-2 text-2xl hover:text-primary cursor-pointer"
        >
          <AiOutlineUser />
        </button>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-3xl text-primary cursor-pointer"
        >
          {isMenuOpen ? <HiX /> : <HiMenu />}
        </button>

        {isMenuOpen && (
          <div className="absolute top-14 right-4 bg-white shadow-md rounded-lg p-4 flex flex-col space-y-3 z-50 w-64">
            {/* <button
              onClick={() => {
                handleClickWishlist();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-primary text-lg cursor-pointer"
            >
              <FiHeart /> Wishlist
            </button>

            <button
              onClick={() => {
                handleClickCart();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-primary text-lg cursor-pointer"
            >
              <FiShoppingCart /> Cart
            </button> */}

            {/* {role === "customer" && (
              <button
                onClick={() => {
                  handleClickHistory();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-primary text-lg cursor-pointer"
              >
                <RiHistoryLine /> History Transaksi
              </button>
            )} */}

            <button
              onClick={() => {
                handleClickProfile();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-primary text-lg cursor-pointer"
            >
              <IoPersonOutline /> Profile
            </button>

            {role === "seller" && (
              <button
                onClick={() => {
                  navigate("/allproducts");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-primary text-lg cursor-pointer"
              >
                <MdStorefront /> Kelola Toko
              </button>
            )}

            {/* Logout button untuk mobile */}
            {/* <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-red-600 text-lg cursor-pointer border-t pt-3"
            >
              Logout
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNav;
