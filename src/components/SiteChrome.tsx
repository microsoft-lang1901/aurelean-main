import Link from "next/link";

export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M12 3 L21 20 H3 Z" />
        <path d="M12 10 L16.5 20 H7.5 Z" strokeOpacity=".55" />
      </svg>
      AURELEAN
    </span>
  );
}

export function SiteNav() {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href="/" aria-label="AURELEAN home">
          <Logo />
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/platform">Platform</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/trade">Trade</Link>
          <Link href="/platform#intelligence">Intelligence</Link>
          <Link href="/developers">Developers</Link>
          <Link href="#company">Company</Link>
        </nav>
        <div className="nav-right">
          <Link className="signin" href="/workspace">
            Sign in
          </Link>
          <Link className="btn btn-gold" href="/request-access">
            Request Access
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer" id="company">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Logo />
            <p>
              AI-native operational intelligence for global sourcing, procurement,
              and manufacturing coordination.
            </p>
          </div>
          <FooterList title="Platform" items={["Overview", "Trade", "Intelligence", "AI Agent"]} />
          <FooterList title="Solutions" items={["Luxury Textiles", "Furnishings", "Materials", "Manufacturing"]} />
          <FooterList title="Company" items={["About", "Careers", "Newsroom", "Contact"]} />
          <FooterList title="Resources" items={["Developers", "Documentation", "Security", "Privacy"]} />
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h5>{title}</h5>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Link href={title === "Resources" ? "/developers" : "/platform"}>{item}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <Footer />
    </>
  );
}
