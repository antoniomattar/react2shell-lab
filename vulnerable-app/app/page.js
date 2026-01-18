// app/page.js
// Composant de la page principale - démontre que l'application fonctionne
// Note : Aucune Server Action explicite n'est définie, pourtant l'application est vulnérable
// car le endpoint du protocole RSC Flight est exposé par défaut

import FlagForm from './FlagForm';

export default function Home() {
  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <div style={{
        backgroundColor: '#16213e',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ 
          color: '#e94560',
          marginTop: 0 
        }}>
          ⚠️ Labo Vulnérable CVE-2025-55182
        </h1>
        
        <div style={{
          backgroundColor: '#0f3460',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#ffc107', margin: '0 0 10px 0' }}>
            🚨 ATTENTION
          </h2>
          <p style={{ margin: 0 }}>
            Cette application est <strong>intentionnellement vulnérable</strong> à la 
            CVE-2025-55182 (React2Shell). Elle est conçue uniquement à des fins de recherche 
            en sécurité et d'éducation.
          </p>
        </div>

        <div style={{
          border: '2px dashed #00d9ff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          backgroundColor: 'rgba(0, 217, 255, 0.1)'
        }}>
          <h2 style={{ color: '#00d9ff', marginTop: 0 }}>🎯 Votre Mission</h2>
          <p style={{ fontSize: '1.1em' }}>
            Un fichier secret nommé <code>flag.txt</code> a été caché à la racine du système de fichiers du conteneur (<code>/flag.txt</code>).
          </p>
          <p>
            <strong>Objectif :</strong> Utilisez la vulnérabilité RCE pour lire le contenu de ce fichier !
          </p>
          
          <FlagForm />
        </div>

        <h2 style={{ color: '#00d9ff' }}>Détails de l'Environnement</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                <strong>Version Next.js</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #333', color: '#e94560' }}>
                16.0.6 (VULNÉRABLE)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                <strong>Version React</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #333', color: '#e94560' }}>
                19.2.0 (VULNÉRABLE)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                <strong>CVE</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                CVE-2025-55182
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                <strong>Score CVSS</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #333', color: '#e94560' }}>
                10.0 (Critique)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>
                <strong>Type de Routeur</strong>
              </td>
              <td style={{ padding: '8px' }}>
                App Router (RSC activé)
              </td>
            </tr>
          </tbody>
        </table>

        <h2 style={{ color: '#00d9ff', marginTop: '30px' }}>Test Rapide</h2>
        <p>
          Pour vérifier que cette application est vulnérable, lancez le script d'exploit :
        </p>
        <pre style={{
          backgroundColor: '#0f0f23',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          color: '#00ff00'
        }}>
{`python3 exploit/exploit.py http://localhost:3000 "id"

# Résultat attendu :
# [+] VULNÉRABLE ! Sortie de la commande :
# uid=0(root) gid=0(root) groups=0(root)...`}
        </pre>

        <h2 style={{ color: '#00d9ff', marginTop: '30px' }}>Points Clés</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Pas de Server Actions Requises :</strong> La vulnérabilité existe 
            même sans Server Actions explicites définies
          </li>
          <li>
            <strong>Configuration par Défaut :</strong> App Router active RSC par défaut
          </li>
          <li>
            <strong>Non Authentifié :</strong> Pas de connexion ou de session requise pour exploiter
          </li>
          <li>
            <strong>RCE Totale :</strong> Exécution de commande arbitraire en tant qu'utilisateur du processus Node.js
          </li>
        </ul>
      </div>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '30px',
        color: '#666'
      }}>
        <p>
          Pour éducation et tests de sécurité autorisés uniquement.
          <br />
          Voir <code>report.md</code> pour l'analyse technique.
        </p>
      </footer>
    </main>
  );
}
