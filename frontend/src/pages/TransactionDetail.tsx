import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface TransactionDetail {
  name: string;
  label: string;
  recipient_name: string;
  province: string;
  city: string;
  subdistrict: string;
  amount: number;
  total_price: string;
  courier: string;
  image: string; // Tambahan: gambar produk
}

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="p-4">Memuat detail transaksi...</p>;

  if (!detail) return <p className="p-4">Detail transaksi tidak ditemukan.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Detail Transaksi</h2>
      <img
        src={detail.image}
        alt={detail.name}
        className="w-full h-64 object-cover rounded-md mb-4"
      />
      <div className="space-y-2">
        <p>
          <span className="font-semibold">Produk:</span> {detail.name}
        </p>
        <p>
          <span className="font-semibold">Jumlah:</span> {detail.amount}
        </p>
        <p>
          <span className="font-semibold">Total Harga:</span> Rp{" "}
          {Number(detail.total_price).toLocaleString("id-ID")}
        </p>
        <p>
          <span className="font-semibold">Kurir:</span> {detail.courier}
        </p>
        <hr className="my-3" />
        <p>
          <span className="font-semibold">Kirim ke:</span>
        </p>
        <p>
          <span className="font-semibold">Label Alamat:</span> {detail.label}
        </p>
        <p>
          <span className="font-semibold">Nama Penerima:</span>{" "}
          {detail.recipient_name}
        </p>
        <p>
          <span className="font-semibold">Provinsi:</span> {detail.province}
        </p>
        <p>
          <span className="font-semibold">Kota:</span> {detail.city}
        </p>
        <p>
          <span className="font-semibold">Kecamatan:</span> {detail.subdistrict}
        </p>
      </div>
    </div>
  );
};

export default TransactionDetail;
