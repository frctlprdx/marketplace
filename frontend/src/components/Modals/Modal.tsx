// components/modals/Modal.tsx
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: ModalProps) => {
  return (
    <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg min-w-[300px] relative">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-primary hover:text-black text-xl cursor-pointer"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
