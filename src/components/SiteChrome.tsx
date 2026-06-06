import Link from "next/link";

const primaryLinks = [
  { href: "/platform", label: "Platform" },
  { href: "/solutions", label: "Solutions" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/developers", label: "Developers" },
  { href: "/resources", label: "Resources" },
  { href: "/company", label: "Company" }
];

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
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <details className="mobile-menu">
          <summary>Menu</summary>
          <div className="mobile-menu-panel" role="navigation" aria-label="Mobile navigation">
            {primaryLinks.map((link) => (
              <Link key={`mobile-${link.href}`} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link className="mobile-signin" href="/workspace">
              Demo workspace
            </Link>
            <Link className="btn btn-gold" href="/request-access">
              Request Access
            </Link>
          </div>
        </details>
        <div className="nav-right">
          <Link className="signin" href="/workspace">
            Demo workspace
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
          <FooterList
            title="Platform"
            items={[
              ["Overview", "/platform"],
              ["Trade", "/trade"],
              ["Intelligence", "/intelligence"],
              ["AI Agent", "/ai-agent"],
              ["Integrations", "/integrations"]
            ]}
          />
          <FooterList
            title="Solutions"
            items={[
              ["Luxury Textiles", "/solutions/luxury-textiles"],
              ["Furnishings", "/solutions/furnishings"],
              ["Materials", "/solutions/materials"],
              ["Manufacturing", "/solutions/manufacturing"]
            ]}
          />
          <FooterList
            title="Company"
            items={[
              ["About", "/company/about"],
              ["Careers", "/company/careers"],
              ["Newsroom", "/company/newsroom"],
              ["Contact", "/company/contact"]
            ]}
          />
          <FooterList
            title="Resources"
            items={[
              ["Developers", "/developers"],
              ["Documentation", "/resources/documentation"],
              ["NVIDIA SimReady", "/integrations/nvidia-simready"],
              ["Security", "/security"],
              ["Privacy", "/privacy"]
            ]}
          />
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h5>{title}</h5>
      <ul>
        {items.map(([label, href]) => (
          <li key={label}>
            <Link href={href}>{label}</Link>
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
