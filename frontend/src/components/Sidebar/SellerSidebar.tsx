import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const SellerSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Tombol toggle */}
      <button
        onClick={() => setOpen(!open)} // <- toggle juga agar bisa nutup
        className="fixed top-20 left-4 z-50 bg-orange-500 text-white p-2 rounded-md shadow-md"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Seller Menu</h2>
        </div>
        <nav className="p-4 pt-16 space-y-4">
          <Link
            to="/allproducts"
            className="block text-gray-700 hover:text-orange-500"
            onClick={() => setOpen(false)}
          >
            Semua Produk
          </Link>
          <Link
            to="/addproduct"
            className="block text-gray-700 hover:text-orange-500"
            onClick={() => setOpen(false)}
          >
            Tambah Produk
          </Link>
          <Link
            to="/alltransaction"
            className="block text-gray-700 hover:text-orange-500"
            onClick={() => setOpen(false)}
          >
            Lihat Transaksi
          </Link>
        </nav>
      </div>
    </>
  );
};

export default SellerSidebar;
