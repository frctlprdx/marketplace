import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Transaction {
  id: number;
  transaction_item: number;
  user_id: string; // nama user
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const AllTransactionTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
          `${import.meta.env.VITE_API_URL}/sellertransactionpage`,
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

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Daftar Transaksi Pembeli</h2>
      {transactions.length === 0 ? (
        <p>Tidak ada transaksi ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Pembeli</th>
                <th className="px-4 py-2 border">Produk</th>
                <th className="px-4 py-2 border">Jumlah</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    navigate(`/transactiondetail/${trx.transaction_item}`)
                  }
                >
                  <td className="px-4 py-2 border text-center">{trx.id}</td>
                  <td className="px-4 py-2 border">{trx.user_id}</td>
                  <td className="px-4 py-2 border">{trx.product_name}</td>
                  <td className="px-4 py-2 border text-center">{trx.amount}</td>
                  <td className="px-4 py-2 border text-center">{trx.status}</td>
                  <td className="px-4 py-2 border text-center">
                    {new Date(trx.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllTransactionTable;
