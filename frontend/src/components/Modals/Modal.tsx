// components/modals/Modal.tsx
interface ModalProps {
    children: React.ReactNode
    onClose: () => void
  }
  
  const Modal = ({ children, onClose }: ModalProps) => {
    return (
      <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg min-w-[300px] relative">
          <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl">&times;</button>
          {children}
        </div>
      </div>
    )
  }
  
  export default Modal
  