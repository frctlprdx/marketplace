import { AiOutlineHeart, AiOutlineShoppingCart, AiOutlineUser } from "react-icons/ai";


const UserNav = () => {

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // refresh biar navbar update
  };

  return (
    <div className="flex items-center space-x-4">
        <button className="text-black text-xl sm:text-2xl hover:text-orange-500"> <AiOutlineHeart /></button>
        <button className="text-black text-xl sm:text-2xl hover:text-orange-500"><AiOutlineShoppingCart /></button>
        <button onClick={handleLogout} className="text-black text-xl sm:text-2xl hover:text-orange-500"> <AiOutlineUser /></button>
    </div>
  );
}
export default UserNav;