import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';
import Heading from './Heading';

const ClientThemeProvider = dynamic(() => import('./ClientThemeProvider'), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "OndaShelf",
  description: "Track and update your pantry inventory as well as create new items",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientThemeProvider>
          <div className="max-width-container">
            <Heading />
            {children}
          </div>
        </ClientThemeProvider>
      </body>
    </html>
  );
}