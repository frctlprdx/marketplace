import { useEffect, useState } from "react";

type Transaction = {
  image: string;
  name: string;
  quantity: number;
  total_price: number;
  courier: string;
  status: string;
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Your original API logic with localStorage
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("user_token");``

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/transactionhistory?user_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        console.error("Gagal mengambil data transaksi", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#507969] mx-auto mb-4"></div>
          <p style={{ color: '#507969' }} className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <h1 style={{ color: '#507969' }} className="text-2xl sm:text-4xl font-bold text-center">
            Riwayat Transaksi
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        {transactions.length > 0 ? (
          <>
            {/* Mobile View - Stack Cards */}
            <div className="sm:hidden space-y-4">
              {transactions.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-[#507969] transition-all duration-300 group"
                >
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover shadow-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 style={{ color: '#507969' }} className="font-bold text-lg mb-2 truncate transition-colors duration-300 group-hover:!text-[#2d5847]">
                          {item.name}
                        </h3>
                        <div className="space-y-1">
                          <p style={{ color: '#507969' }} className="opacity-90 text-sm transition-colors duration-300 group-hover:!text-[#2d5847]">
                            <span className="font-medium">Jumlah:</span> {item.quantity}
                          </p>
                          <p style={{ color: '#507969' }} className="opacity-90 text-sm transition-colors duration-300 group-hover:!text-[#2d5847]">
                            <span className="font-medium">Kurir:</span> {item.courier}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span style={{ color: '#507969' }} className="text-xl font-bold transition-colors duration-300 group-hover:!text-[#2d5847]">
                          {formatPrice(item.total_price)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Grid Cards */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {transactions.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl shadow-sm border-2 border-transparent hover:border-[#507969] hover:shadow-xl transition-all duration-500 group"
                >
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-56 object-cover rounded-t-3xl"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 style={{ color: '#507969' }} className="font-bold text-xl mb-3 transition-colors duration-300 group-hover:!text-[#2d5847]">
                      {item.name}
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span style={{ color: '#507969' }} className="opacity-80 font-medium transition-colors duration-300 group-hover:!text-[#2d5847]">Jumlah</span>
                        <span style={{ color: '#507969' }} className="font-semibold transition-colors duration-300 group-hover:!text-[#2d5847]">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: '#507969' }} className="opacity-80 font-medium transition-colors duration-300 group-hover:!text-[#2d5847]">Kurir</span>
                        <span style={{ color: '#507969' }} className="font-semibold transition-colors duration-300 group-hover:!text-[#2d5847]">{item.courier}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <span style={{ color: '#507969' }} className="text-2xl font-bold transition-colors duration-300 group-hover:!text-[#2d5847]">
                          {formatPrice(item.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <div 
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 border-2"
                style={{ borderColor: '#9fb5ad' }}
              >
                <svg style={{ color: '#507969' }} className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 style={{ color: '#507969' }} className="text-2xl font-bold mb-2">Belum ada riwayat transaksi</h3>
              <p style={{ color: '#507969' }} className="opacity-70 text-lg">Mulai berbelanja untuk melihat riwayat transaksi Anda di sini!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;