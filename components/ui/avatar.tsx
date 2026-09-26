import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
}

/** Profile picture with a monochrome monogram fallback. */
export function Avatar({ name, src, size = 36, className, ring = false }: AvatarProps) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const tone = 0.08 + ((initial.charCodeAt(0) % 5) * 0.025);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white/85",
        ring && "ring-1 ring-white/15",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.38)),
        background: `rgba(255,255,255,${tone.toFixed(3)})`,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}
