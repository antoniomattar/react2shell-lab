// app/layout.js
// Mise en page racine pour l'application Next.js vulnérable

export const metadata = {
  title: 'Labo CVE-2025-55182',
  description: 'Application vulnérable pour la recherche en sécurité',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
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
