import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const SellerSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Tombol toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-25 left-4 z-50 bg-gradient-to-r from-green-700 to-green-300 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm cursor-pointer"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-50 to-white shadow-2xl z-40 transform transition-all duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        {/* <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-300 to-green-300">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            Seller Dashboard
          </h2>
        </div> */}

        {/* Navigation */}
        <nav className="px-6 pt-35">
          <Link
            to="/allproducts"
            className="group flex items-center gap-4 p-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:translate-x-1 "
            onClick={() => setOpen(false)}
          >
            {/* <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
              <div className="w-5 h-5 bg-green-500 rounded"></div>
            </div> */}
            <span className="font-medium">Semua Produk</span>
          </Link>

          <Link
            to="/addproduct"
            className="group flex items-center gap-4 p-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:translate-x-1"
            onClick={() => setOpen(false)}
          >
            {/* <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
              <div className="w-5 h-5 bg-green-500 rounded"></div>
            </div> */}
            <span className="font-medium">Tambah Produk</span>
          </Link>

          <Link
            to="/addcategory"
            className="group flex items-center gap-4 p-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:translate-x-1"
            onClick={() => setOpen(false)}
          >
            {/* <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
              <div className="w-5 h-5 bg-green-500 rounded"></div>
            </div> */}
            <span className="font-medium">Tambah Kategori</span>
          </Link>

          {/* <Link
            to="/alltransaction"
            className="group flex items-center gap-4 p-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:translate-x-1"
            onClick={() => setOpen(false)}
          >
            <span className="font-medium">Lihat Transaksi</span>
          </Link> */}
        </nav>

        {/* Decorative element */}
        {/* <div className="absolute bottom-6 left-6 right-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <div className="mt-4 text-center text-xs text-gray-400">
            Seller Panel v2.0
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SellerSidebar;
