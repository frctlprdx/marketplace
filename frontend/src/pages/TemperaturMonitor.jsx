import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { dbRealtime } from "../firebase/FirebaseConfig";

export default function TemperatureMonitor() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [heater, setHeater] = useState(null);
  const [manualRelay, setManualRelay] = useState("AUTO");

  useEffect(() => {
    // ambil suhu
    const tempRef = ref(dbRealtime, "sensor/suhu");
    const unsubscribeTemp = onValue(tempRef, (snapshot) => {
      setTemperature(snapshot.val());
    });

    // ambil kelembapan
    const humRef = ref(dbRealtime, "sensor/kelembapan");
    const unsubscribeHum = onValue(humRef, (snapshot) => {
      setHumidity(snapshot.val());
    });

    // ambil heater
    const heaterRef = ref(dbRealtime, "sensor/heater");
    const unsubscribeHeater = onValue(heaterRef, (snapshot) => {
      setHeater(snapshot.val());
    });

    // ambil mode manualRelay
    const relayRef = ref(dbRealtime, "command/manualRelay");
    const unsubscribeRelay = onValue(relayRef, (snapshot) => {
      setManualRelay(snapshot.val());
    });

    return () => {
      unsubscribeTemp();
      unsubscribeHum();
      unsubscribeHeater();
      unsubscribeRelay();
    };
  }, []);

  // Fungsi kirim perintah ke RTDB
  const sendCommand = async (command) => {
    await set(ref(dbRealtime, "command/manualRelay"), command);
  };

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
        </div>
      </div>

      {/* Kontrol Tombol */}
      <div className="mt-10 flex flex-col items-center space-y-4">
        <h2 className="text-lg font-bold text-gray-700 mb-2">Kontrol Manual</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => sendCommand("ON")}
            className={`px-6 py-2 rounded-full shadow-md font-semibold transition ${
              manualRelay === "ON"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-green-300"
            }`}
          >
            ON
          </button>
          <button
            onClick={() => sendCommand("OFF")}
            className={`px-6 py-2 rounded-full shadow-md font-semibold transition ${
              manualRelay === "OFF"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-red-300"
            }`}
          >
            OFF
          </button>
          <button
            onClick={() => sendCommand("AUTO")}
            className={`px-6 py-2 rounded-full shadow-md font-semibold transition ${
              manualRelay === "AUTO"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-300"
            }`}
          >
            AUTO
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Mode saat ini: <span className="font-bold">{manualRelay}</span>
        </p>
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
