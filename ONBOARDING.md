# Onboarding Guide - Tony Lainé App

## Pour la Directrice / Administrateur

### Phase 1: Configuration Initiale

1. **Créer les Classes**
   - Accès: Admin Dashboard
   - Créer CP, CE1, CE2, CM1, CM2, etc.
   - Créer "Pause Méridienne" groupes (A, B, C)
   - Créer groupe "ALSH"

2. **Ajouter les Enseignants**
   - Donner à chaque enseignant:
     - Prénom (pour login 3-étapes)
     - Code général: **TL2026**
     - Mot de passe personnel unique
   - Les enseignants accèdent avec: Code général → Prénom → Password perso

3. **Ajouter les Animateurs**
   - Email unique pour chaque
   - Mot de passe
   - Notifier par email (template fourni)

4. **Ajouter les Parents**
   - Opcional: créer manuellement ou attendre PDF import
   - Téléphone + Mot de passe
   - Email (pour notifications)

### Phase 2: Upload Listes Classe

1. **Préparer PDFs**
   - Format: une liste par classe
   - Colonnes: `Élève` | `Tél Parent`
   - Exemple:
     ```
     Élève                  Tél Parent
     Marie Dupont          +33612345678
     Pierre Bernard        +33687654321
     ```

2. **Uploader via Animateur**
   - Animateur → "Importer PDF"
   - Sélectionner classe
   - Choisir PDF
   - L'IA extrait noms + téléphones
   - Enfants créés automatiquement
   - Parents auto-assignés (déduplication par tél)

3. **Vérifier Import**
   - Contrôler dans Dashboard → Enfants
   - Voir codes parents générés
   - Notifier parents de leurs identifiants

### Phase 3: Lancer le Service

1. **Envoyer Accès aux Parents**
   - Email template avec:
     - URL login
     - Identifiant: Téléphone OU Email
     - Mot de passe temporaire
     - Lien documentation

2. **Former les Animateurs**
   - Où uploader créations
   - Comment noter comportements
   - Comment envoyer messages
   - FAQ rapide

3. **Former les Enseignants**
   - Connexion 3-étapes (rappel)
   - Comment uploader créations
   - Messagerie avec parents
   - Confidentialité des données

---

## Pour les Animateurs

### Tâches Quotidiennes

#### Matin
1. **Accueil**
   - Marquer présents/absents
   - Documenter arrivées

2. **Pause Méridienne**
   - Superviser enfants
   - Noter observations
   - Prendre photos/vidéos des créations

3. **Soir**
   - Uploader créations du jour
   - Ajouter notes comportement
   - Répondre aux parents

#### Upload Créations
```
Naviguer → Uploads
Sélectionner enfant
Ajouter fichier (image/vidéo/PDF)
Ajouter titre (ex: "Dessin libre - 7 mai")
Sauvegarder
```

#### Ajouter Notes Comportement
```
Naviguer → Notes Comportement
Sélectionner enfant
Catégorie: Positive / Neutral / Concern
Écrire observation (ex: "Très coopératif, aidé un camarade")
Sauvegarder
```

#### Messagerie
```
Messages → Sélectionner parent
Envoyer:
  - Message texte
  - Audio (appuyer Micro, enregistrer)
  - Photo
Destinataire voit notification
```

---

## Pour les Enseignants

### Tâches

#### Se Connecter (3 étapes)
1. Entrer code général: `TL2026`
2. Entrer votre prénom (ex: Marie)
3. Entrer votre mot de passe personnel

#### Voir ses Élèves
```
Dashboard → Mes Élèves
Voir tous élèves de la classe
Cliquer pour détails
```

#### Uploader Créations Scolaires
```
Dashboard → Uploader Créations
Sélectionner élève
Ajouter fichier (dessin, évaluation, etc.)
Ajouter titre (ex: "Rédaction histoire")
Sauvegarder
```

#### Communiquer avec Parents
```
Messages → Nouveau message
Chercher parent
Envoyer message (texte ou audio)
Parents reçoivent notification
```

#### Notes et Observations
- Pas d'accès direct à notes comportement (réservé animateurs)
- Peut commenter via messages si besoin spécifique

---

## Pour les Parents

### Accès Initial

**Identifiant:**
- Téléphone: `+33612345678` OU
- Email: `jean.dupont@example.com`

**Password:** Fourni par directrice

**Première connexion:**
1. Aller sur `https://school.tonylaine.fr/login`
2. Sélectionner "Parent"
3. Entrer téléphone/email
4. Entrer mot de passe
5. Cliquer "Se connecter"

### Écran Principal

**Voir les enfants:**
```
Affiche tous vos enfants (un parent peut avoir plusieurs enfants)
Cliquer sur enfant pour voir ses infos
```

**Pour chaque enfant:**
- Créations (dessins, travaux scolaires)
- Notes comportement (par animateurs)
- Messages non-lus
- Dernier update

### Actions

#### Consulter Créations
```
Cliquer sur enfant
Voir galerie
Cliquer image → Voir en grand
Partager/sauvegarder possible
```

#### Lire Notes Comportement
```
Cliquer sur enfant
Onglet "Notes"
Voir observations animateurs
Dates et catégories (Positive/Neutral/Concern)
```

#### Envoyer Message
```
Cliquer sur enfant
"Envoyer un message"
Sélectionner destinataire:
  - Animateurs
  - Enseignant
Écrire message ou enregistrer audio
Envoyer
```

#### Recevoir Notifications
- Notification in-app (cloche icône)
- Notification téléphone (si push activé)
- Email (optionnel)

### FAQs Parents

**Q: Je ne vois qu'un enfant, mais j'en ai deux à l'école**
A: Le système peut auto-créer parent code si même numéro tél. Vérifiez avec directrice que les deux enfants sont liés au même numéro de téléphone.

**Q: Comment réinitialiser mot de passe?**
A: Contacter directrice (pas encore d'auto-reset en prod)

**Q: Peux-je télécharger les créations?**
A: Oui, bouton "Télécharger" sur chaque création

**Q: Les animations sont-elles visibles en dehors de l'école?**
A: Oui! Accès 24/24 depuis n'importe quel appareil (si connecté internet)

---

## Timeline Recommandée

### Semaine 1: Configuration
- [ ] Créer classes
- [ ] Ajouter enseignants
- [ ] Ajouter animateurs
- [ ] Tester authentification

### Semaine 2: Import Données
- [ ] Préparer PDFs
- [ ] Importer listes classes
- [ ] Vérifier codes parents
- [ ] Créer parents manuellement si besoin

### Semaine 3: Formation
- [ ] Formation animateurs (uploads, notes, messages)
- [ ] Formation enseignants (connexion, uploads)
- [ ] Formation parents (consultation, messages)

### Semaine 4: Lancer
- [ ] Envoi emails accès à tous les parents
- [ ] Support utilisateurs
- [ ] Monitoring système
- [ ] Collecte feedback

---

## Support & Problèmes Courants

**Problème: Parent ne reçoit pas identifiants**
→ Vérifier email fourni, checker spam, renvoyer email

**Problème: Enfant dans une classe mais pas dans une autre**
→ Vérifier que l'enfant est bien dans la bonne classe (un enfant par classe)

**Problème: Mot de passe oublié**
→ Admin doit réinitialiser en DB (ou via dashboard après implémentation reset)

**Problème: Fichier ne s'upload pas**
→ Vérifier format/taille (<50MB)
→ Vérifier connexion internet
→ Rafraîchir page et réessayer

**Problème: Animateur ne voit pas enfants**
→ Vérifier que animateur a accès à la classe
→ Vérifier enfants bien créés (via PDF import)

---

## Contacts & Documentation

- **Tech Support**: [dev email]
- **Feature Requests**: [project management]
- **Documentation**: Cette app même (Help menu)
- **Bug Reports**: [github/email]

---

**Version**: 1.0  
**Date**: May 2026  
**Next Update**: [à déterminer]
