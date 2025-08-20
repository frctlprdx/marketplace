import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/FirebaseConfig";

export default function TemperatureMonitor() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [heater, setHeater] = useState(null);

  useEffect(() => {
    // ambil suhu
    const tempRef = ref(db, "sensor/suhu");
    const unsubscribeTemp = onValue(tempRef, (snapshot) => {
      setTemperature(snapshot.val());
    });

    // ambil kelembapan
    const humRef = ref(db, "sensor/kelembapan");
    const unsubscribeHum = onValue(humRef, (snapshot) => {
      setHumidity(snapshot.val());
    });

    // ambil heater
    const heaterRef = ref(db, "sensor/heater");
    const unsubscribeHeater = onValue(heaterRef, (snapshot) => {
      setHeater(snapshot.val());
    });

    return () => {
      unsubscribeTemp();
      unsubscribeHum();
      unsubscribeHeater();
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Temperature Monitor
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-[#507969] to-[#9fb5ad] rounded-full mx-auto"></div>
      </div>

      {/* Desktop Layout - 3 circles side by side */}
      <div className="hidden lg:flex justify-center items-center space-x-12">
        {/* Temperature Circle */}
        <div className="relative group">
          <div className="w-48 h-48 bg-gradient-to-br from-[#507969] to-[#00a867] rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <div className="text-4xl mb-2">🌡️</div>
              <div className="text-2xl font-bold text-gray-800">
                {temperature !== null ? `${temperature}°C` : "Loading..."}
              </div>
              <div className="text-sm font-semibold text-[#507969] mt-1">
                Suhu
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        {/* Humidity Circle */}
        <div className="relative group">
          <div className="w-48 h-48 bg-gradient-to-br from-[#507969] to-[#00a867] rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <div className="text-4xl mb-2">💧</div>
              <div className="text-2xl font-bold text-gray-800">
                {humidity !== null ? `${humidity}%` : "Loading..."}
              </div>
              <div className="text-sm font-semibold text-[#507969] mt-1">
                Kelembapan
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        {/* Heater Circle */}
        <div className="relative group">
          <div className="w-48 h-48 bg-gradient-to-br from-[#507969] to-[#00a867] rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-gray-800">
                {heater !== null ? heater : "Loading..."}
              </div>
              <div className="text-sm font-semibold text-[#507969] mt-1">
                Heater
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Mobile/Tablet Layout - 3 circles vertical */}
      <div className="lg:hidden flex flex-col items-center space-y-8">
        {/* Temperature Circle */}
        <div className="relative group">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-[#507969] to-[#00a867] rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <div className="text-3xl sm:text-4xl mb-2">🌡️</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {temperature !== null ? `${temperature}°C` : "Loading..."}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#507969] mt-1">
                Suhu
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        {/* Humidity Circle */}
        <div className="relative group">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-[#507969] to-[#00a867] rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <div className="text-3xl sm:text-4xl mb-2">💧</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {humidity !== null ? `${humidity}%` : "Loading..."}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#507969] mt-1">
                Kelembapan
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        {/* Heater Circle */}
        <div className="relative group">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-[#507969] to-[#00a867] rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <div className="text-3xl sm:text-4xl mb-2">🔥</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {heater !== null ? heater : "Loading..."}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#507969] mt-1">
                Heater
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-8 sm:mt-12 text-center">
        <span className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md text-sm text-gray-600 border border-gray-100">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Status: Connected
        </span>
      </div>
    </div>
  );
}