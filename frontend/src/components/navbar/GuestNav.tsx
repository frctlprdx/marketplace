import { useState } from "react"
import LoginModal from "../Auth/LoginModal";
import RegisterModal from "../Auth/RegisterModal";
import { AiOutlineHeart, AiOutlineShoppingCart, AiOutlineUser } from "react-icons/ai";


const GuestNav = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <>
    <div className="flex items-center space-x-4">
        <button className="text-black text-xl sm:text-2xl hover:text-orange-500"><AiOutlineHeart /></button>
          <button className="text-black text-xl sm:text-2xl hover:text-orange-500"><AiOutlineShoppingCart /></button>
          <button className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded-full" onClick={() => setShowLogin(true)}>
            Login
          </button>
    </div>
    
    {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false)
            setShowRegister(true)
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false)
            setShowLogin(true)
          }}
        />
      )}

    </>
  );
}

export default GuestNav;