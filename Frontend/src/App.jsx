import React, { useState } from "react";

function App() {
  const [status, setStatus] = useState("📲 Tap 'Start Scan' and then your NFC tag");
  const [lastScanned, setLastScanned] = useState(null);

  const startScan = async () => {
    if (!("NDEFReader" in window)) {
      setStatus("❌ Web NFC not supported on this browser");
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setStatus("📡 Scanning for NFC tag...");

      ndef.onreading = (event) => {
        const data = new TextDecoder().decode(event.message.records[0].data);
        const [id, name] = data.split(";");

        fetch("https://nfc-reader.onrender.com/api/mark", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, name }),
        })
          .then((res) => res.json())
          .then((data) => {
            setStatus(data.message);
            setLastScanned({ id, name, time: new Date().toLocaleTimeString() });
          })
          .catch(() => setStatus("❌ Failed to mark attendance"));
      };
    } catch (err) {
      console.error("NFC Error:", err);
      setStatus("❌ NFC permission denied or device issue");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          📲 NFC Attendance System
        </h1>

        <button
          onClick={startScan}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Start Scan
        </button>

        <p className="text-gray-700 text-lg mb-2">{status}</p>

        {lastScanned && (
          <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-xl">
            <p className="text-green-700 font-semibold">✅ Last Entry</p>
            <p className="text-gray-800">Name: {lastScanned.name}</p>
            <p className="text-gray-800">ID: {lastScanned.id}</p>
            <p className="text-gray-600 text-sm">Time: {lastScanned.time}</p>
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Make sure NFC is enabled and you’re using Chrome for Android 89+ over HTTPS.
      </p>
    </div>
  );
}

export default App;
