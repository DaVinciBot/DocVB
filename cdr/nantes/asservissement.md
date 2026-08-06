# Asservissement & Correcteur PID

*Support de cours — Coupe de France de Robotique*

---

## 1. L'asservissement, c'est quoi ?

### 1.1 Le problème de base

Tu veux que ton robot avance de 1 mètre. Tu envoies une commande aux moteurs pendant une certaine durée. Problème : le sol n'est pas parfaitement plat, les deux moteurs ne sont pas identiques, la batterie se décharge... Résultat : le robot avance de 94 cm et part légèrement à gauche.

**L'asservissement, c'est le fait de mesurer ce que fait réellement le robot et de corriger en permanence la commande pour coller à ce qu'on veut.**

On appelle ça une **boucle fermée** (par opposition à la boucle ouverte où on envoie une commande sans vérifier ce qui se passe).

```
          ┌─────────────┐        ┌──────────┐        ┌──────────┐
Consigne  │             │Commande │          │ Action  │          │  Mesure
─────────►│  Correcteur ├────────►  Actionneur├────────►  Système ├────────┐
          │   (PID)     │        │ (moteurs) │        │ (robot)  │        │
          └──────┬──────┘        └──────────┘        └──────────┘        │
                 │                                                         │
                 │ Erreur                            ┌──────────┐         │
                 └───────────────────────────────────┤ Capteurs │◄────────┘
                                                     └──────────┘
```

### 1.2 Le vocabulaire de base

| Terme                   | Définition                                    |
| ----------------------- | --------------------------------------------- |
| **Consigne** (setpoint) | Ce qu'on veut atteindre (ex : 1000 mm)        |
| **Mesure**              | Ce que les capteurs nous disent (ex : 940 mm) |
| **Erreur**              | Consigne − Mesure (ex : 60 mm)                |
| **Commande**            | Ce qu'on envoie aux actionneurs pour corriger |
| **Actionneur**          | Ce qui agit sur le système (moteurs, servos…) |

### 1.3 Les capteurs utilisés en robotique

Pour asservir, il faut mesurer. Voici les capteurs les plus courants :

#### Roues odométriques + encodeurs

C'est la solution de référence pour mesurer le déplacement d'un robot différentiel.

Une **roue odométrique** est une petite roue libre (non motrice) qui traîne sur le sol. Elle n'est soumise à aucun couple moteur, donc elle ne glisse pas — contrairement aux roues de traction. Un encodeur est fixé sur son axe.

L'encodeur génère des **impulsions** (tops) à chaque fraction de tour de la roue. On compte les tops → on connaît la distance parcourue et la vitesse.

**Résolution** : exprimée en tops/tour (PPR — Pulses Per Revolution).

Exemple : roue odométrique de 60 mm de diamètre, encodeur 1024 PPR :

```
Périmètre = π × 60 mm ≈ 188,5 mm
Résolution = 188,5 / 1024 ≈ 0,184 mm par top
```

En pratique on place **deux roues odométriques** : une pour chaque côté (ou une latérale). Cela permet de mesurer à la fois la translation et la rotation du robot.

> **Pourquoi pas directement sur les roues motrices ?**
> Les roues motrices peuvent glisser (démarrage brutal, virage serré). La roue odométrique, libre de tout couple, reste en contact franc avec le sol et ne glisse pas.

#### IMU (Centrale Inertielle)

- Contient un **gyroscope** (vitesse angulaire) et un **accéléromètre**
- Permet de mesurer l'angle absolu du robot
- Utile pour l'asservissement en cap (orientation)
- **Attention : dérive** sur le long terme → à coupler avec l'odométrie

#### Capteur optique (type capteur de souris)

Un capteur de souris optique (ex : PMW3360, ADNS-9800) filme le sol à très haute fréquence et analyse le déplacement des textures par corrélation d'image. Il donne directement un **déplacement en X et Y** en unités arbitraires (counts), sans contact mécanique.

**Avantages par rapport aux encodeurs :**

- Pas de pièce mécanique en contact → pas d'usure, pas de jeu
- Mesure directe sur le sol → insensible au glissement des roues
- Résolution très élevée (jusqu'à plusieurs milliers de CPI — Counts Per Inch)

**Limites :**

- Sensible à la hauteur de montage (doit rester à distance fixe et faible du sol, typiquement 2–3 mm)
- Peut perdre le tracking sur des sols très lisses, brillants ou uniformes
- Donne un déplacement relatif, pas une position absolue → il faut intégrer comme les encodeurs

**Conversion :** on calibre empiriquement le nombre de counts pour une distance connue (ex : 1000 counts = 25 mm).

---

## 2. Le correcteur PID

Le PID (Proportionnel - Intégral - Dérivé) est le correcteur le plus utilisé en robotique amateur et industriel. Il calcule la commande à appliquer en fonction de l'erreur actuelle, passée et future (estimée).

### 2.1 Les trois termes

Soit `e(t)` l'erreur à l'instant `t` = Consigne − Mesure.

#### P — Proportionnel

```
sortie_P = Kp × e(t)
```

- Réagit **proportionnellement** à l'erreur actuelle
- Plus l'erreur est grande, plus la correction est forte
- **Seul**, il laisse souvent une erreur statique résiduelle (le robot s'arrête avant la consigne)

#### I — Intégral

```
sortie_I = Ki × ∫e(t)dt    ≈    Ki × somme des erreurs × dt
```

- Accumule l'erreur au fil du temps
- Permet d'**éliminer l'erreur statique** : tant que l'erreur n'est pas nulle, la sortie augmente
- **Attention :** peut provoquer un dépassement (overshoot) et de l'instabilité si trop fort

> **Notation alternative**
> On rencontre souvent **Ti** (temps intégral) à la place de Ki, avec `Ki = 1/Ti`. Diminuer Ti revient à augmenter l'action intégrale. Les deux notations coexistent — vérifier laquelle ton implémentation utilise.

#### D — Dérivé

```
sortie_D = Kd × de(t)/dt    ≈    Kd × (e(t) - e(t-1)) / dt
```

- Réagit à la **vitesse de variation** de l'erreur
- Freine la correction quand l'erreur diminue vite → **amortit les oscillations**
- **Sensible au bruit** des capteurs (amplifie les variations rapides)

> **⚠ Dériver la mesure, pas l'erreur**
> En pratique, on calcule toujours la dérivée sur la **mesure y** (pas sur l'erreur e). Si on dérivait l'erreur, tout changement brusque de consigne provoquerait un pic de commande violent ("derivative kick"). En dérivant y, le changement de consigne n'affecte pas le terme D.

#### Commande totale

```
commande(t) = Kp × e(t) + Ki × ∫e(t)dt + Kd × de(t)/dt
```

> **Important :** le PID doit être appelé à **intervalle de temps fixe** (dt constant). Un correcteur appelé à fréquence irrégulière donne des résultats erratiques et des gains qui ne veulent plus rien dire.

---

### 2.2 Fréquence d'échantillonnage

Le choix de la fréquence d'appel du PID est aussi important que le réglage des gains. Règle générale :

```
fs ≥ 10 × bande passante utile du système
```

| Type de système                         | Fréquence recommandée |
| --------------------------------------- | --------------------- |
| Moteur DC (robotique)                   | 100 – 500 Hz          |
| Thermique (régulation de température)   | 1 – 5 Hz              |
| Boucle de position (cascade extérieure) | 10 – 50 Hz            |
| Boucle de vitesse (cascade intérieure)  | 100 – 500 Hz          |

> **Bonne pratique — double boucle**
> La boucle vitesse doit tourner 5 à 10 fois plus vite que la boucle position. Si la vitesse tourne à 200 Hz, la position peut tourner à 20–40 Hz.

---

### 2.3 Filtre sur le terme dérivé

Le terme D amplifie naturellement le bruit des capteurs. On lui applique systématiquement un **filtre passe-bas du premier ordre**, caractérisé par un facteur **N** (coefficient de filtrage) :

```
Df[k] = (Df[k-1] + Td × (-dy[k])) / (1 + N × Ts)

avec :
  dy[k]  = (y[k] - y[k-1]) / Ts   (dérivée de la mesure)
  N      ≈ 5 à 30                  (plus N est petit, plus le filtrage est fort)
  Ts     = période d'échantillonnage
```

| Valeur de N     | Effet                                                       |
| --------------- | ----------------------------------------------------------- |
| N grand (20–30) | Peu de filtrage, réponse dérivée rapide, sensible au bruit  |
| N moyen (10–15) | Bon compromis, recommandé en première approche              |
| N petit (5–8)   | Filtrage fort, réponse dérivée lente, peu sensible au bruit |

---

## 3. Réglage du PID (Tuning)

### 3.1 Méthode Quick & Dirty (terrain)

Méthode empirique, rapide, suffisante pour la plupart des cas en compétition.

**Étape 1 — Partir de zéro**

```
Kp = 0  |  Ki = 0  |  Kd = 0
```

**Étape 2 — Régler Kp**

- Augmenter Kp progressivement
- Le robot commence à réagir à l'erreur
- Continuer jusqu'à ce que le robot **oscille / tremble** autour de la consigne
- Reculer légèrement : `Kp ≈ 0.5 × Kp_oscillation`

**Étape 3 — Régler Kd**

- Augmenter Kd progressivement
- L'amortissement augmente, les oscillations disparaissent
- S'arrêter dès que le système est stable et réactif
- Trop de Kd → réponse lente, sensibilité au bruit

**Étape 4 — Régler Ki (si nécessaire)**

- Vérifier s'il y a une erreur statique résiduelle (le robot ne rejoint pas exactement la consigne)
- Augmenter Ki très doucement jusqu'à ce que l'erreur disparaisse
- Trop de Ki → dépassement et oscillations lentes

**Résumé des effets**

| Paramètre   | ↑ Réactivité | ↑ Stabilité | ↑ Précision statique | Risque principal         |
| ----------- | ------------ | ----------- | -------------------- | ------------------------ |
| Kp ↑        | ✅            | ❌           | ~                    | Oscillations             |
| Ki ↑ (Ti ↓) | ~            | ❌           | ✅                    | Dépassement, instabilité |
| Kd ↑        | ~            | ✅           | ~                    | Bruit amplifié           |

---

### 3.2 Méthode Ziegler-Nichols (boucle fermée)

Méthode systématique et reproductible. Elle repose sur la caractérisation du système avant de calculer les gains.

**Étape 1 — Trouver le gain critique Ku**

Avec `Ki = 0` et `Kd = 0`, augmenter Kp jusqu'à obtenir des **oscillations soutenues et régulières** (ni croissantes, ni décroissantes). Ce gain est appelé **Ku** (Ultimate Gain).

**Étape 2 — Mesurer la période critique Tu**

Mesurer la **période des oscillations** (temps entre deux pics) : c'est **Tu**.

**Étape 3 — Appliquer les formules**

| Type de correcteur | Kp          | Ki (ou Ti)      | Kd (ou Td)    |
| ------------------ | ----------- | --------------- | ------------- |
| P seul             | `0.5 × Ku`  | 0               | 0             |
| PI                 | `0.45 × Ku` | `Ti = Tu / 1.2` | 0             |
| PID complet        | `0.6 × Ku`  | `Ti = Tu / 2`   | `Td = Tu / 8` |

> **⚠ Avertissement pratique**
> Cette méthode suppose que le système peut atteindre des oscillations soutenues sans danger mécanique. Sur un vrai robot contre ses butées, c'est risqué. En compétition, on préfère souvent rester en Quick & Dirty. Les valeurs Z-N sont un **point de départ** — à adoucir ensuite.

---

### 3.3 Méthode Ziegler-Nichols (réponse indicielle)

Alternative à la méthode boucle fermée. On applique un **échelon d'entrée** (commande fixe) au système à l'arrêt et on observe la réponse.

- **L** : temps mort (délai avant que la sortie ne commence à bouger)
- **T** : constante de temps (pente de la montée, modèle FOPDT)

On applique ensuite les abaques Z-N pour ce modèle. Utile quand on ne peut pas monter jusqu'aux oscillations soutenues.

---

### 3.4 Méthode Cohen-Coon

Variante de Z-N réponse indicielle, plus adaptée quand le **temps mort est significatif** par rapport à la constante de temps (θ/τ élevé). Elle donne des réglages initiaux souvent moins agressifs que Z-N. Procédure identique à Z-N indicielle, mais avec des abaques différents. À affiner in situ (réduire l'agressivité si dépassement trop important).

**Comparatif des méthodes de réglage**

| Méthode           | Reproductible | Rapide | Risque mécanique | Adapté compétition   |
| ----------------- | ------------- | ------ | ---------------- | -------------------- |
| Quick & Dirty     | ❌             | ✅      | Faible           | ✅                    |
| Z-N boucle fermée | ✅             | ❌      | Possible         | ~                    |
| Z-N indicielle    | ✅             | ~      | Faible           | ~                    |
| Cohen-Coon        | ✅             | ~      | Faible           | ~ (temps mort élevé) |

---

## 4. Problèmes courants et solutions

### Integrator Windup

**Problème :** Le terme intégral accumule une erreur énorme (ex : quand le robot est bloqué contre un mur), puis quand il repart, il dépasse massivement la consigne.

**Solution — Borner l'intégrale (clipping) :** On définit une valeur maximale pour l'intégrale. Dès qu'on atteint cette borne, on arrête d'accumuler.

**Solution — Anti-windup back-calculation (méthode robuste) :** On compare la commande calculée et la commande réellement appliquée (saturée). La différence est réinjectée dans l'intégrateur avec un gain Kaw pour le corriger.

```
u_brut  = PID calculé
u_sat   = constrain(u_brut, Umin, Umax)   // commande réellement appliquée
I_state += Kaw × (u_sat - u_brut)          // correction de l'intégrateur

Kaw ≈ 0.3 à 1.0 — à ajuster selon le système
```

> **Règle pratique :** Tant que la commande n'est pas saturée, `u_sat = u_brut` et la correction est nulle. Le mécanisme ne s'active qu'en cas de saturation effective.

### Bruit sur le terme dérivé

**Problème :** Les capteurs ont du bruit → la dérivée oscille violemment car elle amplifie les variations rapides.

**Solutions :**

- Dériver sur la mesure y et non sur l'erreur e (évite les pics liés aux changements de consigne)
- Appliquer le filtre passe-bas avec le facteur N (voir section 2.3)
- Lisser la mesure en amont (moyenne glissante sur 2–4 échantillons)

### Déviation mécanique et centre de masse

**Problème :** Le robot tire systématiquement d'un côté malgré un tuning soigné. Le terme I compense, mais il est constamment sollicité.

**Cause probable :** un centre de masse décentré latéralement crée une asymétrie de frottement — un côté porte plus de poids et résiste plus. Un robot lourd ou à inertie élevée (centre de masse haut ou éloigné des roues) répondra aussi plus lentement aux corrections.

> **⚠ Règle d'or :** corriger le mécanique avant le logiciel. Si la déviation persiste, un offset fixe sur la commande d'un côté peut compenser — mais c'est un palliatif, pas une solution.

### Saturation de la commande

**Problème :** Le PID calcule une commande hors des limites physiques (ex : au-delà du PWM max du moteur).

**Solution :** Clipper la sortie entre les bornes min/max, et ne plus accumuler l'intégrale quand on est en saturation (lié au windup).

---

## 5. Application en robotique mobile

### Asservissement en vitesse

- **Consigne :** vitesse souhaitée (mm/s ou RPM)
- **Mesure :** vitesse mesurée via les roues odométriques ou le capteur optique (distance / dt)
- **Commande :** consigne moteur (PWM ou courant)

### Asservissement en position

- **Consigne :** position cible (mm)
- **Mesure :** position actuelle (intégration des déplacements mesurés)
- **Commande :** vitesse consigne (puis asservissement en vitesse en cascade)

### Double boucle (cascade)

Architecture recommandée pour un robot précis :

```
Position (consigne) → [PID position] → Vitesse (consigne) → [PID vitesse] → Moteur
                        (lente)                                (rapide)
```

Règles de conception pour la cascade :

- La boucle vitesse doit être **5 à 10 fois plus rapide** que la boucle position
- On règle toujours la **boucle intérieure (vitesse) en premier**, boucle extérieure (position) ensuite
- La boucle position envoie une consigne de vitesse à la boucle vitesse — jamais directement une commande moteur

---

## Résumé

```
1. Mesurer l'erreur         →  e = consigne - mesure
2. Calculer P               →  Kp × e
3. Calculer I               →  Ki × somme(e × dt)  [avec anti-windup]
4. Calculer D               →  filtre sur dérivée de y  [facteur N]
5. Appliquer la commande    →  cmd = P + I + D  (clippé)
6. Répéter à intervalle fixe
```

**Ordre de réglage :** d'abord Kp → puis Kd → enfin Ki (si vraiment nécessaire). Ne jamais commencer par Ki.

---

*Pour aller plus loin : contrôle en cascade, feedforward, LQR, filtres de Kalman.*
