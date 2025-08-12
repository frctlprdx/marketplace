import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GuestNav from "./GuestNav";
import UserNav from "./UserNav";
import logo from "../../../public/assets/logo cerah.png";

const NavbarComponent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to the /product page with the search query
    navigate(`/product?search=${searchQuery}`);
  };

  useEffect(() => {
    const checkLogin = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };

    checkLogin(); // jalankan sekali saat mount

    window.addEventListener("login", checkLogin);
    window.addEventListener("logout", checkLogin);

    return () => {
      window.removeEventListener("login", checkLogin);
      window.removeEventListener("logout", checkLogin);
    };
  }, []);

  return (
    <div className="w-screen h-22 bg-white shadow px-2 sm:px-6 flex items-center justify-between">
      <Link to="/">
        <div className="cursor-pointer sm:h-20 h-10">
          <img src={logo} alt="logo" className="h-full w-full object-contain" />
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
