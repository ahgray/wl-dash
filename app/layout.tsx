import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Football Winners and Jets - Fantasy Dashboard',
  description: 'Track your teams in the ultimate wins and losses fantasy competition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}