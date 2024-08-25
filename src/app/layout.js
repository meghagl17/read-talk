import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="text-2xl">
            <Navbar />
            <div className=" mx-36 flex flex-col items-center text-center mt-2">
              {children} 
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
