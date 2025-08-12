import Marquee from "react-fast-marquee";

const partnerLogos = [
  "/logo1.png",
  "/logo2.png",
  "/logo3.png",
  "/logo4.png",
  "/logo5.png",
  "/logo6.png",
  // tambahkan sesuai kebutuhan
];

const Partner = () => {
  // Hitung kecepatan otomatis
  const speed = Math.max(20, 100 - partnerLogos.length * 10);

  return (
    <div className="flex flex-col items-center py-10 max-w-7xl mx-auto">
      <div className="w-full text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Partner Kami</h1>
      </div>

      <Marquee
        pauseOnHover
        speed={speed}
        gradient={false}
        className="w-full"
      >
        {[...partnerLogos, ...partnerLogos].map((logo, index) => (
          <div key={index} className="mx-4 flex-shrink-0">
            <img
              src={logo}
              alt={`Partner ${index + 1}`}
              className="h-12 sm:h-16 object-contain"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Partner;
