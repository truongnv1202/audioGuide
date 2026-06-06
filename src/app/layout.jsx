import "./globals.css";

export const metadata = {
  title: "AudioGuide",
  description: "Hệ thống thuyết minh audio guide",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
