import { useNavigate } from "react-router-dom";

const Error = () => {

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
      <p className="text-lg text-gray-700">An unexpected error occurred. Please try again later.</p>
      <button className="bg-button mt-5 text-white px-15 sm:px-30 py-3 rounded-full text-lg font-semibold transition duration-300 cursor-pointer" onClick={handleClick}>Kembali Ke Halaman Utama</button>
    </div>
  );
}
export default Error;