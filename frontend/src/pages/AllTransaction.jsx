import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiShoppingBag,
  FiUser,
  FiPackage,
  FiHash,
  FiClock,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
  FiTag,
} from "react-icons/fi";

const AllTransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("user_token");

    if (!token || role !== "seller") {
      navigate("/");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sellertransactionpage/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransactions(res.data);
      } catch (error) {
        console.error("Gagal memuat transaksi:", error);
      }
    };

    fetchTransactions();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "dibayar":
        return <FiCheckCircle className="text-green-500" />;
      case "completed":
      case "selesai":
        return <FiCheckCircle className="text-green-500" />;
      case "pending":
      case "menunggu":
        return <FiAlertCircle className="text-orange-500" />;
      case "cancelled":
      case "dibatalkan":
        return <FiXCircle className="text-red-500" />;
      case "not paid":
      case "belum dibayar":
      case "unpaid":
        return <FiClock className="text-gray-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "dibayar":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
      case "selesai":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "menunggu":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
      case "dibatalkan":
        return "bg-red-100 text-red-800 border-red-200";
      case "not paid":
      case "belum dibayar":
      case "unpaid":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-500 rounded-xl shadow-lg">
                <FiShoppingBag className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Daftar Transaksi
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola semua transaksi pembeli Anda
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
                <FiTrendingUp className="text-green-600" />
                <span className="text-green-800 font-medium">
                  {transactions.length} Transaksi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <FiShoppingBag className="text-2xl text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Belum Ada Transaksi
            </h3>
            <p className="text-gray-600">
              Transaksi pembeli akan muncul di sini setelah ada pesanan masuk.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-[#2d5847] to-[#9fb5ad] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Riwayat Transaksi Pembeli
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b border-green-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">
                      <div className="flex items-center space-x-2">
                        <FiHash className="text-green-600" />
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">
                      <div className="flex items-center space-x-2">
                        <FiUser className="text-green-600" />
                        <span>Pembeli</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">
                      <div className="flex items-center space-x-2">
                        <FiPackage className="text-green-600" />
                        <span>Produk</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-800">
                      <div className="flex items-center justify-center space-x-2">
                        <FiHash className="text-green-600" />
                        <span>Jumlah</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-800">
                      <div className="flex items-center justify-center space-x-2">
                        <FiCheckCircle className="text-green-600" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-800">
                      <div className="flex items-center justify-center space-x-2">
                        <FiCalendar className="text-green-600" />
                        <span>Tanggal</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((trx) => (
                    <tr
                      key={trx.id}
                      onClick={() =>
                        navigate(`/transactiondetail/${trx.transaction_item}`)
                      }
                      className="hover:bg-green-25 transition-colors duration-200 group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              #{trx.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-400 rounded-full flex items-center justify-center">
                            <FiUser className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {trx.user_id}
                            </p>
                            <p className="text-xs text-gray-500">Pembeli</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-800 truncate">
                            {trx.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {trx.category_name || "Kategori tidak tersedia"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                          <span className="text-green-800 font-semibold">
                            {trx.quantity}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            trx.status
                          )}`}
                        >
                          {getStatusIcon(trx.status)}
                          <span>{trx.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">
                            {new Date(trx.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(trx.created_at).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {transactions.map((trx) => (
                <div
                  key={trx.id}
                  onClick={() =>
                    navigate(`/transactiondetail/${trx.transaction_item}`)
                  }
                  className="bg-gradient-to-r from-white to-green-25 border border-green-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">
                          #{trx.id}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          trx.status
                        )}`}
                      >
                        {getStatusIcon(trx.status)}
                        <span>{trx.status}</span>
                      </span>
                    </div>
                    <FiEye className="text-green-500" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FiUser className="text-green-500 text-sm" />
                      <span className="text-sm font-medium text-gray-800">
                        {trx.user_id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiTag className="text-green-500 text-sm" />
                      <span className="text-xs text-gray-500">
                        {trx.category_name || "Kategori tidak tersedia"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPackage className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600 truncate">
                        {trx.product_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FiHash className="text-green-500 text-sm" />
                        <span className="text-sm text-gray-600">
                          Jumlah: {trx.quantity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <FiCalendar />
                        <span>
                          {new Date(trx.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTransactionTable;
