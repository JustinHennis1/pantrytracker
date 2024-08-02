import { Inter } from "next/font/google";
import "./globals.css";
import ClientThemeProvider from './ClientThemeProvider';
import Heading from './Heading';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pantry Tracker",
  description: "Track and update your pantry inventory as well as create new items",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientThemeProvider>
          <Heading />
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}