import Modal from "../Modals/Modal";

interface Props {
    onClose: () => void
    onSwitchToRegister: () => void
  }
  
  const LoginModal = ({ onClose, onSwitchToRegister }: Props) => {
    return (
      <Modal onClose={onClose}>
        <h2 className="text-lg font-semibold mb-4">Login</h2>
        <input type="email" placeholder="Email" className="w-full border mb-2 px-3 py-2 rounded" />
        <input type="password" placeholder="Password" className="w-full border mb-4 px-3 py-2 rounded" />
        <button className="w-full bg-orange-500 text-white px-4 py-2 rounded mb-2 hover:bg-orange-600">Login</button>
        <p className="text-sm text-center">Belum punya akun? <button onClick={onSwitchToRegister} className="text-orange-600 hover:underline">Register</button></p>
      </Modal>
    )
  }
  
  export default LoginModal