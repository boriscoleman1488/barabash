import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BestFlix Admin",
  description: "Адміністративна панель BestFlix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}