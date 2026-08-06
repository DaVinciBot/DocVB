# Cinématique Holonome (3 Roues)

*Support de cours — Coupe de France de Robotique (spécificité Nantes)*

---

## 1. Le problème de base

Un robot différentiel (deux roues motrices) ne peut pas se déplacer latéralement : pour aller à droite, il doit d'abord tourner vers la droite, puis avancer. Sur une table de match encombrée, cette contrainte est pénalisante.

Un robot **holonome** résout ce problème : il peut se déplacer dans **n'importe quelle direction**, indépendamment de son orientation. Il peut avancer, reculer, strafe (glisser latéralement), et tourner sur lui-même — ou combiner tout ça simultanément.

**La question c'est : comment commander trois roues pour obtenir exactement le mouvement voulu dans le repère du terrain ?**

Ce n'est pas trivial : chaque roue contribue simultanément au mouvement en x, en y et en rotation. Il faut une formule qui **décompose** la commande globale `(Vx, Vy, Ω)` en consignes individuelles pour chaque roue — c'est la **cinématique inverse**.

Et pour l'odométrie, il faut faire l'inverse : reconstruire la position du robot à partir de ce que chaque roue a parcouru — c'est la **cinématique directe**.

---

## 2. La roue omnidirectionnelle

Une roue omnidirectionnelle (roue omni ou roue suédoise) est une roue motrice qui peut **aussi glisser latéralement**, grâce à des rouleaux passifs montés perpendiculairement sur son pourtour.

```
    ┌──────────────────┐
    │  ● ● ● ● ● ● ●  │   ← rouleaux passifs (roulent librement)
    └──────────────────┘
           ↕ direction motrice
```

- Dans la direction de la roue : elle transmet une force (comme une roue classique)
- Perpendiculairement : les rouleaux tournent librement → aucune résistance latérale

**C'est cette propriété qui permet à un robot holonome de combiner déplacement et rotation simultanément.** Sans rouleaux, les roues résisteraient au mouvement latéral et le blocage mécanique empêcherait le déplacement omnidirectionnel.

> **Spécificité Nantes :** le robot utilise des roues omni de 60 mm de diamètre avec des rouleaux en plastique. Sur une surface lisse (toile de match), l'adhérence dans la direction motrice est correcte. Sur les bords de la table ou des zones texturées, le glissement peut varier — ce qui justifie la fusion capteurs du filtre de Kalman.

---

## 3. Configuration physique : 3 roues à 120°

Le robot holonome Nantes dispose de **trois roues** disposées à 120° les unes des autres autour du centre du robot, à équidistance `d` du centre.

```
         Y+ (avant)
          ^
          |
[W2 240°] | [W1 120°]
          |
X- ───────+──────── X+
          |
      [W3 0°]
          |
         Y- (arrière)
```

| Roue   | Notation Poivron | Position physique | Angle cinématique |
| ------ | ---------------- | ----------------- | ----------------- |
| **W1** | V_AF             | Avant-Droite      | 120°              |
| **W2** | V_BF             | Avant-Gauche      | 240°              |
| **W3** | V_CF             | Arrière           | 0°                |

> **Pourquoi 120° ?** C'est la répartition angulaire la plus équilibrée pour 3 roues. Elle garantit que la somme des forces est nulle pour n'importe quelle direction de mouvement, et que le robot peut générer une force équivalente dans toutes les directions sans "roue préférentielle".

---

## 4. Les deux référentiels

Avant d'écrire une seule équation, il faut distinguer deux repères :

| Repère           | Aussi appelé                  | Description                                                                                                 |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Repère Monde** | Repère terrain, repère absolu | Fixe par rapport à la table. L'axe X pointe dans une direction fixe indépendante de l'orientation du robot. |
| **Repère Robot** | Repère local                  | Lié au robot, tourne avec lui. L'axe Y pointe vers l'avant du robot.                                        |

Le PID travaille dans le repère Monde (consigne de position absolue). Les roues travaillent dans le repère Robot. **Il faut donc convertir entre les deux à chaque pas de calcul.**

La conversion se fait via la matrice de rotation d'angle θ (cap du robot) :

```
Vx_robot =  cos(θ) × Vx_monde + sin(θ) × Vy_monde
Vy_robot = -sin(θ) × Vx_monde + cos(θ) × Vy_monde
```

> Intuition : si le robot pointe vers Y+ (θ = 90°), avancer dans le monde (Vy_monde > 0) correspond à avancer dans le repère robot (Vy_robot > 0). Mais si le robot a tourné de 45°, la même commande monde se décompose différemment sur les axes locaux.

---

## 5. Cinématique directe — Des roues au mouvement

La cinématique directe répond à la question : **connaissant la vitesse de chaque roue, quel est le mouvement réel du robot ?**

C'est le point de départ mathématique — on l'établit en premier, et on inversera ces équations pour obtenir la cinématique inverse.

### 5.1 Contribution de chaque roue

Chaque roue omni, orientée à un angle αi par rapport à l'axe X du robot, contribue au mouvement global selon deux composantes :

- Elle "pousse" le robot dans sa direction motrice (projection)
- Elle ne contribue pas dans sa direction passive (rouleaux libres)

En projetant géométriquement la vitesse de chaque roue sur les axes du robot, on obtient les équations de cinématique directe. Pour notre configuration (W1 à 120°, W2 à 240°, W3 à 0°) :

```
Vx = ( 1/2) × W1 + ( 1/2) × W2 + (-1  ) × W3   } divisé par 3 après sommation
Vy = (-√3/2) × W1 + (√3/2) × W2 + ( 0  ) × W3
Ω  = -1/(3d) × (W1 + W2 + W3)
```

Ce qui donne le système :

```
Vx =  (1/3) × W1 + (1/3) × W2 - (2/3) × W3
Vy = -(√3/3) × W1 + (√3/3) × W2
Ω  = -1/(3d) × (W1 + W2 + W3)
```

où `d` est la distance entre le centre du robot et l'axe de chaque roue (rayon de la base).

> Intuition : si les trois roues tournent toutes à la même vitesse dans le même sens, les termes Vx et Vy s'annulent (symétrie), et seul Ω est non nul — le robot tourne sur lui-même. Si W1 = -W2 et W3 = 0, le robot se déplace latéralement. Les 120° garantissent exactement ces annulations.

### 5.2 Écriture matricielle

On réécrit ce système sous forme AX = Λ :

```
     A              X       Λ
┌              ┐ ┌    ┐   ┌    ┐
│  1/3  1/3 -2/3 │ │ W1 │   │ Vx │
│ -√3/3 √3/3  0  │ │ W2 │ = │ Vy │
│ -1/3d -1/3d -1/3d│ │ W3 │   │ Ω  │
└              ┘ └    ┘   └    ┘
```

Le déterminant de A est non nul (det(A) = 2√3 / 9d), ce qui garantit que le système est **inversible** — il existe bien une solution unique à la cinématique inverse.

---

## 6. Cinématique inverse — Du mouvement aux roues

La cinématique inverse répond à la question : **si je veux que le robot se déplace à (Vx, Vy) et tourne à Ω, à quelle vitesse dois-je faire tourner chaque roue ?**

### 6.1 Inversion par la règle de Cramer

On cherche X = A⁻¹ × Λ. Avec la règle de Cramer, on remplace successivement chaque colonne de A par le vecteur Λ, et on calcule le déterminant.

**Pour W1 (V_AF) :**

On remplace la 1ʳᵉ colonne de A par (Vx, Vy, Ω) et on calcule det(A1) / det(A).
Après développement :

```
W1 = (1/2) × Vx - (√3/2) × Vy - d × Ω
```

**Pour W2 (V_BF) :**

```
W2 = (1/2) × Vx + (√3/2) × Vy - d × Ω
```

**Pour W3 (V_CF) :**

```
W3 = -Vx - d × Ω
```

### 6.2 En notation numérique

En remplaçant √3/2 ≈ 0.866 (convention Nantes actuelle) :

```
W1 = -0.5 × Vx + 0.866 × Vy - d × Ω     // α = 120°
W2 = -0.5 × Vx - 0.866 × Vy - d × Ω     // α = 240°
W3 = +1.0 × Vx + 0.0   × Vy - d × Ω     // α = 0°
```

> **D'où viennent les coefficients ?** Directement de la trigonométrie des 120° :
>
> - cos(120°) = -0.5, sin(120°) = +0.866
> - cos(240°) = -0.5, sin(240°) = -0.866
> - cos(0°) = +1.0, sin(0°) = 0.0
>
> Ces constantes ne se mémorisent pas : elles se redérivent depuis la géométrie en 2 minutes.

### 6.3 Vérifications intuitives

| Commande              | Résultat attendu              | Sens de rotation des roues |
| --------------------- | ----------------------------- | -------------------------- |
| Vx > 0, Vy = 0, Ω = 0 | Strafe pur vers X+            | W1 < 0, W2 < 0, W3 > 0 ✅   |
| Vx = 0, Vy > 0, Ω = 0 | Avancer pur vers Y+           | W1 > 0, W2 < 0, W3 = 0 ✅   |
| Vx = 0, Vy = 0, Ω > 0 | Rotation pure sur place       | W1 = W2 = W3 < 0 ✅         |
| Vx > 0, Vy > 0, Ω > 0 | Mouvement diagonal + rotation | Combinaison des trois ✅    |

> **Test physique :** sur le vrai robot, toujours tester les 3 cas purs séparément avant de tester la combinaison. Un signe inversé sur une roue se détecte immédiatement avec ces cas de base.

---

## 7. Odométrie — Des roues à la position

La cinématique directe sert aussi à l'odométrie : à partir des distances parcourues par chaque roue (lues via les encodeurs), on reconstruit le déplacement du robot.

### 7.1 Du déplacement des roues au déplacement local (repère robot)

On repart des équations de cinématique directe et on les applique aux incréments de position ΔW1, ΔW2, ΔW3 (en mm) depuis le dernier pas :

```
dx_enc =  (-ΔW1 - ΔW2 + 2×ΔW3) / 3
dy_enc =  (ΔW1 - ΔW2) / √3
dθ_enc = -(ΔW1 + ΔW2 + ΔW3) / (3 × d)
```

Ces formules sont exactement les équations de cinématique directe, appliquées à des déplacements différentiels au lieu de vitesses.

### 7.2 Du repère robot au repère monde

Ces déplacements sont dans le repère local du robot. Pour mettre à jour la position absolue, on les reprojette dans le repère monde via la rotation d'angle θ :

```
X += dx_enc × cos(θ) - dy_enc × sin(θ)
Y += dx_enc × sin(θ) + dy_enc × cos(θ)
θ += dθ_enc
```

> **Attention à la dérive :** l'odométrie intègre les erreurs au fil du temps. Sur un robot holonome, les roues omni glissent latéralement en virage → l'odométrie seule dérive beaucoup plus vite que sur un différentiel. C'est la principale motivation du filtre de Kalman (voir le cours Kalman), qui fusionne l'odométrie avec l'IMU et le capteur optique.

---

## 8. Filtrage de la commande

Appliquer brutalement un changement de vitesse de consigne crée des à-coups mécaniques (vibrations, contraintes sur les engrenages, risque de perte de pas sur les moteurs pas-à-pas).

On applique un **filtre passe-bas** sur les vitesses calculées avant de les envoyer aux moteurs :

```
W_filtered[k] = α × W_new[k] + (1 - α) × W_filtered[k-1]
```

| Valeur de α              | Comportement                         |
| ------------------------ | ------------------------------------ |
| α proche de 1 (ex : 0.9) | Changements rapides, peu de lissage  |
| α proche de 0 (ex : 0.1) | Changements très lents, fort lissage |
| α = 0.3 (valeur Nantes)  | Bon compromis réactivité / douceur   |

> C'est exactement le même principe que le filtre sur le terme D du PID. Un α trop petit rend le robot "mou" et long à atteindre sa vitesse de consigne. Un α trop grand laisse passer les à-coups.

Après filtrage, on applique une **normalisation proportionnelle** : si la vitesse maximale d'une roue dépasse la limite physique du moteur, on rescale toutes les roues par le même facteur pour rester dans les limites tout en conservant le ratio entre elles (et donc la direction du mouvement).

---

## 9. Boucle complète

```
┌────────────────────────────────────────────────────────────────────────┐
│  CONSIGNE (Xc, Yc, θc)                                                │
│       │                                                                │
│       ▼                                                                │
│  [PID X] [PID Y] [PID θ]   →   (Vx_monde, Vy_monde, Ω)              │
│                                          │                             │
│       ┌──────────────────────────────────┘                             │
│       ▼                                                                │
│  Rotation repère monde → repère robot  (matrice R(θ))                 │
│       │                                                                │
│       ▼                                                                │
│  Cinématique inverse  →   (W1, W2, W3)    [équations section 6]       │
│       │                                                                │
│       ▼                                                                │
│  Filtre passe-bas (α = 0.3) + normalisation                           │
│       │                                                                │
│       ▼                                                                │
│  Moteurs (MKS SERVO57D — RS485 — steps/s)                             │
│       │                                                                │
│       ▼                                                                │
│  Encodeurs  →  ΔW1, ΔW2, ΔW3                                         │
│       │                                                                │
│       ▼                                                                │
│  Cinématique directe  →  (dx, dy, dθ)    [équations section 7]       │
│       │                                                                │
│       ▼                                                                │
│  Intégration position  →  (X, Y, θ)  ───────────────────► retour PID │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Conversion steps ↔ mm (spécificité MKS SERVO57D)

Les équations de cinématique travaillent en mm/s. Les moteurs pas-à-pas reçoivent des commandes en steps/s. Il faut donc convertir.

### 10.1 Facteur de conversion

```
steps_par_tour = steps_moteur × microstepping = 200 × 32 = 6 400

périmètre_roue = π × diamètre = π × 60 mm ≈ 188.5 mm

steps_par_mm = steps_par_tour / périmètre_roue = 6 400 / 188.5 ≈ 33.95 steps/mm
```

Donc pour envoyer une vitesse en mm/s au moteur :

```
vitesse_steps_par_s = vitesse_mm_par_s × steps_par_mm
                    = vitesse_mm_par_s × 33.95
```

Et pour convertir un déplacement d'encodeur (steps) en mm pour l'odométrie :

```
déplacement_mm = steps_lus / steps_par_mm
               = steps_lus / 33.95
```

### 10.2 Vérification rapide

Le robot doit parcourir 1 m en ligne droite (Vx = 0, Vy = 1000 mm/s, Ω = 0) :

- W1 et W2 doivent recevoir ≈ 0 steps/s (Vy pur → W3 = 0 aussi selon convention)
- Vérifier en mesurant la distance réelle vs la distance estimée par l'odométrie

> **Paramètre à calibrer en pratique :** le diamètre effectif de la roue change avec l'usure des rouleaux et la charge du robot. Mesurer empiriquement steps_par_mm sur 1 m vaut mieux que de faire confiance à la valeur théorique.

---

## 11. Gestion du cap θ

### 11.1 Le problème de la discontinuité angulaire

L'angle θ est périodique : 0° et 360° représentent la même orientation. Si on ne fait pas attention, une consigne à 350° et une position à 10° génèrent une erreur PID de 340° au lieu de -20°, et le robot fait un tour complet dans le mauvais sens.

**Il faut toujours normaliser l'erreur angulaire dans [-π, π].**

```cpp
// Normalisation d'un angle dans [-π, π]
float normalize_angle(float angle) {
    while (angle >  M_PI) angle -= 2 * M_PI;
    while (angle < -M_PI) angle += 2 * M_PI;
    return angle;
}

// Calcul de l'erreur angulaire
float error_theta = normalize_angle(theta_consigne - theta_actuel);
```

### 11.2 Zone morte (deadband)

À l'arrêt, un PID sans zone morte oscille en permanence autour de la consigne : l'erreur est petite mais non nulle, le correcteur envoie une micro-commande, le robot bouge un peu, l'erreur change de signe, etc.

On force les consignes à zéro dès que l'erreur est sous un seuil :

```
si |erreur_distance| < 10 mm  ET  |erreur_theta| < 0.15 rad (~8.6°)
    → Vx = Vy = Ω = 0   (robot considéré en position)
```

> **Pourquoi cette valeur ?** 10 mm c'est la précision réaliste de l'odométrie en conditions de match (glissement, vibrations). En dessous, corriger ne fait qu'amplifier le bruit. La valeur exacte se règle empiriquement en observant si le robot tremble ou s'il reste bien immobile.

> **Lien avec le frottement sec :** le frottement statique est plus fort que le frottement dynamique. Une très petite commande ne suffit pas à vaincre le frottement et le robot reste bloqué — mais l'intégrateur continue d'accumuler (windup). La zone morte évite ce cas. Voir aussi la gestion du deadband dans le cours PID (section anti-windup).

---

## 12. Pourquoi 3 roues et pas 4 ?

C'est une question classique des nouveaux membres.

### 3 roues : stabilité garantie

Trois points définissent toujours un plan. Un robot à 3 roues est donc **toujours en contact avec le sol** — comme un tabouret à 3 pieds. Même sur un sol légèrement irrégulier, les 3 roues touchent le sol simultanément. C'est un avantage mécanique majeur pour la répétabilité de l'odométrie.

Un robot à 4 roues peut "vriller" : si le sol n'est pas parfaitement plat, une roue peut être levée. La force sur les autres roues n'est alors plus symétrique — les équations cinématiques ne tiennent plus.

### 4 roues : plus de force motrice

Quatre roues donnent plus de surface de contact et donc plus de force disponible. Un robot lourd (> 5 kg) ou qui doit pousser des objets a intérêt à passer à 4 roues omni disposées à 90°.

### Comparatif

| Critère                | 3 roues à 120° | 4 roues à 90°          |
| ---------------------- | -------------- | ---------------------- |
| Contact sol garanti    | ✅              | ❌ (sur sol irrégulier) |
| Force motrice          | Moyen          | Élevé                  |
| Complexité cinématique | Moyenne        | Moyenne                |
| Glissement en virage   | Plus fort      | Plus faible            |
| Usage typique Eurobot  | ✅ Majoritaire  | Robots lourds          |

> **Spécificité Nantes :** le robot est à 3 roues. Le choix est fait depuis la première version et a prouvé sa robustesse sur les terrains de compétition.

---

## 13. Limites et réalité de terrain

Le robot holonome a des contraintes réelles qu'il faut connaître avant d'en attendre trop.

### Glissement des rouleaux

Les rouleaux passifs des roues omni glissent par définition dans leur direction libre. En virage rapide, la direction motrice d'une roue contribue à faire glisser les rouleaux des autres — ce glissement introduit des erreurs dans l'odométrie et une perte d'énergie.

**En pratique :** les virages rapides dégradent l'odométrie plus que les translations droites. Limiter la vitesse angulaire Ω améliore la précision de localisation.

### Couple plus faible qu'un différentiel

Pour un poids donné, un robot holonome à 3 roues dispose de moins de couple effectif qu'un différentiel à 2 roues, parce que chaque roue ne pousse pas directement dans la direction du mouvement. Les coefficients sin/cos de la cinématique inverse montrent que la force d'une roue est toujours projetée — jamais pleinement utilisée dans une direction donnée.

**En pratique :** éviter de pousser des objets lourds latéralement (strafe). Pour la Coupe, préférer les actions en avançant droit plutôt qu'en strafant sous charge.

### Usure des rouleaux

Les rouleaux en plastique s'usent avec le temps, notamment si le robot fait beaucoup de rotations sur place. Le diamètre effectif change → le facteur steps/mm dérive → l'odométrie se dégrade progressivement.

**En pratique :** recalibrer steps/mm en début de chaque séance importante (sélections, finale).

### Sensibilité au sol

Les roues omni sont conçues pour des sols lisses. Sur une toile de match standard, ça fonctionne bien. Sur les bords, les câbles, ou les zones avec des éléments de jeu au sol, le comportement peut être imprévisible.

---

## 14. Problèmes courants et solutions

### Le robot tourne sur lui-même au lieu d'avancer

**Cause probable :** erreur de signe sur une roue dans la matrice de cinématique inverse, ou convention d'angle du repère robot incohérente avec le câblage physique.

**Solution :** tester chaque commande de base séparément (Vx pur → vérifier que W3 seul tourne, Vy pur → W1 et W2 opposées, Ω pur → les 3 dans le même sens). Un signe inversé se détecte immédiatement.

### Le robot avance droit mais dérive en translation

**Cause probable :** la cinématique inverse est correcte, mais l'odométrie (cinématique directe) a une erreur — souvent un mauvais facteur de conversion steps → mm, ou une erreur sur d (rayon de la base).

**Solution :** mesurer empiriquement sur une distance connue (1 m en ligne droite), comparer la position estimée à la réalité.

### Les mouvements sont saccadés

**Cause probable :** α du filtre de lissage trop grand (pas assez de lissage), accélération max trop élevée côté pilote moteur, ou fréquence de la boucle trop basse.

**Solution :** diminuer α, ou vérifier l'accélération max dans la config du MKS SERVO57D.

### La position dérive en rotation (le cap tourne tout seul)

**Cause probable :** offset non calibré sur le gyroscope (dérive IMU), ou erreur sur d dans le calcul de dθ_enc.

**Solution :** calibrer le gyroscope à l'arrêt (offset à soustraire), vérifier d avec une rotation de 360° et mesurer l'erreur angulaire accumulée.

---

## Résumé

```
CINÉMATIQUE DIRECTE  (roues → mouvement)
  Vx = (1/3)W1   + (1/3)W2  - (2/3)W3
  Vy = -(√3/3)W1 + (√3/3)W2
  Ω  = -(W1 + W2 + W3) / (3d)

CINÉMATIQUE INVERSE  (mouvement → roues)   ← obtenu par règle de Cramer
  W1 = -0.5×Vx + 0.866×Vy - d×Ω
  W2 = -0.5×Vx - 0.866×Vy - d×Ω
  W3 = +1.0×Vx + 0.0  ×Vy - d×Ω

BOUCLE COMPLÈTE (à fréquence fixe)
  1. PID monde     →  (Vx, Vy, Ω)
  2. Rotation R(θ) →  repère robot
  3. Cin. inverse  →  (W1, W2, W3)
  4. Filtre + norm →  moteurs
  5. Encodeurs     →  cinématique directe  →  (dx, dy, dθ)
  6. Intégration   →  (X, Y, θ)  →  retour PID
```

**Paramètres à calibrer :** distance centre–roue `d` (156.9 mm), facteur de conversion steps/mm, offset gyroscope, coefficient α du filtre de lissage (0.3 par défaut).

---

*Pour aller plus loin : filtre de Kalman pour fusionner odométrie + IMU + capteur optique, EKF avec jacobienne de la cinématique holonome.*

*Référence mathématique de la dérivation : [Poivron Robotique — Robot holonome lois de commande](https://poivron-robotique.fr/Robot-holonome-lois-de-commande.html)*
