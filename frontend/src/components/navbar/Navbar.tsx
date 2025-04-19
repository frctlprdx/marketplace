import GuestNav from "./GuestNav";
import UserNav from "./UserNav";

const Navbar = () => {
    return (
      <div className="w-screen h-16 bg-white shadow px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-orange-600">
          Etsy
        </div>
  
        {/* Search Bar */}
        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="Search for anything"
            className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
  
        {/* Right Icons */}
        <div>
          <GuestNav />
        </div>
      </div>
    );
  };
  
  export default Navbar;
  