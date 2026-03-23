import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { AuthStatus } from "@/components/AuthStatus";
import { NotificationBell } from "@/components/NotificationBell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="container topbar">
            <Link href="/" className="brand">market.ai</Link>
            <nav className="nav">
              <Link href="/search">Properties</Link>
              <Link href="/calculator">Calculator</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/submit">List Property</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/messages">Messages</Link>
              <NotificationBell />
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
