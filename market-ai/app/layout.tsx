import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container topbar">
          <Link href="/" className="brand">market.ai</Link>
          <nav className="nav">
            <Link href="/submit">Submit</Link>
            <Link href="/search">Search</Link>
            <Link href="/deal-room">Deal Room</Link>
            <Link href="/compliance">Compliance</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/login" className="pill">Login</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
