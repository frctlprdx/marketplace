const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 <- gap-8 text-justify">
            
            {/* Kolom 1 - Tentang Kita */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Tentang Kita</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Marketplace Desa</li>
                <li>Visi & Misi</li>
                <li>Tim Pengelola</li>
              </ul>
            </div>
  
            {/* Kolom 2 - Customer Care */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Care</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Bantuan</li>
                <li>Syarat & Ketentuan</li>
                <li>Kebijakan Privasi</li>
              </ul>
            </div>
  
            {/*
              👉 Tambah kolom baru:
              - Copy salah satu <div> di atas dan paste di bawah.
              - Grid akan otomatis menyesuaikan jumlah kolomnya.
              - Pastikan tetap dalam <div className="grid ..."> agar responsif.
            */}
  
          </div>
  
          {/* Garis pemisah */}
          <div className="my-6 border-t border-gray-700"></div>
  
          {/* Copyright */}
          <div className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Marketplace Desa. All rights reserved.
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  