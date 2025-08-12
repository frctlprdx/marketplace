import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiMapPin,
  FiTruck,
  FiDollarSign,
  FiHash,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/transactiondetail/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDetail(res.data);
      } catch (error) {
        console.error("Gagal mengambil detail transaksi:", error);
        navigate("/"); // redirect kalau gagal
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FiLoader className="text-3xl text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail transaksi...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FiAlertTriangle className="text-3xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Detail transaksi tidak ditemukan.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors mb-4"
          >
            <FiArrowLeft />
            <span>Kembali</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Detail Transaksi</h1>
          <p className="text-gray-600">Informasi lengkap pesanan #{id}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Product */}
          <div className="space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-orange-500 px-4 py-3">
                <h2 className="text-white font-semibold flex items-center space-x-2">
                  <FiPackage />
                  <span>Produk</span>
                </h2>
              </div>
              <div className="p-4">
                {/* Product Image */}
                <div className="mb-4">
                  {!imageError ? (
                    <img
                      src={detail.image}
                      alt={detail.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FiPackage className="text-4xl mx-auto mb-2" />
                        <p className="text-sm">Gambar tidak tersedia</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="text-lg font-bold text-gray-800 mb-3">{detail.name}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <FiHash className="text-blue-600 text-sm" />
                      <span className="text-sm text-blue-600 font-medium">Jumlah</span>
                    </div>
                    <p className="font-semibold text-gray-800">{detail.amount} pcs</p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <FiDollarSign className="text-green-600 text-sm" />
                      <span className="text-sm text-green-600 font-medium">Total</span>
                    </div>
                    <p className="font-semibold text-gray-800">
                      Rp {Number(detail.total_price).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courier Info */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-500 px-4 py-3">
                <h2 className="text-white font-semibold flex items-center space-x-2">
                  <FiTruck />
                  <span>Kurir</span>
                </h2>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiTruck className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg uppercase">{detail.courier}</p>
                    <p className="text-sm text-gray-600">Jasa pengiriman</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping Address */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-orange-500 px-4 py-3">
                <h2 className="text-white font-semibold flex items-center space-x-2">
                  <FiMapPin />
                  <span>Alamat Pengiriman</span>
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Recipient Info */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiUser className="text-orange-600" />
                    <span className="text-sm text-orange-600 font-medium">Penerima</span>
                  </div>
                  <p className="font-bold text-gray-800 text-lg">{detail.recipient_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{detail.label}</span>
                  </p>
                </div>

                {/* Address Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">PROVINSI</p>
                    <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{detail.province}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">KOTA/KABUPATEN</p>
                    <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{detail.city}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">KECAMATAN</p>
                    <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{detail.subdistrict}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
