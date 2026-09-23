interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
}

/**
 * Consistent heading block for section landing pages (Explore, Projects,
 * Forum, Shop, Profile). Keeps typographic rhythm identical across
 * sections so new ones slot in without redesigning the page top.
 */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="max-w-4xl space-y-6 pb-12 relative">
      {/* Decorative glow element */}
      <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-0 blur-3xl pointer-events-none" />
      
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.2em] text-white font-bold inline-block border border-white/20 px-4 py-2 rounded-full bg-white/5 animate-fade-in">
          {eyebrow}
        </p>
      )}
      
      <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] tracking-tight animate-slide-up">
        {title}
      </h1>
      
      <p className="text-lg md:text-xl leading-relaxed text-muted/80 max-w-3xl animate-slide-up" style={{ animationDelay: "100ms" }}>
        {description}
      </p>
    </div>
  );
}
