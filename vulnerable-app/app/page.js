// app/page.js
// Main page component - demonstrates the app is running
// Note: No explicit Server Actions are defined, yet the app is vulnerable
// because the RSC Flight protocol endpoint is exposed by default

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
          ⚠️ CVE-2025-55182 Vulnerable Lab
        </h1>
        
        <div style={{
          backgroundColor: '#0f3460',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#ffc107', margin: '0 0 10px 0' }}>
            🚨 WARNING
          </h2>
          <p style={{ margin: 0 }}>
            This application is <strong>intentionally vulnerable</strong> to 
            CVE-2025-55182 (React2Shell). It is designed for security research 
            and education purposes only.
          </p>
        </div>

        <h2 style={{ color: '#00d9ff' }}>Environment Details</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                <strong>Next.js Version</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #333', color: '#e94560' }}>
                16.0.6 (VULNERABLE)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                <strong>React Version</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #333', color: '#e94560' }}>
                19.2.0 (VULNERABLE)
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
                <strong>CVSS Score</strong>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #333', color: '#e94560' }}>
                10.0 (Critical)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>
                <strong>Router Type</strong>
              </td>
              <td style={{ padding: '8px' }}>
                App Router (RSC enabled)
              </td>
            </tr>
          </tbody>
        </table>

        <h2 style={{ color: '#00d9ff', marginTop: '30px' }}>Quick Test</h2>
        <p>
          To verify this application is vulnerable, run the exploit script:
        </p>
        <pre style={{
          backgroundColor: '#0f0f23',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          color: '#00ff00'
        }}>
{`python3 exploit/exploit.py http://localhost:3000 "id"

# Expected output:
# [+] VULNERABLE! Command output:
# uid=0(root) gid=0(root) groups=0(root)...`}
        </pre>

        <h2 style={{ color: '#00d9ff', marginTop: '30px' }}>Key Points</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>No Server Actions Required:</strong> The vulnerability exists 
            even without explicit Server Actions defined
          </li>
          <li>
            <strong>Default Configuration:</strong> App Router enables RSC by default
          </li>
          <li>
            <strong>Unauthenticated:</strong> No login or session required to exploit
          </li>
          <li>
            <strong>Full RCE:</strong> Arbitrary command execution as the Node.js process user
          </li>
        </ul>
      </div>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '30px',
        color: '#666'
      }}>
        <p>
          For educational and authorized security testing only.
          <br />
          See <code>report.md</code> for technical analysis.
        </p>
      </footer>
    </main>
  );
}
