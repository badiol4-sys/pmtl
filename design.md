# Design Guidelines - Tony Lainé App

## Brand Identity
- **École**: Tony Lainé
- **Purpose**: Gestion complète d'école - animateurs, enseignants, parents
- **Vibe**: Corporatif professionnel + touches ludiques (école)

## Color Palette
- **Primary**: `#1e40af` - Bleu professionnel (confiance, sérieux)
- **Secondary**: `#f97316` - Orange ludique (énergie, accueil)
- **Accent**: `#16a34a` - Vert école (croissance, bien-être)
- **Neutral**: `#f8fafc` (bg light), `#1e293b` (text dark)
- **Status**: 
  - Success: `#16a34a`
  - Warning: `#ea580c`
  - Error: `#dc2626`
  - Info: `#0284c7`

## Typography
- **Display/Headers** (h1, h2, h3): Poppins Bold 700
- **Body text**: Inter Regular 400
- **Buttons/CTA**: Poppins Semi-bold 600
- **Line height**: 1.5 (body), 1.3 (headers)
- **Font sizes**:
  - h1: 32px
  - h2: 24px
  - h3: 18px
  - body: 14px
  - small: 12px

## Layout & Spacing
- **Grid**: 12 columns, mobile-first responsive
- **Padding**: 16px, 24px, 32px, 48px (multiples of 8)
- **Gaps**: 12px (tight), 16px (normal), 24px (generous)
- **Max width**: 1280px
- **Mobile breakpoint**: 768px

## Components
### Cards (Enfants, Messages)
- Border: 1px `#e2e8f0`
- Border-radius: 8px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Hover: lift up 2px, shadow increase
- Background: white

### Buttons
- Primary: bg-blue-600, text-white, hover bg-blue-700
- Secondary: bg-gray-200, text-gray-800, hover bg-gray-300
- Danger: bg-red-600, text-white
- Size: 12px padding-y, 16px padding-x

### Input Fields
- Border: 1px `#e2e8f0`
- Border-radius: 6px
- Padding: 8px 12px
- Focus: blue border + light blue bg
- Label: Poppins 600, 12px, margin-bottom 6px

### Icons
- Ludique mais professionnelle (Lucide React)
- Couleurs primaires/accents
- Size: 20px (normal), 24px (buttons), 16px (inline)

## Layouts by Role
### Animateur
- Sidebar navigation (dark blue)
- Main content: white bg
- Cards enfants avec classe color-coded
- Upload zone prominent (orange accent)

### Enseignant
- Minimal sidebar (focus sur contenu)
- Liste ses élèves avec avatars
- Section upload créations

### Parent
- Mobile-first responsive
- Enfant(s) en avant
- Créations en grid
- Messagerie bottom sticky

### Admin (Directrice/ALSH)
- Dashboard: stats cards
- Tables données globales
- Export options

## Motion & Interactions
- Page load: fade in + slide up (staggered)
- Button hover: color shift 100ms
- Form validation: inline error red, smooth show
- Message appear: slide in from bottom
- Notification: toast top-right, 4s auto-dismiss

## Anti-patterns à Éviter
- Pas de Purple gradients
- Pas de rounded corners excessifs (max 8px)
- Pas d'interactions scattered (une seule animation cohérente par page)
- Pas de couleurs trop acidulées (rester pro)

## Accessibility
- Color contrast: WCAG AA minimum
- Focus states: visible blue ring
- Alt text: tous les images
- ARIA labels: forms, buttons
- Keyboard navigation: Tab order logique
