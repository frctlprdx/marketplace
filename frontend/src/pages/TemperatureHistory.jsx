import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { dbFirestore } from "../firebase/FirebaseConfig";

export default function TemperatureHistory() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log("Starting to fetch data...");
        console.log("Firebase config:", dbFirestore.app.name);
        console.log("Project ID:", dbFirestore.app.options.projectId);
        
        const result = [];
        
        // Test connection first with a simple query
        console.log("Testing Firestore connection...");
        
        // Try different collection names (case-sensitive issue)
        const possibleCollectionNames = ["sensorData", "SensorData", "sensor_data"];
        let workingCollectionRef = null;
        let workingCollectionName = null;
        
        for (const collectionName of possibleCollectionNames) {
          try {
            console.log(`Trying collection: ${collectionName}`);
            const testRef = collection(dbFirestore, collectionName);
            const testSnapshot = await getDocs(testRef);
            
            console.log(`Collection ${collectionName}:`, {
              empty: testSnapshot.empty,
              size: testSnapshot.size
            });
            
            if (!testSnapshot.empty) {
              workingCollectionRef = testRef;
              workingCollectionName = collectionName;
              console.log(`✅ Found working collection: ${collectionName}`);
              break;
            }
          } catch (testError) {
            console.log(`❌ Error testing collection ${collectionName}:`, testError);
          }
        }
        
        if (!workingCollectionRef) {
          console.log("❌ No working collection found");
          setError("Tidak ditemukan collection yang dapat diakses. Coba periksa nama collection: sensorData, SensorData, atau sensor_data");
          return;
        }
        
        // Fetch all date documents from the working collection
        console.log(`Using collection: ${workingCollectionName}`);
        const datesSnapshot = await getDocs(workingCollectionRef);
        
        console.log("Date documents found:");
        console.log("- Empty:", datesSnapshot.empty);
        console.log("- Size:", datesSnapshot.size);
        
        // Debug: log all date documents found
        datesSnapshot.docs.forEach((doc, index) => {
          console.log(`Date Document ${index}:`, {
            id: doc.id,
            exists: doc.exists(),
            data: doc.data()
          });
        });
        
        if (datesSnapshot.empty) {
          console.log("❌ No date documents found");
          setError(`Collection '${workingCollectionName}' ditemukan tapi kosong. Pastikan ada document dengan format tanggal (misal: 2025-09-01)`);
          return;
        }
        
        console.log("✅ Found", datesSnapshot.docs.length, "date documents");

        // Process each date document
        for (const dateDoc of datesSnapshot.docs) {
          const dateId = dateDoc.id;
          console.log(`\n📅 Processing date: ${dateId}`);
          
          try {
            // Check if this date document has an 'entries' subcollection
            const entriesRef = collection(dbFirestore, workingCollectionName, dateId, "entries");
            console.log(`Fetching entries for ${dateId}...`);
            
            const entriesSnapshot = await getDocs(entriesRef);
            
            console.log(`📊 Found ${entriesSnapshot.docs.length} entries for ${dateId}`);
            
            if (entriesSnapshot.empty) {
              console.log(`⚠️  No entries found for date ${dateId}`);
              continue;
            }
            
            // Process each entry document
            entriesSnapshot.docs.forEach((entryDoc, index) => {
              const data = entryDoc.data();
              console.log(`Entry ${index + 1} (${entryDoc.id}):`, data);
              
              // Validate required fields
              if (typeof data.suhu === 'undefined' || typeof data.kelembapan === 'undefined') {
                console.log(`⚠️  Entry ${entryDoc.id} missing required fields:`, {
                  hasSuhu: typeof data.suhu !== 'undefined',
                  hasKelembapan: typeof data.kelembapan !== 'undefined',
                  hasHeater: typeof data.heater !== 'undefined',
                  hasTimestamp: typeof data.timestamp !== 'undefined'
                });
              }
              
              // Parse timestamp with better error handling
              let timeFormatted = "N/A";
              let dateFormatted = dateId;
              
              if (data.timestamp) {
                try {
                  let date;
                  
                  if (typeof data.timestamp === 'string') {
                    // Handle string timestamps like "2025-09-01T21:33:27"
                    date = new Date(data.timestamp);
                    if (!isNaN(date.getTime())) {
                      dateFormatted = date.toLocaleDateString('id-ID');
                      timeFormatted = date.toLocaleTimeString('id-ID');
                    } else {
                      console.warn(`Invalid string timestamp: ${data.timestamp}`);
                      timeFormatted = String(data.timestamp);
                    }
                  } else if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                    // Handle Firestore Timestamps
                    date = data.timestamp.toDate();
                    dateFormatted = date.toLocaleDateString('id-ID');
                    timeFormatted = date.toLocaleTimeString('id-ID');
                  } else if (data.timestamp && data.timestamp.seconds) {
                    // Handle Firestore Timestamp object format
                    date = new Date(data.timestamp.seconds * 1000);
                    dateFormatted = date.toLocaleDateString('id-ID');
                    timeFormatted = date.toLocaleTimeString('id-ID');
                  } else {
                    console.warn(`Unknown timestamp format:`, data.timestamp);
                    timeFormatted = String(data.timestamp);
                  }
                } catch (timeError) {
                  console.warn("Error parsing timestamp:", timeError);
                  timeFormatted = String(data.timestamp);
                }
              }
              
              // Add data to result with better data validation
              const entry = {
                id: entryDoc.id,
                date: dateFormatted,
                time: timeFormatted,
                suhu: Number(data.suhu) || 0,
                kelembapan: Number(data.kelembapan) || 0,
                heater: data.heater || "N/A",
                rawTimestamp: data.timestamp,
                sortDate: dateId,
                // Debug info
                originalData: data
              };
              
              result.push(entry);
              console.log(`✅ Added entry:`, entry);
            });
            
          } catch (entryError) {
            console.error(`❌ Error fetching entries for ${dateId}:`, entryError);
            // Continue with other dates even if one fails
          }
        }

        console.log(`\n📈 Total entries processed: ${result.length}`);

        // Sort data (newest first)
        if (result.length > 0) {
          result.sort((a, b) => {
            // Sort by date first (newest first)
            if (a.sortDate !== b.sortDate) {
              return a.sortDate > b.sortDate ? -1 : 1;
            }
            // Then by raw timestamp (newest first)
            if (a.rawTimestamp && b.rawTimestamp) {
              const timeA = typeof a.rawTimestamp === 'string' ? new Date(a.rawTimestamp) : a.rawTimestamp;
              const timeB = typeof b.rawTimestamp === 'string' ? new Date(b.rawTimestamp) : b.rawTimestamp;
              return timeB - timeA;
            }
            return 0;
          });
        }

        console.log("✅ Final result:", result);
        setTableData(result);
        
        if (result.length === 0) {
          setError(`Data structure ditemukan di collection '${workingCollectionName}' tetapi tidak ada entries yang valid. Pastikan setiap date document memiliki subcollection 'entries' dengan data yang lengkap.`);
        }
        
      } catch (err) {
        console.error("❌ Error fetching data: ", err);
        console.error("Error details:", {
          code: err.code,
          message: err.message,
          stack: err.stack
        });
        
        // Provide more specific error messages
        if (err.code === 'permission-denied') {
          setError("Akses ditolak. Security Rules mungkin belum ter-deploy atau salah konfigurasi. Coba deploy ulang rules atau tunggu beberapa menit.");
        } else if (err.code === 'not-found') {
          setError("Collection tidak ditemukan. Pastikan nama collection benar dan sudah ada data.");
        } else if (err.code === 'failed-precondition') {
          setError("Firestore belum diaktifkan atau masih dalam proses setup. Cek Firebase Console → Firestore Database.");
        } else if (err.code === 'unavailable') {
          setError("Firestore tidak tersedia saat ini. Cek koneksi internet atau coba lagi nanti.");
        } else {
          setError(`Error: ${err.message} (Code: ${err.code || 'unknown'})`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <h1 className="text-xl font-bold mb-4">Temperature History</h1>
          <p className="text-blue-600">Loading data from Firestore...</p>
          <p className="text-sm text-gray-500 mt-2">
            Testing collections: sensorData, SensorData, sensor_data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Temperature History</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
        
        {/* Enhanced troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="font-bold">Langkah Troubleshooting (Update):</p>
          <ol className="text-sm mt-2 list-decimal list-inside space-y-2">
            <li><strong>Cek Console Browser:</strong> Buka Developer Tools → Console untuk melihat log detail</li>
            <li><strong>Verifikasi nama collection:</strong> Pastikan nama exact di Firestore (case-sensitive)</li>
            <li><strong>Deploy Security Rules:</strong> 
              <div className="ml-4 mt-1">
                <code className="bg-gray-200 px-1 rounded text-xs">firebase deploy --only firestore:rules</code>
              </div>
            </li>
            <li><strong>Tunggu propagation:</strong> Rules Firebase butuh 1-2 menit untuk aktif</li>
            <li><strong>Test manual query:</strong> Coba query sederhana di Firebase console</li>
          </ol>
        </div>
        
        {/* Connection test button */}
        <div className="mb-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            🔄 Coba Lagi
          </button>
          <button 
            onClick={() => {
              console.clear();
              window.location.reload();
            }} 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🧹 Clear Console & Reload
          </button>
        </div>
        
        {/* Current Firebase Security Rules */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
          <p className="font-bold">Current Firebase Security Rules (sudah benar):</p>
          <pre className="text-sm mt-2 bg-blue-100 p-2 rounded overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
          </pre>
          <p className="text-xs mt-2 text-blue-600">
            ℹ️ Rules ini sudah benar. Jika masih error, coba deploy ulang dengan command di atas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Temperature History</h1>
      
      {tableData.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">Tidak ada data yang ditemukan</p>
          <p className="text-sm mt-1">
            Collection ditemukan tapi tidak ada entries. Pastikan struktur: 
            <br />
            <code className="bg-yellow-200 px-1 rounded text-xs">
              sensorData → [2025-09-01] → entries → [docId] → &#123;suhu, kelembapan, heater, timestamp&#125;
            </code>
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              ✅ Menampilkan {tableData.length} data sensor
            </p>
            <div className="space-x-2">
              <button 
                onClick={() => console.log("Current data:", tableData)} 
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                📋 Debug Data
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="border-b px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suhu (°C)
                  </th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelembapan (%)
                  </th>
                  <th className="border-b px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heater Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {row.time}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                        row.suhu > 30 ? 'bg-red-100 text-red-800' :
                        row.suhu > 20 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {row.suhu}°C
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                        row.kelembapan > 70 ? 'bg-blue-100 text-blue-800' :
                        row.kelembapan > 40 ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {row.kelembapan}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                        row.heater === 'ON' ? 'bg-red-100 text-red-800' : 
                        row.heater === 'OFF' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.heater}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}