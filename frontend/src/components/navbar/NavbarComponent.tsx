import { useEffect, useState } from "react";
import GuestNav from "./GuestNav";
import UserNav from "./UserNav";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <div className="w-screen h-16 bg-white shadow px-6 flex items-center justify-between">
      <div className="text-2xl sm:text-3xl font-bold text-orange-600 pb-1">Etsy</div>

      <div className="flex-1 mx-6">
        <input
          type="text"
          placeholder="Search for anything"
          className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        {isLoggedIn ? <UserNav /> : <GuestNav />}
      </div>
    </div>
  );
};

export default Navbar;
