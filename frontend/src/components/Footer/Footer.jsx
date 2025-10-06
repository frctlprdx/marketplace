import { Mail, Globe, Phone, MapPin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Kolom 1 - Kontak Desa */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Desa Nogosaren
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              GO-SMILE Commerce platform marketplace milik desa untuk menjual produk susu hasil peternakan Desa Nogosaren
            </p>
          </div>

          {/* Kolom 2 - Hubungi Kami */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="mailto:kelurahan.nogosaren01@gmail.com" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  kelurahan.nogosaren01@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/6282137474907" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  082137474907
                </a>
              </li>
              <li>
                <a 
                  href="https://nogosaren.id/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  nogosaren.id
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3 - Sosial Media & Alamat */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex gap-4 mb-6">
              <a 
                href="https://www.instagram.com/desanogosaren?igsh=MWF2MnV4MmhzbWV5OA==" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Desa Nogosaren, Kecamatan Getasan, Kabupaten Semarang, Jawa Tengah
            </p>
          </div>

        </div>

        {/* Garis pemisah */}
        <div className="my-8 border-t border-gray-700"></div>

        {/* Copyright */}
        <div className="text-sm text-gray-400 text-center">
          <p>&copy; {new Date().getFullYear()} GO-SMILE Commerce, Marketplace Desa Nogosaren. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;