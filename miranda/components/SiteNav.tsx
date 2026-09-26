import Link from "next/link";

export function SiteNav({ active }: { active: "shop" | "merchant" | "compare" }) {
  return (
    <nav className="site-nav" aria-label="Primary">
      <Link
        href="/"
        className={active === "shop" ? "site-nav__link site-nav__link--active" : "site-nav__link"}
      >
        Shop
      </Link>
      <span className="site-nav__dot" aria-hidden>
        ·
      </span>
      <Link
        href="/compare"
        className={active === "compare" ? "site-nav__link site-nav__link--active" : "site-nav__link"}
      >
        Compare
      </Link>
      <span className="site-nav__dot" aria-hidden>
        ·
      </span>
      <Link
        href="/merchant"
        className={
          active === "merchant"
            ? "site-nav__link site-nav__link--active"
            : "site-nav__link"
        }
      >
        Merchant
      </Link>
    </nav>
  );
}
