import React from 'react';

interface PlushieProps {
  type?: number;
  size?: number;
  className?: string;
  name?: string;
  code?: string;
  isGrabbed?: boolean;
}

export const PLUSHIE_NAMES = [
  'Gấu Teddy nâu',
  'Thỏ bông hồng phấn',
  'Vịt vàng thông minh',
  'Mèo bông may mắn',
  'Cún cưng tai dài',
  'Cánh cụt học đường',
];

export const PlushieDoll: React.FC<PlushieProps> = ({
  type = 0,
  size = 76,
  className = '',
  name,
  code,
  isGrabbed = false,
}) => {
  const index = Math.abs(type) % 6;

  const renderPlushie = () => {
    switch (index) {
      case 0:
        // Teddy Bear
        return (
          <g>
            {/* Ears */}
            <circle cx="28" cy="28" r="10" fill="#92400E" />
            <circle cx="28" cy="28" r="6" fill="#FDE68A" />
            <circle cx="72" cy="28" r="10" fill="#92400E" />
            <circle cx="72" cy="28" r="6" fill="#FDE68A" />
            {/* Head */}
            <circle cx="50" cy="50" r="30" fill="#B45309" />
            {/* Snout */}
            <ellipse cx="50" cy="56" rx="14" ry="10" fill="#FEF3C7" />
            <circle cx="50" cy="52" r="3.5" fill="#451A03" />
            <path d="M47,56 Q50,59 53,56" stroke="#451A03" strokeWidth="1.5" fill="none" />
            {/* Eyes */}
            <circle cx="39" cy="45" r="3" fill="#1C1917" />
            <circle cx="40" cy="44" r="1" fill="#FFF" />
            <circle cx="61" cy="45" r="3" fill="#1C1917" />
            <circle cx="62" cy="44" r="1" fill="#FFF" />
            {/* Bowtie */}
            <polygon points="44,68 56,68 50,73" fill="#EF4444" />
            <polygon points="44,78 56,78 50,73" fill="#EF4444" />
            <circle cx="50" cy="73" r="2.5" fill="#FBBF24" />
          </g>
        );
      case 1:
        // Pink Bunny
        return (
          <g>
            {/* Ears */}
            <ellipse cx="36" cy="22" rx="7" ry="18" fill="#F472B6" stroke="#DB2777" strokeWidth="1" />
            <ellipse cx="36" cy="22" rx="4" ry="12" fill="#FDF2F8" />
            <ellipse cx="64" cy="22" rx="7" ry="18" fill="#F472B6" stroke="#DB2777" strokeWidth="1" />
            <ellipse cx="64" cy="22" rx="4" ry="12" fill="#FDF2F8" />
            {/* Head */}
            <circle cx="50" cy="52" r="28" fill="#F472B6" />
            {/* Cheeks */}
            <circle cx="33" cy="56" r="4.5" fill="#BE185D" opacity="0.4" />
            <circle cx="67" cy="56" r="4.5" fill="#BE185D" opacity="0.4" />
            {/* Face */}
            <circle cx="40" cy="48" r="3" fill="#831843" />
            <circle cx="60" cy="48" r="3" fill="#831843" />
            <polygon points="48,53 52,53 50,56" fill="#831843" />
            <path d="M48,57 Q50,59 52,57" stroke="#831843" strokeWidth="1.2" fill="none" />
          </g>
        );
      case 2:
        // Yellow Duckling
        return (
          <g>
            {/* Head */}
            <circle cx="50" cy="50" r="30" fill="#FBBF24" />
            {/* Eyes */}
            <circle cx="38" cy="44" r="3.5" fill="#1E293B" />
            <circle cx="39" cy="43" r="1" fill="#FFF" />
            <circle cx="62" cy="44" r="3.5" fill="#1E293B" />
            <circle cx="63" cy="43" r="1" fill="#FFF" />
            {/* Orange Bill */}
            <ellipse cx="50" cy="54" rx="14" ry="7" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
            {/* Sailor Hat */}
            <polygon points="40,24 60,24 50,14" fill="#3B82F6" />
            <ellipse cx="50" cy="24" rx="14" ry="3" fill="#FFFFFF" />
          </g>
        );
      case 3:
        // Lucky White Cat
        return (
          <g>
            {/* Ears */}
            <polygon points="26,34 34,14 46,28" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
            <polygon points="30,30 35,20 42,28" fill="#FCA5A5" />
            <polygon points="54,28 66,14 74,34" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
            <polygon points="58,28 65,20 70,30" fill="#FCA5A5" />
            {/* Head */}
            <circle cx="50" cy="52" r="28" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            {/* Eyes */}
            <circle cx="38" cy="46" r="3" fill="#10B981" />
            <circle cx="62" cy="46" r="3" fill="#10B981" />
            {/* Coin on forehead */}
            <ellipse cx="50" cy="38" rx="6" ry="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
            {/* Mouth */}
            <polygon points="48,52 52,52 50,55" fill="#F43F5E" />
            <path d="M47,56 Q50,58 53,56" stroke="#64748B" strokeWidth="1.2" fill="none" />
          </g>
        );
      case 4:
        // Long-eared Puppy
        return (
          <g>
            {/* Floppy Brown Ears */}
            <ellipse cx="24" cy="46" rx="8" ry="18" fill="#78350F" transform="rotate(-20 24 46)" />
            <ellipse cx="76" cy="46" rx="8" ry="18" fill="#78350F" transform="rotate(20 76 46)" />
            {/* Head */}
            <circle cx="50" cy="50" r="28" fill="#FDE68A" />
            {/* Eye patch */}
            <ellipse cx="40" cy="44" rx="9" ry="11" fill="#D97706" opacity="0.8" />
            {/* Eyes */}
            <circle cx="40" cy="44" r="3" fill="#1E293B" />
            <circle cx="41" cy="43" r="1" fill="#FFF" />
            <circle cx="60" cy="44" r="3" fill="#1E293B" />
            <circle cx="61" cy="43" r="1" fill="#FFF" />
            {/* Black Nose */}
            <ellipse cx="50" cy="54" rx="4" ry="3" fill="#0F172A" />
            <path d="M47,58 Q50,61 53,58" stroke="#0F172A" strokeWidth="1.2" fill="none" />
          </g>
        );
      default:
        // Baby Penguin
        return (
          <g>
            {/* Body */}
            <ellipse cx="50" cy="50" rx="28" ry="30" fill="#1E293B" />
            {/* White belly/face */}
            <ellipse cx="50" cy="54" rx="20" ry="22" fill="#FFFFFF" />
            {/* Eyes */}
            <circle cx="42" cy="44" r="3" fill="#0F172A" />
            <circle cx="58" cy="44" r="3" fill="#0F172A" />
            {/* Beak */}
            <polygon points="46,48 54,48 50,55" fill="#F97316" />
            {/* Cheeks */}
            <circle cx="34" cy="52" r="3" fill="#FDA4AF" />
            <circle cx="66" cy="52" r="3" fill="#FDA4AF" />
            {/* Blue earmuffs */}
            <path d="M26,44 Q50,22 74,44" stroke="#0284C7" strokeWidth="3" fill="none" />
            <circle cx="26" cy="44" r="5" fill="#38BDF8" />
            <circle cx="74" cy="44" r="5" fill="#38BDF8" />
          </g>
        );
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Sparkles if grabbed */}
      {isGrabbed && (
        <div className="absolute -top-4 text-yellow-400 animate-spin text-lg" style={{ animationDuration: '4s' }}>
          ✨
        </div>
      )}

      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        {/* Soft shadow */}
        <ellipse cx="50" cy="86" rx="28" ry="6" fill="rgba(0,0,0,0.12)" />
        {renderPlushie()}
      </svg>

      {/* Nametag if available */}
      {name && (
        <div className="mt-1 flex flex-col items-center max-w-[130px]">
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded-md border shadow-xs truncate max-w-full text-center ${
              isGrabbed ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400' : 'bg-white/95 text-slate-800 border-slate-200'
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
