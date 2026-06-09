type Props = {
  /** Tamanho do quadrado da logo (px) */
  size?: number;
  /** Envolve em um cartão branco arredondado (ideal sobre fundos coloridos) */
  badge?: boolean;
  className?: string;
};

// Logo oficial da ONG (Amigos Mãos Abertas).
// Servida de /public; o fundo branco do arquivo fica "embutido" no cartão branco.
export default function Logo({ size = 40, badge = false, className = "" }: Props) {
  const img = (
    <img
      src="/logo-ama.png"
      alt="Logo Amigos Mãos Abertas"
      width={size}
      height={size}
      className="block h-full w-full object-contain"
      draggable={false}
    />
  );

  if (!badge) {
    return (
      <span className={className} style={{ width: size, height: size, display: "inline-block" }}>
        {img}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ width: size * 0.82, height: size * 0.82 }}>{img}</span>
    </span>
  );
}
