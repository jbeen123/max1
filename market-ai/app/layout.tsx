import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { AuthStatus } from "@/components/AuthStatus";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="container topbar">
            <Link href="/" className="brand">market.ai</Link>
            <nav className="nav">
              <Link href="/submit">Submit</Link>
              <Link href="/search">Search</Link>
              <Link href="/deal-room">Deal Room</Link>
              <Link href="/compliance">Compliance</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/admin/users">Users</Link>
              <Link href="/admin/invites">Invites</Link>
              <Link href="/admin/audit">Audit Logs</Link>
              <Link href="/login" className="pill">Login</Link>
              <AuthStatus />
            </nav>
          </header>
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
