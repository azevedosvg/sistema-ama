type Props = {
  size?: number;
  className?: string;
};

// Emblema vetorial da marca (estrela dourada "AMA"), inspirado na logo oficial.
// Vetorial = nítido em qualquer tamanho — ideal para espaços pequenos (header, rodapé).
export default function LogoMark({ size = 36, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="AMA — Amigos Mãos Abertas"
      className={className}
    >
      <defs>
        <linearGradient id="ama-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f7c948" />
          <stop offset="1" stopColor="#d4a017" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 L29.3 16.7 L44.9 17.2 L32.6 26.8 L36.9 41.8 L24 33 L11.1 41.8 L15.4 26.8 L3.1 17.2 L18.7 16.7 Z"
        fill="url(#ama-gold)"
        stroke="#8a5a12"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <text
        x="24"
        y="28.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        letterSpacing="0.3"
        fontFamily="Inter, system-ui, sans-serif"
        fill="#b91c1c"
      >
        AMA
      </text>
    </svg>
  );
}
