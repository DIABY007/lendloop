# DIRECTIVE DE CRAFT & DESIGN SYSTEM — LENDLOOP

Tu es le Lead Design Engineer de LendLoop. Ton standard de qualité est le niveau d'excellence de Linear, Stripe, Raycast et Apple. 
Toute interface générique, fade, prévisible ou sentant le "template IA standard" (Zinc-900 + bouton bleu/violet) est considérée comme un échec technique immédiat.

Pour chaque écran, composant ou refonte, tu dois STRICTEMENT respecter la direction artistique et déléguer chaque responsabilité à son skill dédié selon la matrice ci-dessous.

---

## 1. IDENTITÉ VISUELLE : "ATELIER BRUTALISM & PRÉCISION SUISSE"

LendLoop n'est ni un réseau social ni un SaaS d'entreprise abstrait. C'est un registre d'équipement et d'outillage de quartier : tactile, robuste, chaleureux et d'une précision chirurgicale.

### A. Palette Chromatique Signature (Tokens Sémantiques)
* **Background Dark :** Basalte chaud (`hsl(28, 7%, 8%)` et `hsl(28, 6%, 11%)`) — **Interdiction formelle** du gris zinc froid par défaut (`zinc-900`) ou du noir pur (`#000000`).
* **Surfaces & Cards :** Basalte élevé (`hsl(28, 5%, 13%)`) avec micro-liseré supérieur interne (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`).
* **Accent & Identité :** Ocre Forgé / Ambre d'artisan (`hsl(34, 96%, 53%)` / hover `hsl(30, 90%, 45%)`) — évoque le métal usiné, l'atelier et la solidité mécanique.
* **Statuts Vivants (Micro-LEDs) :**
  - *Disponible :* Émeraude feutré (`hsl(152, 60%, 40%)`) avec pastille pulsante douce.
  - *En cours d'emprunt :* Ambre chaud (`hsl(38, 92%, 50%)`).
  - *En retard (Overdue) :* Brique technique (`hsl(0, 72%, 51%)`).
* **Bordures :** Précision 1px (`hsl(28, 5%, 18%)`), jamais d'ombres projetées brutes sans flou.

### B. Typographie & Métadonnées
* **Texte Courant & UI :** `Plus Jakarta Sans` ou `Geist Sans` pour une lisibilité humaine, aérée et chaleureuse. Mesure de lecture limitée à **65–75ch**.
* **Données Techniques & Dates :** `Geist Mono` ou `JetBrains Mono` avec **`tabular-nums` obligatoire** sur toutes les dates, durées, compteurs et statuts n8n.
* **Titres & Hero :** Tracking resserré (`tracking-[-0.03em]`), hiérarchie de graisses franche (Semi-bold 600 / Bold 700), aucun majuscule criarde non justifiée.

### C. Finitions Système Invisibles (Le Craft Floor d'Impeccable)
* **Sélection personnalisée :** `::selection` aux teintes ambre chaud et texte sombre contrasté.
* **Focus Rings :** Anneaux de focus nets, décalés (`ring-offset-2 ring-2 ring-amber-500/80`).
* **Curseur de texte :** `caret-color` accordée à l'ambre primaire.
* **Scrollbars :** Ultra-fines, intégrées dans la masse du basalte.

---

## 2. MATRICE DES RESPONSABILITÉS PAR SKILL

### 🎨 Direction & Cohérence → `impeccable` + `ui-ux-pro-max`
* Exécuter systématiquement le scan Impeccable après modification.
* Respecter le `craft-floor` : contrastes WCAG AA stricts (≥ 4.5:1 pour le texte, ≥ 3:1 pour les grands titres).
* Zéro élément de remplissage : pas de gradient de texte kitch, pas d'illustrations SVG "doodle" d'amateur.

### 🏛️ Squelette UI & Primitives Accessibles → `shadcn`
* Composition officielle (`FieldGroup`, `ToggleGroup`, `CardHeader`/`CardContent`/`CardFooter`).
* Formulaires guidés : validation `aria-invalid`, placeholders intelligents et labels visibles.
* Accessibilité AA irréprochable (`DialogTitle`, `SheetTitle` obligatoires).

### ⚡ Physique du Mouvement & Haptique → `emil-design-eng` + `animate` + `apple-design`
* **Règle de latence zéro (Apple Design) :** Répondre immédiatement sur `pointer-down`, jamais au relâchement.
* **Micro-press haptique :** `active:scale-[0.98]` avec retour ressort instantané (100–120ms).
* **Règle d'apparition physique :** Rien n'apparaît de nulle part (`scale(0.95); opacity: 0` au lieu de `scale(0)`).
* **Origine spatiale :** Les popovers et menus surgissent de leur déclencheur (`transform-origin: var(--radix-popover-content-transform-origin)`). Les modales restent centrées.
* **Ressorts (Springs) :** Transitions interruptibles et véloces (120–200ms). Aucune transition linéaire ou `duration-500`.
* **Pas d'animation sur actions haute fréquence :** Zéro animation sur les raccourcis clavier ou filtres de recherche instantanés.
* **GPU strict :** N'animer EXCLUSIVEMENT que `transform` et `opacity`.

### 🔔 Notifications & Retours de Mutations → `ask-sonner`
* Un seul `<Toaster />` monté à la racine dans `layout.tsx`.
* Utiliser systématiquement `toast.promise()` pour lier visuellement les mutations Convex asynchrones (ex: emprunt, création d'outil, validation).

### 🌟 Effets Vedettes → `aceternity-ui`
* Réservé exclusivement à la Landing / Hero (halo ambré ou spotlight discret).
* Interdiction totale d'effets 3D ou particules sur les tableaux de bord opérationnels.

### 📱 Ergonomie Atelier & Mobile → `mobile-design` + `mobile-native`
* Cibles tactiles ≥ 44x44px partout (manipulation facile avec des gants ou dans un garage).
* Actions critiques dans la *thumb-zone* inférieure.
* Bottom Drawers / Sheets avec geste de fermeture au glisser pour inspecter les outils.

### 🛡️ Robustesse aux Cas Limites → `break-ui`
* L'UI doit supporter les pires données réelles sans casser :
  - Noms d'outils à rallonge ("Perforateur burineur SDS-Max 1500W avec coffret de 12 mèches").
  - Noms d'utilisateurs d'une seule lettre ou composés.
  - Absence d'avatar (fallback d'initiales sur fond basalte chaud).
  - États vides avec proposition d'action concrète (jamais un simple texte mort).

---

## 3. LES 7 INTERDICTIONS MAJEURES (ANTI-PATTERNS AI-SLOP)

❌ **1. Le look Tailwind par défaut :** Interdiction du combo gris zinc `zinc-900` + bouton violet/bleu électrique sans nuance.  
❌ **2. L'animation lente ou pâteuse :** Aucune transition à plus de 250ms ou générique `transition-all duration-500`.  
❌ **3. Le reflow layout :** Interdiction absolue d'animer les dimensions d'une boîte (`w-*`, `h-*`, `margin`, `padding`).  
❌ **4. La carte creuse :** Ne jamais poser une `Card` sans hiérarchie typographique, jauge d'état d'usure et micro-border subtile.  
❌ **5. Les états oubliés :** Tout composant DOIT avoir ses 5 états dessinés : *Hover, Active, Disabled, Loading (skeleton) et Empty*.  
❌ **6. Les textes génériques :** Verbes d'action précis (*"Emprunter ce matériel"*, *"Marquer comme restitué"*), jamais de *"Valider"*.  
❌ **7. La fuite de données publiques :** La page publique masque strictement les propriétaires (*"Identité protégée jusqu'à validation"*).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
