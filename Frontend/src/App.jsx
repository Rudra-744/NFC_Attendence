import React, { useState } from "react";

function App() {
  const [status, setStatus] = useState("📲 Tap 'Start Scan' and then your NFC tag");
  const [lastScanned, setLastScanned] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [buttonPressed, setButtonPressed] = useState('');

  const handleButtonPress = (buttonName) => {
    setButtonPressed(buttonName);
    setTimeout(() => setButtonPressed(''), 150);
  };

  const startScan = async () => {
    handleButtonPress('scan');
    
    if (!("NDEFReader" in window)) {
      setStatus("❌ Web NFC not supported on this browser");
      return;
    }

    setIsScanning(true);

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setStatus("📡 Scanning for NFC tag...");

      ndef.onreading = (event) => {
        const data = new TextDecoder().decode(event.message.records[0].data);
        const [id, name] = data.split(";");

        fetch("https://nfc-reader.onrender.com/api/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name }),
        })
          .then((res) => res.json())
          .then((data) => {
            setStatus(data.message); // ✅ Ab yaha pe "already marked" bhi show hoga
            setLastScanned({ id, name, time: new Date().toLocaleTimeString() });
            setIsScanning(false);
            setShowFlash(true);
            setShowActions(true);
            setTimeout(() => setShowFlash(false), 3000);
          })
        
          .catch(() => {
            setStatus("❌ Failed to mark attendance");
            setIsScanning(false);
          });
      };
    } catch (err) {
      console.error("NFC Error:", err);
      setStatus("❌ NFC permission denied or device issue");
      setIsScanning(false);
    }
  };

  const downloadExcel = () => {
    handleButtonPress('download');
    window.open("https://nfc-reader.onrender.com/api/download", "_blank");
  };

  const viewAttendance = async () => {
    handleButtonPress('view');
    try {
      const res = await fetch("https://nfc-reader.onrender.com/api/view");
      const data = await res.json();
      setAttendanceList(data.reverse());
    } catch {
      alert("❌ Failed to fetch attendance list");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-6 transition-colors duration-300">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        
        {/* Header with subtle hover effect */}
        <h1 className="text-3xl font-bold text-blue-600 mb-4 transition-all duration-300 hover:text-blue-700 hover:scale-105 cursor-default select-none">
          📲 NFC Attendance System
        </h1>

        <button
          onClick={startScan}
          disabled={isScanning}
          className={`
            relative overflow-hidden font-bold py-3 px-6 rounded-lg mb-4 
            transition-all duration-200 ease-out transform active:scale-95
            ${isScanning 
              ? 'bg-yellow-500 text-white cursor-not-allowed animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 hover:shadow-lg'
            }
            ${buttonPressed === 'scan' ? 'scale-95' : ''}
          `}
        >
          <span className="relative z-10">
            {isScanning ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="animate-spin">🔄</span>
                <span>Scanning...</span>
              </span>
            ) : (
              '🚀 Start Scan'
            )}
          </span>
          
          {isScanning && (
            <>
              <div className="absolute inset-0 bg-yellow-400 rounded-lg animate-ping opacity-25"></div>
              <div className="absolute inset-0 bg-yellow-400 rounded-lg animate-ping opacity-20" style={{animationDelay: '0.5s'}}></div>
            </>
          )}
        </button>

        {showFlash && lastScanned && (
          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg mb-4 transform transition-all duration-500 animate-bounce-in">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg animate-bounce">🎉</span>
              <div>
                <span className="font-semibold">Attendance marked for </span>
                <strong className="text-blue-900">{lastScanned.name}</strong>
                <span> (ID: {lastScanned.id})</span>
              </div>
              <span className="text-lg animate-bounce" style={{animationDelay: '0.2s'}}>🎉</span>
            </div>
          </div>
        )}

        <p className="text-gray-700 text-lg mb-2 transition-all duration-300 min-h-[28px]">
          {status}
        </p>

        {lastScanned && (
          <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-xl transform transition-all duration-500 hover:shadow-md hover:bg-green-100 animate-slide-up">
            <p className="text-green-700 font-semibold flex items-center justify-center space-x-2 mb-2">
              <span className="animate-pulse">✅</span>
              <span>Last Entry</span>
            </p>
            <div className="space-y-1">
              <p className="text-gray-800 transition-colors duration-200 hover:text-gray-900">
                <strong>Name:</strong> {lastScanned.name}
              </p>
              <p className="text-gray-800 transition-colors duration-200 hover:text-gray-900">
                <strong>ID:</strong> {lastScanned.id}
              </p>
              <p className="text-gray-600 text-sm transition-colors duration-200 hover:text-gray-700">
                <strong>Time:</strong> {lastScanned.time}
              </p>
            </div>
          </div>
        )}

        {showActions && (
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={downloadExcel}
              className={`
                bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg
                transform transition-all duration-200 ease-out
                hover:scale-105 hover:shadow-lg active:scale-95
                animate-slide-in-left
                ${buttonPressed === 'download' ? 'scale-95' : ''}
              `}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>📥</span>
                <span>Download Excel File</span>
              </span>
            </button>

            <button
              onClick={viewAttendance}
              className={`
                bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg
                transform transition-all duration-200 ease-out
                hover:scale-105 hover:shadow-lg active:scale-95
                animate-slide-in-right
                ${buttonPressed === 'view' ? 'scale-95' : ''}
              `}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>📄</span>
                <span>View All Attendance</span>
              </span>
            </button>
          </div>
        )}

        {attendanceList.length > 0 && (
          <div className="mt-6 text-left w-full overflow-auto max-h-64 border-t pt-4 animate-fade-in">
            <h2 className="text-lg font-semibold mb-2 text-center transition-colors duration-300 hover:text-gray-800">
              🗒️ Attendance Records
            </h2>
            <ul className="text-sm text-gray-800 space-y-2">
              {attendanceList.map((entry, i) => (
                <li 
                  key={i} 
                  className="border-b pb-2 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm rounded px-2 py-1 transform hover:scale-102 animate-list-item"
                  style={{animationDelay: `${i * 100}ms`}}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 transition-transform duration-200 hover:scale-110">👤</span>
                    <div>
                      <strong className="transition-colors duration-200 hover:text-blue-600">
                        {entry.name}
                      </strong>
                      <span className="text-gray-600"> ({entry.id})</span>
                      <div className="text-xs text-gray-500">
                        {entry.date} @ {entry.time}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-400 transition-all duration-300 hover:text-gray-600">
        💡 Make sure NFC is enabled and you're using Chrome for Android 89+ over HTTPS.
      </p>
    </div>
  );
}

export default App;
