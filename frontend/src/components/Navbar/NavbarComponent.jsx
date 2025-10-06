import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GuestNav from "./GuestNav";
import UserNav from "./UserNav";
import logo from "../../../public/assets/logo cerah.png";
import nogosaren from "../../../public/assets/nogosaren.png";

const NavbarComponent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLogo, setCurrentLogo] = useState(0);
  const navigate = useNavigate();

  const logos = [logo, nogosaren];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/product?search=${searchQuery}`);
  };

  useEffect(() => {
    const checkLogin = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };

    checkLogin();

    window.addEventListener("login", checkLogin);
    window.addEventListener("logout", checkLogin);

    return () => {
      window.removeEventListener("login", checkLogin);
      window.removeEventListener("logout", checkLogin);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length);
    }, 3000); // Ganti logo setiap 3 detik

    return () => clearInterval(interval);
  }, []);

  const logoVariants = {
    enter: {
      opacity: 0,
      x: -20,
    },
    center: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.5,
        ease: "easeIn",
      },
    },
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="w-screen h-22 bg-white shadow px-2 sm:px-6 flex items-center justify-between">
      <Link to="/">
        <div className="cursor-pointer sm:h-20 h-10 sm:w-48 w-32 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentLogo}
              src={logos[currentLogo]}
              alt={currentLogo === 0 ? "GO-SMILE" : "Nogosaren"}
              initial="enter"
              animate="center"
              exit="exit"
              variants={logoVariants}
              className="h-full w-full object-contain absolute inset-0"
            />
          </AnimatePresence>
        </div>
      </Link>

      <div className="flex-1 mx-2 sm:mx-12">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for anything"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 sm:px-6 py-1.5 sm:py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#507969] text-sm sm:text-base"
          />
        </form>
      </div>

      <div>{isLoggedIn ? <UserNav /> : <GuestNav />}</div>
    </div>
  );
};

export default NavbarComponent;