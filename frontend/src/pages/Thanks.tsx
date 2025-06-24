import { useNavigate } from "react-router-dom";

const Thanks = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
      <p className="text-lg text-gray-700">Your submission hasbeen received.</p>
      <button
        className="bg-button mt-5 text-white px-15 sm:px-30 py-3 rounded-full text-lg font-semibold transition duration-300 cursor-pointer"
        onClick={handleClick}
      >
        Kembali Ke Halaman Utama
      </button>
    </div>
  );
};
export default Thanks;
