import "./globals.css";

export const metadata = {
  title: "AudioGuide",
  description: "Hệ thống thuyết minh audio guide",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AudioGuide",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#17120f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="app-body">{children}</body>
    </html>
  );
}
