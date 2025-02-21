'use client';

export default function TopBar() {
  return (
    <div className="bg-black text-white text-sm py-3">
      <div className="container mx-auto">
        <div className="flex justify-center items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span>Akcija ističe za:</span>
            <div className="flex items-center space-x-1">
              <span className="bg-yellow-400 text-black px-2 py-1 rounded">00</span>
              <span>Dana</span>
              <span className="bg-yellow-400 text-black px-2 py-1 rounded">00</span>
              <span>Sati</span>
              <span className="bg-yellow-400 text-black px-2 py-1 rounded">00</span>
              <span>Min</span>
              <span className="bg-yellow-400 text-black px-2 py-1 rounded">00</span>
              <span>Sek</span>
            </div>
          </div>
          <span className="bg-red-500 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider">
            Specijalna ponuda
          </span>
        </div>
      </div>
    </div>
  );
}