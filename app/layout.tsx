import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HNA - HackerNews Analyzer',
  description: 'Analyze HackerNews comments to identify pain points and business opportunities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-background flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
