import type { Metadata } from "next";
import "@/styles/globals.css";
import { VisibilityProvider } from "@/context/VisibilityContext";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "ExchanGo24",
  description: "ExchanGo24 - Exchange Rate Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="dm-sans">
        <GoogleAnalytics />
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
          <AuthProvider>
            <MenuProvider>
              <VisibilityProvider>{children}</VisibilityProvider>
            </MenuProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
