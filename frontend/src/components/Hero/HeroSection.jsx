import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const HeroSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const controls = useAnimation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Gunakan path langsung tanpa import
  const images = [
    "/assets/DSC06159.jpg",
    "/assets/IMG_0341.jpg",
    "/assets/IMG_5316.jpg"
  ];

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/product");
  };

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [inView, controls]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Ganti gambar setiap 5 detik

    return () => clearInterval(interval);
  }, []);

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const imageVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Animation */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentImageIndex}
          initial="enter"
          animate="center"
          exit="exit"
          variants={imageVariants}
          className="absolute inset-0 w-full h-full"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${images[currentImageIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Dark Overlay - Static untuk menjaga text tetap terbaca */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Content */}
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className="relative z-10 sm:mx-0 mx-20 px-4 w-screen py-4 text-center"
      >
        <h1 className="text-white text-center text-3xl sm:text-4xl font-bold mb-4 drop-shadow-lg">
          Selamat Datang !
        </h1>
        <p className="text-white text-lg drop-shadow-md">
          GO-SMILE Commerce adalah Platform untuk menjual produk Susu Segar Desa Nogosaren
        </p>
        <div className="mt-6 flex justify-center">
          <button
            className="bg-button text-white px-15 sm:px-30 py-3 rounded-full text-lg font-semibold transition duration-300 cursor-pointer hover:scale-105 hover:shadow-xl"
            onClick={handleClick}
          >
            See Products
          </button>
        </div>
      </motion.div>

      {/* Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;