import ClientProvider from "./components/ClientProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "GCUF Lost & Found",
  description: "University Lost & Found Portal - Report and find lost items on campus",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lost & Found",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* PWA Meta Tags */}
        <link rel="apple-touch-icon" href="/images/L.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <ClientProvider>
          {children}
        </ClientProvider>
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              maxWidth: '90vw',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}

