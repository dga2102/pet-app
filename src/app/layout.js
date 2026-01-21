import { Archivo } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

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
    <ClerkProvider>
      <html lang="en">
        <body className={`${archivo.variable} antialiased`}>
          <Navbar />
          <div className="md:ml-64">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
