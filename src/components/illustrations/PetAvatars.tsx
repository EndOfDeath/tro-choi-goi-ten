import React from 'react';

interface PetProps {
  type?: number;
  className?: string;
  isWinning?: boolean;
  name?: string;
  code?: string;
  size?: number;
}

export const PET_NAMES = [
  'Shiba năng động',
  'Mèo mướp thông thái',
  'Thỏ trắng siêu tốc',
  'Hamster hạt dẻ',
  'Cáo vàng nhanh nhẹn',
  'Nhím gai dũng cảm',
  'Rùa thần tốc độ',
  'Gấu trúc chăm chỉ',
];

export const PetAvatar: React.FC<PetProps> = ({
  type = 0,
  className = '',
  isWinning = false,
  name,
  code,
  size = 72,
}) => {
  const index = Math.abs(type) % 8;

  // Render SVG pet based on index
  const renderPetBody = () => {
    switch (index) {
      case 0:
        // Shiba Inu
        return (
          <g>
            {/* Body */}
            <circle cx="50" cy="52" r="32" fill="#E6953B" />
            <ellipse cx="50" cy="58" rx="20" ry="16" fill="#FDF3E3" />
            {/* Ears */}
            <polygon points="26,30 36,12 46,30" fill="#D37E28" />
            <polygon points="30,28 36,18 42,28" fill="#FCE4D6" />
            <polygon points="54,30 64,12 74,30" fill="#D37E28" />
            <polygon points="58,28 64,18 70,28" fill="#FCE4D6" />
            {/* Eyes */}
            <ellipse cx="38" cy="44" rx="4" ry="5" fill="#2D241E" />
            <circle cx="39.5" cy="42.5" r="1.5" fill="#FFF" />
            <ellipse cx="62" cy="44" rx="4" ry="5" fill="#2D241E" />
            <circle cx="63.5" cy="42.5" r="1.5" fill="#FFF" />
            {/* Cheeks */}
            <circle cx="31" cy="50" r="4.5" fill="#FFB09C" opacity="0.7" />
            <circle cx="69" cy="50" r="4.5" fill="#FFB09C" opacity="0.7" />
            {/* Snout & Nose */}
            <ellipse cx="50" cy="50" rx="9" ry="6" fill="#FFF" />
            <ellipse cx="50" cy="47" rx="3.5" ry="2.5" fill="#2D241E" />
            <path d="M48,51 Q50,53 52,51" stroke="#2D241E" strokeWidth="1.5" fill="none" />
            {/* Red scarf */}
            <path d="M28,66 Q50,78 72,66 Q50,84 28,66" fill="#EF4444" />
            <circle cx="50" cy="74" r="3" fill="#FDE047" />
          </g>
        );
      case 1:
        // Tabby Cat
        return (
          <g>
            {/* Body */}
            <circle cx="50" cy="52" r="32" fill="#A8A29E" />
            <ellipse cx="50" cy="58" rx="20" ry="16" fill="#F5F5F4" />
            {/* Stripes */}
            <path d="M46,24 L48,32 L50,24 L52,32 L54,24" stroke="#78716C" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Ears */}
            <polygon points="24,32 32,10 44,28" fill="#78716C" />
            <polygon points="28,29 34,17 40,27" fill="#FBCFE8" />
            <polygon points="56,28 68,10 76,32" fill="#78716C" />
            <polygon points="60,27 66,17 72,29" fill="#FBCFE8" />
            {/* Eyes */}
            <ellipse cx="38" cy="45" rx="4.5" ry="5.5" fill="#10B981" />
            <ellipse cx="38" cy="45" rx="2" ry="4.5" fill="#064E3B" />
            <circle cx="39" cy="43" r="1.5" fill="#FFF" />
            <ellipse cx="62" cy="45" rx="4.5" ry="5.5" fill="#10B981" />
            <ellipse cx="62" cy="45" rx="2" ry="4.5" fill="#064E3B" />
            <circle cx="63" cy="43" r="1.5" fill="#FFF" />
            {/* Whiskers */}
            <line x1="20" y1="48" x2="33" y2="49" stroke="#78716C" strokeWidth="1.5" />
            <line x1="20" y1="53" x2="33" y2="52" stroke="#78716C" strokeWidth="1.5" />
            <line x1="67" y1="49" x2="80" y2="48" stroke="#78716C" strokeWidth="1.5" />
            <line x1="67" y1="52" x2="80" y2="53" stroke="#78716C" strokeWidth="1.5" />
            {/* Nose & Mouth */}
            <polygon points="48,49 52,49 50,52" fill="#F472B6" />
            <path d="M47,53 Q50,55 53,53" stroke="#444" strokeWidth="1.2" fill="none" />
            {/* Golden Bell collar */}
            <path d="M28,68 Q50,78 72,68" stroke="#3B82F6" strokeWidth="4" fill="none" />
            <circle cx="50" cy="74" r="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
          </g>
        );
      case 2:
        // White Bunny
        return (
          <g>
            {/* Long Ears */}
            <ellipse cx="34" cy="22" rx="7" ry="20" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <ellipse cx="34" cy="22" rx="4" ry="14" fill="#FBCFE8" />
            <ellipse cx="66" cy="22" rx="7" ry="20" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <ellipse cx="66" cy="22" rx="4" ry="14" fill="#FBCFE8" />
            {/* Body */}
            <circle cx="50" cy="54" r="30" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Eyes */}
            <ellipse cx="38" cy="48" rx="4" ry="5" fill="#BE185D" />
            <circle cx="39.5" cy="46" r="1.5" fill="#FFF" />
            <ellipse cx="62" cy="48" rx="4" ry="5" fill="#BE185D" />
            <circle cx="63.5" cy="46" r="1.5" fill="#FFF" />
            {/* Cheeks */}
            <circle cx="31" cy="55" r="4" fill="#F472B6" opacity="0.6" />
            <circle cx="69" cy="55" r="4" fill="#F472B6" opacity="0.6" />
            {/* Cute nose */}
            <polygon points="48,53 52,53 50,56" fill="#FB7185" />
            <path d="M48,57 Q50,59 52,57" stroke="#475569" strokeWidth="1.2" fill="none" />
            {/* Carrot badge */}
            <polygon points="48,70 54,70 51,80" fill="#F97316" />
            <path d="M50,70 L48,66 M52,70 L54,66" stroke="#22C55E" strokeWidth="1.5" />
          </g>
        );
      case 3:
        // Chubby Hamster
        return (
          <g>
            {/* Round ears */}
            <circle cx="28" cy="28" r="9" fill="#F59E0B" />
            <circle cx="28" cy="28" r="5" fill="#FEF3C7" />
            <circle cx="72" cy="28" r="9" fill="#F59E0B" />
            <circle cx="72" cy="28" r="5" fill="#FEF3C7" />
            {/* Body */}
            <ellipse cx="50" cy="54" rx="34" ry="30" fill="#F59E0B" />
            <ellipse cx="50" cy="60" rx="22" ry="18" fill="#FFFBEB" />
            {/* Big Chubby Cheeks */}
            <circle cx="28" cy="54" r="11" fill="#FEF3C7" />
            <circle cx="72" cy="54" r="11" fill="#FEF3C7" />
            {/* Eyes */}
            <ellipse cx="39" cy="45" rx="3.5" ry="4.5" fill="#1E293B" />
            <circle cx="40" cy="43" r="1.5" fill="#FFF" />
            <ellipse cx="61" cy="45" rx="3.5" ry="4.5" fill="#1E293B" />
            <circle cx="62" cy="43" r="1.5" fill="#FFF" />
            {/* Nose & tiny mouth */}
            <circle cx="50" cy="50" r="2.5" fill="#F472B6" />
            <path d="M47,53 Q50,56 53,53" stroke="#78350F" strokeWidth="1.2" fill="none" />
            {/* Sunflower seed */}
            <ellipse cx="50" cy="68" rx="6" ry="9" fill="#78350F" stroke="#FDE68A" strokeWidth="1" />
            <line x1="50" y1="60" x2="50" y2="76" stroke="#FEF3C7" strokeWidth="1" />
          </g>
        );
      case 4:
        // Clever Orange Fox
        return (
          <g>
            {/* Big Fox Ears */}
            <polygon points="22,34 32,8 46,30" fill="#EA580C" />
            <polygon points="28,30 33,14 42,28" fill="#1E293B" />
            <polygon points="54,30 68,8 78,34" fill="#EA580C" />
            <polygon points="58,28 67,14 72,30" fill="#1E293B" />
            {/* Head */}
            <ellipse cx="50" cy="52" rx="32" ry="28" fill="#EA580C" />
            <polygon points="24,54 50,78 76,54" fill="#FFFFFF" />
            {/* Eyes */}
            <path d="M34,44 Q40,40 44,45" stroke="#1E293B" strokeWidth="2.5" fill="none" />
            <path d="M66,44 Q60,40 56,45" stroke="#1E293B" strokeWidth="2.5" fill="none" />
            <circle cx="39" cy="46" r="3" fill="#0284C7" />
            <circle cx="61" cy="46" r="3" fill="#0284C7" />
            {/* Nose */}
            <circle cx="50" cy="68" r="3.5" fill="#0F172A" />
            {/* Green leaf bandana */}
            <path d="M30,68 Q50,82 70,68" stroke="#16A34A" strokeWidth="4" fill="none" />
            <ellipse cx="50" cy="74" rx="4" ry="2" fill="#22C55E" />
          </g>
        );
      case 5:
        // Cute Hedgehog
        return (
          <g>
            {/* Spikes / Quills */}
            <path
              d="M20,40 L12,30 L22,24 L18,12 L30,16 L38,6 L48,14 L56,4 L64,14 L74,8 L76,20 L86,24 L80,36 L88,46 L78,54 L84,66 L72,70 L70,80 L58,76 L48,82 L38,76 L28,80 L24,70 L14,64 L20,54 Z"
              fill="#713F12"
            />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="26" ry="24" fill="#FED7AA" />
            {/* Ears */}
            <circle cx="30" cy="38" r="5" fill="#FED7AA" stroke="#713F12" strokeWidth="1" />
            <circle cx="70" cy="38" r="5" fill="#FED7AA" stroke="#713F12" strokeWidth="1" />
            {/* Eyes */}
            <circle cx="40" cy="48" r="3.5" fill="#1C1917" />
            <circle cx="41" cy="47" r="1" fill="#FFF" />
            <circle cx="60" cy="48" r="3.5" fill="#1C1917" />
            <circle cx="61" cy="47" r="1" fill="#FFF" />
            {/* Nose & Smile */}
            <circle cx="50" cy="56" r="3.5" fill="#1C1917" />
            <path d="M47,60 Q50,63 53,60" stroke="#713F12" strokeWidth="1.2" fill="none" />
            {/* Little Acorn on head */}
            <circle cx="50" cy="22" r="5" fill="#A16207" />
            <ellipse cx="50" cy="18" rx="6" ry="2.5" fill="#713F12" />
          </g>
        );
      case 6:
        // Speedy Turtle with Champion Headband
        return (
          <g>
            {/* Shell rim */}
            <ellipse cx="50" cy="56" rx="34" ry="26" fill="#15803D" />
            <ellipse cx="50" cy="56" rx="28" ry="20" fill="#22C55E" />
            <path d="M50,36 L50,76 M22,56 L78,56 M32,44 L68,68 M32,68 L68,44" stroke="#166534" strokeWidth="1.5" />
            {/* Turtle Head */}
            <circle cx="50" cy="36" r="18" fill="#86EFAC" stroke="#16A34A" strokeWidth="1" />
            {/* Champion Red Headband */}
            <rect x="32" y="30" width="36" height="5" rx="2.5" fill="#DC2626" />
            <polygon points="68,32 78,28 74,34 80,38 68,35" fill="#DC2626" />
            {/* Eyes with determination */}
            <ellipse cx="43" cy="38" rx="3" ry="3.5" fill="#0F172A" />
            <circle cx="44" cy="37" r="1" fill="#FFF" />
            <ellipse cx="57" cy="38" rx="3" ry="3.5" fill="#0F172A" />
            <circle cx="58" cy="37" r="1" fill="#FFF" />
            {/* Cute smile */}
            <path d="M47,44 Q50,47 53,44" stroke="#166534" strokeWidth="1.5" fill="none" />
          </g>
        );
      default:
        // Baby Panda with Bamboo
        return (
          <g>
            {/* Black ears */}
            <circle cx="26" cy="28" r="10" fill="#0F172A" />
            <circle cx="74" cy="28" r="10" fill="#0F172A" />
            {/* White face */}
            <circle cx="50" cy="52" r="30" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Eye patches */}
            <ellipse cx="37" cy="46" rx="8" ry="10" fill="#0F172A" transform="rotate(-15 37 46)" />
            <ellipse cx="63" cy="46" rx="8" ry="10" fill="#0F172A" transform="rotate(15 63 46)" />
            {/* Sparkly eyes */}
            <circle cx="38" cy="46" r="3" fill="#FFFFFF" />
            <circle cx="39" cy="45" r="1" fill="#0F172A" />
            <circle cx="62" cy="46" r="3" fill="#FFFFFF" />
            <circle cx="63" cy="45" r="1" fill="#0F172A" />
            {/* Cheeks */}
            <circle cx="28" cy="56" r="4" fill="#FDA4AF" opacity="0.6" />
            <circle cx="72" cy="56" r="4" fill="#FDA4AF" opacity="0.6" />
            {/* Snout */}
            <ellipse cx="50" cy="54" rx="4" ry="3" fill="#0F172A" />
            <path d="M47,59 Q50,62 53,59" stroke="#0F172A" strokeWidth="1.2" fill="none" />
            {/* Bamboo leaf */}
            <path d="M48,68 Q52,62 60,64 Q56,70 48,68" fill="#16A34A" />
          </g>
        );
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Crown / Trophy for winner */}
      {isWinning && (
        <div className="absolute -top-7 text-amber-500 animate-bounce drop-shadow-md z-10">
          <svg className="w-8 h-8 fill-amber-400 stroke-amber-600 stroke-[1.5]" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}

      {/* SVG Container */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="transition-transform duration-200"
      >
        {/* Soft shadow */}
        <ellipse cx="50" cy="88" rx="34" ry="8" fill="rgba(0,0,0,0.12)" />
        {renderPetBody()}
      </svg>

      {/* Embedded Nametag Badge */}
      {name && (
        <div className="mt-1 flex flex-col items-center max-w-[140px]">
          <span className="px-2 py-0.5 text-[11px] font-bold text-slate-800 bg-white/95 rounded-md border border-slate-200 shadow-xs truncate max-w-full text-center">
            {name}
          </span>
          {code && (
            <span className="text-[9px] text-slate-500 font-mono tabular-nums">
              {code}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
