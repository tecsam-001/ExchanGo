import React from 'react';

const Loader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative mb-6 w-16 h-16">
          <div className="animate-spin w-full h-full">
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45 * (Math.PI / 180);
              const radius = 28;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <div
                  key={i}
                  className={`absolute w-2.5 h-2.5 rounded-full ${i < 3 ? "bg-[#C0ED81]" : "bg-[#C0ED81]"
                    }`}
                  style={{
                    left: `${32 + x - 5}px`,
                    top: `${32 + y - 5}px`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader; 