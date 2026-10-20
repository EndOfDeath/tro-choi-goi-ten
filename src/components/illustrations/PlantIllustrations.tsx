import React from 'react';

interface PlantProps {
  type?: number;
  stage?: 'idle' | 'watered' | 'bloomed';
  name?: string;
  code?: string;
  className?: string;
  size?: number;
  isWinner?: boolean;
}

export const PLANT_TYPES = [
  'Sen đá ngọc',
  'Monstera lá xẻ',
  'Bonsai Nông Lâm',
  'Hướng dương rực rỡ',
  'Mầm xanh tri thức',
  'Cẩm tú cầu tím biếc',
];

export const PlantIllustration: React.FC<PlantProps> = ({
  type = 0,
  stage = 'idle',
  name,
  code,
  className = '',
  size = 110,
  isWinner = false,
}) => {
  const index = Math.abs(type) % 6;
  const isBloomed = stage === 'bloomed';
  const isWatered = stage === 'watered';

  const renderFoliage = () => {
    switch (index) {
      case 0:
        // Succulent
        return (
          <g className={`transition-all duration-700 origin-bottom ${isBloomed ? 'scale-125' : isWatered ? 'scale-105' : ''}`}>
            {/* Outer leaves */}
            <path d="M50,60 C30,60 25,48 35,40 C42,48 48,56 50,60" fill="#34D399" stroke="#059669" strokeWidth="1.2" />
            <path d="M50,60 C70,60 75,48 65,40 C58,48 52,56 50,60" fill="#34D399" stroke="#059669" strokeWidth="1.2" />
            <path d="M50,60 C40,45 35,30 50,26 C54,34 52,48 50,60" fill="#10B981" stroke="#047857" strokeWidth="1.2" />
            <path d="M50,60 C60,45 65,30 50,26 C46,34 48,48 50,60" fill="#10B981" stroke="#047857" strokeWidth="1.2" />
            {/* Center bloom if bloomed */}
            {isBloomed && (
              <g className="animate-pulse">
                <circle cx="50" cy="20" r="10" fill="#F43F5E" />
                <circle cx="50" cy="20" r="6" fill="#FDE047" />
                <circle cx="43" cy="18" r="4" fill="#FB7185" />
                <circle cx="57" cy="18" r="4" fill="#FB7185" />
                <circle cx="50" cy="12" r="4" fill="#FB7185" />
                {/* Glow ring */}
                <circle cx="50" cy="20" r="16" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 3" />
              </g>
            )}
          </g>
        );
      case 1:
        // Monstera
        return (
          <g className={`transition-all duration-700 origin-bottom ${isBloomed ? 'scale-130 -translate-y-2' : isWatered ? 'scale-105' : ''}`}>
            {/* Stems */}
            <path d="M50,62 Q45,45 34,36" stroke="#166534" strokeWidth="3" fill="none" />
            <path d="M50,62 Q55,40 66,32" stroke="#166534" strokeWidth="3" fill="none" />
            <path d="M50,62 Q50,35 50,22" stroke="#166534" strokeWidth="3" fill="none" />
            {/* Left Leaf with cuts */}
            <path d="M34,36 C20,30 20,18 34,16 C38,24 38,30 34,36" fill="#15803D" stroke="#14532D" strokeWidth="1.2" />
            {/* Right Leaf */}
            <path d="M66,32 C80,26 80,14 66,12 C62,20 62,26 66,32" fill="#22C55E" stroke="#14532D" strokeWidth="1.2" />
            {/* Center top leaf / flower */}
            <path d="M50,22 C36,12 64,12 50,22" fill="#16A34A" />
            {isBloomed && (
              <g className="animate-bounce">
                <circle cx="50" cy="14" r="12" fill="#E11D48" />
                <circle cx="50" cy="14" r="5" fill="#FEF08A" />
                <path d="M42,6 Q50,0 58,6" stroke="#FBBF24" strokeWidth="2" fill="none" />
              </g>
            )}
          </g>
        );
      case 2:
        // Bonsai Tree
        return (
          <g className={`transition-all duration-700 origin-bottom ${isBloomed ? 'scale-120' : isWatered ? 'scale-105' : ''}`}>
            {/* Twisted Trunk */}
            <path d="M50,64 Q42,50 56,42 Q60,34 46,26" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Branch clouds */}
            <ellipse cx="36" cy="38" rx="14" ry="9" fill="#166534" />
            <ellipse cx="62" cy="34" rx="16" ry="10" fill="#15803D" />
            <ellipse cx="46" cy="22" rx="18" ry="11" fill="#22C55E" />
            {isBloomed && (
              <g>
                <circle cx="46" cy="14" r="6" fill="#EC4899" />
                <circle cx="34" cy="32" r="5" fill="#F472B6" />
                <circle cx="64" cy="28" r="5" fill="#F472B6" />
                <circle cx="52" cy="20" r="4" fill="#FBCFE8" />
              </g>
            )}
          </g>
        );
      case 3:
        // Sunflower
        return (
          <g className={`transition-all duration-700 origin-bottom ${isBloomed ? 'scale-135 -translate-y-3' : isWatered ? 'scale-105' : ''}`}>
            {/* Tall stem */}
            <line x1="50" y1="62" x2="50" y2="30" stroke="#15803D" strokeWidth="4" />
            {/* Leaves */}
            <path d="M50,48 Q35,45 36,40 Q45,44 50,48" fill="#22C55E" stroke="#166534" strokeWidth="1" />
            <path d="M50,42 Q65,39 64,34 Q55,38 50,42" fill="#22C55E" stroke="#166534" strokeWidth="1" />
            {/* Flower bud or giant sunflower */}
            {isBloomed ? (
              <g>
                {/* Golden Petals */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                  <ellipse
                    key={deg}
                    cx="50"
                    cy="25"
                    rx="4"
                    ry="13"
                    fill="#FBBF24"
                    stroke="#D97706"
                    strokeWidth="1"
                    transform={`rotate(${deg} 50 25)`}
                  />
                ))}
                <circle cx="50" cy="25" r="9" fill="#78350F" />
                <circle cx="50" cy="25" r="7" fill="#451A03" />
                <circle cx="48" cy="23" r="1.5" fill="#FDE68A" />
              </g>
            ) : (
              <circle cx="50" cy="28" r="8" fill="#15803D" stroke="#14532D" strokeWidth="1.5" />
            )}
          </g>
        );
      case 4:
        // Golden Sprout
        return (
          <g className={`transition-all duration-700 origin-bottom ${isBloomed ? 'scale-130' : isWatered ? 'scale-105' : ''}`}>
            {/* Stem */}
            <path d="M50,62 Q48,46 50,30" stroke="#16A34A" strokeWidth="3.5" fill="none" />
            {/* Sprout dual leaves */}
            <path d="M50,36 C34,36 34,22 50,22 C48,28 48,34 50,36" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
            <path d="M50,36 C66,36 66,22 50,22 C52,28 52,34 50,36" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
            {isBloomed && (
              <g className="animate-spin" style={{ animationDuration: '6s' }}>
                <polygon points="50,6 54,18 66,18 56,24 60,36 50,28 40,36 44,24 34,18 46,18" fill="#FACC15" stroke="#EAB308" strokeWidth="1" />
                <circle cx="50" cy="22" r="4" fill="#FEF08A" />
              </g>
            )}
          </g>
        );
      default:
        // Hydrangea (Cẩm tú cầu)
        return (
          <g className={`transition-all duration-700 origin-bottom ${isBloomed ? 'scale-125' : isWatered ? 'scale-105' : ''}`}>
            {/* Stem */}
            <line x1="50" y1="62" x2="50" y2="38" stroke="#15803D" strokeWidth="3.5" />
            <path d="M50,52 Q36,52 38,44 Q46,48 50,52" fill="#22C55E" stroke="#166534" strokeWidth="1" />
            <path d="M50,48 Q64,48 62,40 Q54,44 50,48" fill="#22C55E" stroke="#166534" strokeWidth="1" />
            {/* Flower ball */}
            <g>
              <circle cx="44" cy="30" r="8" fill={isBloomed ? '#818CF8' : '#34D399'} />
              <circle cx="56" cy="30" r="8" fill={isBloomed ? '#A78BFA' : '#10B981'} />
              <circle cx="50" cy="22" r="9" fill={isBloomed ? '#C084FC' : '#059669'} />
              <circle cx="42" cy="22" r="7" fill={isBloomed ? '#60A5FA' : '#10B981'} />
              <circle cx="58" cy="22" r="7" fill={isBloomed ? '#E879F9' : '#047857'} />
              {isBloomed && (
                <circle cx="50" cy="24" r="3" fill="#FFF" />
              )}
            </g>
          </g>
        );
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-end ${
        isWinner ? 'scale-110 z-20 transition-transform duration-500' : ''
      } ${className}`}
    >
      {/* Floating water drops if in watered state */}
      {isWatered && (
        <div className="absolute -top-3 flex gap-2 animate-bounce pointer-events-none">
          <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full opacity-80 shadow-xs" />
          <span className="w-2 h-2 bg-blue-400 rounded-full opacity-90 delay-100 shadow-xs" />
        </div>
      )}

      {/* Radiant glow for bloomed winner */}
      {isBloomed && (
        <div className="absolute -inset-4 bg-radial from-amber-300/40 via-emerald-200/20 to-transparent rounded-full animate-pulse -z-10 pointer-events-none" />
      )}

      {/* Plant SVG */}
      <svg width={size} height={size * 0.9} viewBox="0 0 100 90" className="overflow-visible">
        {/* Soft shadow */}
        <ellipse cx="50" cy="84" rx="28" ry="6" fill="rgba(0,0,0,0.14)" />

        {/* Foliage */}
        {renderFoliage()}

        {/* Pot */}
        <g>
          {/* Pot Rim */}
          <rect x="28" y="60" width="44" height="6" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="1.2" />
          {/* Pot Body */}
          <polygon points="32,66 68,66 63,82 37,82" fill="#B45309" stroke="#78350F" strokeWidth="1.2" />
          {/* Pot decorative band */}
          <line x1="34" y1="72" x2="66" y2="72" stroke="#FDE68A" strokeWidth="1.5" />
          <circle cx="50" cy="72" r="2.5" fill="#FDE68A" />
        </g>
      </svg>

      {/* Nametag on pot */}
      {name && (
        <div className="mt-1 flex flex-col items-center max-w-[130px]">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-md border shadow-xs truncate max-w-full text-center transition-colors ${
              isBloomed
                ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400 font-extrabold'
                : 'bg-white/95 text-slate-800 border-slate-200'
            }`}
          >
            {name}
          </span>
          {code && (
            <span className="text-[10px] text-slate-500 font-mono tabular-nums">
              {code}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
