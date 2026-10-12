import { Inter } from "next/font/google";
import Head from "next/head";
import "@/styles/globals.css";

import Navbar from "@/components/fragment/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "WriteGeez",
  description: "Text Editor for Tigrinya alphabets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
