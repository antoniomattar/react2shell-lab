// app/layout.js
// Root layout for the vulnerable Next.js application

export const metadata = {
  title: 'CVE-2025-55182 Lab',
  description: 'Vulnerable application for security research',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ 
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#1a1a2e',
        color: '#eee',
        margin: 0,
        padding: '20px'
      }}>
        {children}
      </body>
    </html>
  );
}
