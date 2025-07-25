import React, { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("📲 Tap your NFC tag to mark attendance");
  const [lastScanned, setLastScanned] = useState(null);

  useEffect(() => {
    if (!("NDEFReader" in window)) {
      setStatus("❌ Web NFC not supported on this browser");
      return;
    }

    const reader = new window.NDEFReader();

    reader
      .scan()
      .then(() => {
        setStatus("📡 Scanning for NFC tag...");
        reader.onreading = (event) => {
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
      })
      .catch((err) => {
        console.error("NFC Error:", err);
        setStatus("❌ NFC permission denied or device issue");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          📲 NFC Attendance System
        </h1>
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
        Make sure NFC is enabled and you’re using Android Chrome browser.
      </p>
    </div>
  );
}

export default App;
