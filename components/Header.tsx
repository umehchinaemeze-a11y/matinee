const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Featured", href: "#featured" },
  { label: "Popular", href: "#popular" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b0f]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <a href="#home" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5c518] text-lg font-black text-[#0b0b0f]">
            M
          </span>
          <span className="text-xl font-black tracking-tight">
            MATINEE<span className="text-[#f5c518]">.</span>
          </span>
        </a>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white sm:px-4"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
