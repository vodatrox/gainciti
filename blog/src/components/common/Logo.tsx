interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { text: "text-lg", chevron: "w-[10px] h-[7px]", offset: "-bottom-[1px]" },
  md: { text: "text-2xl", chevron: "w-[13px] h-[9px]", offset: "-bottom-[2px]" },
  lg: { text: "text-4xl", chevron: "w-[18px] h-[13px]", offset: "-bottom-[3px]" },
};

function Chevron({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 8L7 3L12 8" stroke="#3BE882" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const s = sizes[size];
  return (
    <span className={`${s.text} font-extrabold tracking-tight ${className}`}>
      G
      <span className="relative inline-block">
        A
        <Chevron className={`absolute ${s.offset} left-1/2 -translate-x-1/2 ${s.chevron}`} />
      </span>
      inciti
    </span>
  );
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#152238"/>
      <text x="5" y="23" fontFamily="Inter,system-ui,sans-serif" fontWeight="800" fontSize="18" fill="white">G</text>
      <path d="M14 22L19 16L24 22" stroke="#3BE882" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
