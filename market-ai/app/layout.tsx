import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem" }}>market.ai</Link>
          <nav style={{ display: "flex", gap: ".75rem" }}>
            <Link href="/submit">Submit</Link>
            <Link href="/search">Search</Link>
            <Link href="/deal-room">Deal Room</Link>
            <Link href="/compliance">Compliance</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
