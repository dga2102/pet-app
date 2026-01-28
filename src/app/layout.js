import { Archivo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { HouseholdProvider } from "@/app/context/HouseholdContext";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["sans-serif"],
});

export const metadata = {
  title: "Animal Care App",
  description: "An All-in-one app to help you take care of your animals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} antialiased`}>
        <Navbar />
        <div className="md:mx-16">{children}</div>
      </body>
    </html>
  );
}
