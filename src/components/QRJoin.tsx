import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRJoin() {
  const [showQR, setShowQR] = useState(false);
  const url = window.location.origin;

  if (showQR) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8" onClick={() => setShowQR(false)}>
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Scan to Join!</h2>
          <div className="bg-white p-4">
            <QRCodeSVG value={url} size={300} level="H" />
          </div>
          <p className="text-center text-gray-600 mt-4">
            {url}
          </p>
          <button
            onClick={() => setShowQR(false)}
            className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowQR(true)}
      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
      aria-label="Show QR code to join"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zM15 15h2v2h-2v-2zM13 17h2v2h-2v-2zM17 13h2v2h-2v-2zM19 15h2v2h-2v-2zM17 17h2v2h-2v-2zM19 19h2v2h-2v-2z"/>
      </svg>
      <span className="font-medium">Show QR Code</span>
    </button>
  );
}
