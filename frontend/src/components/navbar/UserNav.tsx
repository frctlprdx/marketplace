import { AiOutlineHeart, AiOutlineShoppingCart, AiOutlineUser } from "react-icons/ai";


const UserNav = () => {

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // refresh biar navbar update
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="text-black text-2xl sm:text-3xl hover:text-orange-500"> <AiOutlineHeart /></button>
        <button className="text-black text-2xl sm:text-3xl hover:text-orange-500"><AiOutlineShoppingCart /></button>
        <button onClick={handleLogout} className="text-black text-2xl sm:text-3xl hover:text-orange-500"> <AiOutlineUser /></button>
    </div>
  );
}
export default UserNav;