# Filtre de Kalman
*Support de cours — Coupe de France de Robotique (spécificité Nantes)*

---

## 1. Le problème de base

Ton robot holonome a trois roues. Il dispose de trois sources de mesure : des **encodeurs sur les moteurs**, un **capteur optique** (type souris) et une **IMU**. Problème : aucun de ces capteurs n'est parfait.

- Les encodeurs moteurs mesurent la rotation des roues, mais les roues omnidirectionnelles **glissent** → erreur odométrique difficile à modéliser
- Le capteur optique mesure directement le déplacement du sol, mais il est **sensible aux vibrations** et peut perdre le tracking sur certaines surfaces
- L'IMU donne un cap fiable à court terme, mais **dérive** sur le long terme
- Les trois capteurs sont bruités différemment, à des fréquences différentes

**La question c'est : comment fusionner ces trois sources d'information imparfaites pour obtenir une estimation de position la plus juste possible ?**

Une moyenne naïve des trois ? Non — parce que les capteurs n'ont pas la même fiabilité selon la situation. Ce qu'il faut, c'est un système capable de **pondérer dynamiquement** chaque source selon la confiance qu'on lui accorde.

C'est exactement ce que fait le filtre de Kalman.

---

## 2. L'idée centrale

Le filtre de Kalman repose sur deux étapes qui se répètent en boucle :

```
┌─────────────────────────────────────────────────────────┐
│  1. PRÉDICTION                                          │
│     "D'après ce que j'ai commandé, où devrais-je être?" │
│     → on utilise le modèle du robot (cinématique)       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  2. MISE À JOUR (correction)                            │
│     "D'après ce que mes capteurs mesurent,              │
│      où suis-je vraiment ?"                             │
│     → on corrige la prédiction avec le gain de Kalman  │
└─────────────────────────────────────────────────────────┘
```

À chaque itération, le filtre maintient deux choses :

- **x̂** : l'état estimé (ex : position x, y, angle θ)
- **P** : la covariance — une mesure de l'incertitude sur cette estimation

Plus P est grand, moins on est sûr de notre estimation. Le filtre utilise cette incertitude pour décider à quel point il faut faire confiance aux capteurs vs au modèle.

---

## 3. Les équations discrètes

On travaille en temps discret (comme le PID). À chaque pas k :

### 3.1 Matrices nécessaires

| Matrice | Rôle |
|---|---|
| **F** | Modèle d'évolution de l'état (cinématique du robot) |
| **H** | Modèle d'observation (comment les capteurs voient l'état) |
| **Q** | Bruit de processus (incertitude sur le modèle) |
| **R** | Bruit de mesure (incertitude sur les capteurs) |
| **K** | Gain de Kalman (calculé à chaque pas) |

### 3.2 Étape 1 — Prédiction

```
x̂[k|k-1] = F × x̂[k-1|k-1]          // état prédit
P[k|k-1]  = F × P[k-1|k-1] × Fᵀ + Q  // covariance prédite
```

> On projette l'état en avant dans le temps grâce au modèle cinématique.
> Q représente à quel point on fait confiance au modèle — une valeur élevée = modèle peu fiable.

### 3.3 Étape 2 — Mise à jour

```
y[k] = z[k] - H × x̂[k|k-1]                          // innovation (écart mesure / prédiction)
S[k] = H × P[k|k-1] × Hᵀ + R                         // covariance de l'innovation
K[k] = P[k|k-1] × Hᵀ × S[k]⁻¹                        // gain de Kalman
x̂[k|k] = x̂[k|k-1] + K[k] × y[k]                     // état corrigé
P[k|k] = (I - K[k] × H) × P[k|k-1]                   // covariance corrigée
```

> Le gain K pondère automatiquement : si R est grand (capteur peu fiable), K est petit → on fait plus confiance au modèle. Si Q est grand (modèle peu fiable), K est grand → on fait plus confiance aux capteurs.

> **Important :** comme le PID, le filtre de Kalman doit tourner à **fréquence fixe**. Un dt variable rend les matrices F et Q incohérentes.

---

## 4. Régler Q et R

C'est l'équivalent du tuning des gains PID — et c'est souvent là que les gens bloquent.

| Paramètre | Ce que ça représente | Effet si trop grand |
|---|---|---|
| **Q** | Incertitude sur le modèle (bruit de processus) | Le filtre suit les capteurs de près, réactif mais bruité |
| **R** | Incertitude sur les capteurs (bruit de mesure) | Le filtre suit le modèle de près, lisse mais lent à corriger |

**Méthode pratique :**
- Commencer avec `Q = I × 0.01` et `R = I × 1.0` (on fait d'abord confiance au modèle)
- Si l'estimation dérive trop → augmenter Q (moins confiance au modèle)
- Si l'estimation est trop bruitée → augmenter R (moins confiance aux capteurs)
- Les valeurs de R peuvent être estimées empiriquement en mesurant la variance du capteur à l'arrêt

---

## 5. Les variantes du filtre de Kalman

Le filtre de Kalman classique suppose que le système est **linéaire**. Or un robot mobile ne l'est pas — la projection de la vitesse en x/y dépend de sin(θ) et cos(θ), ce qui est non-linéaire.

### 5.1 Kalman classique (KF)

- Fonctionne uniquement sur des systèmes **linéaires**
- Équations simples, facile à implémenter
- **En robotique mobile : rarement utilisable tel quel** (à cause des non-linéarités de la cinématique)
- Utile pour des cas simples : fusion encodeur + encodeur, ou estimation de vitesse seule

### 5.2 Extended Kalman Filter (EKF)

- Gère les **systèmes non-linéaires** en les linéarisant localement
- On remplace F par la **jacobienne** du modèle d'évolution, calculée à chaque pas
- C'est la version la plus utilisée en robotique mobile

```
F[k] = ∂f/∂x |x̂[k-1]     // jacobienne du modèle f, évaluée au point courant
```

**Avantages :**
- Applicable à la cinématique holonome réelle (sin/cos)
- Bien documenté, bibliothèques disponibles

**Limites :**
- La linéarisation introduit des erreurs si la non-linéarité est forte (virages serrés rapides)
- La jacobienne peut être difficile à calculer analytiquement

> **En pratique pour la Coupe :** l'EKF est le choix de référence pour fusionner odométrie + IMU sur un robot holonome.

### 5.3 Unscented Kalman Filter (UKF)

- Gère aussi les **systèmes non-linéaires**, mais sans linéariser
- Utilise un ensemble de points déterministes appelés **sigma points** pour propager l'incertitude à travers la fonction non-linéaire
- Plus précis que l'EKF sur les systèmes fortement non-linéaires

```
Sigma points = ensemble de 2n+1 points choisis autour de x̂
→ on les propage à travers f (pas de jacobienne)
→ on recalcule moyenne et covariance à partir des points propagés
```

**Avantages :**
- Pas de jacobienne à calculer → plus simple à implémenter sur des modèles complexes
- Meilleure précision que l'EKF en forte non-linéarité

**Limites :**
- Plus coûteux en calcul (2n+1 évaluations du modèle par pas)
- Moins répandu, moins de ressources disponibles

**Comparatif rapide**

| Filtre | Systèmes linéaires | Systèmes non-linéaires | Complexité | Précision |
|---|---|---|---|---|
| KF classique | ✅ | ❌ | Faible | Optimale (si linéaire) |
| EKF | ~ | ✅ | Moyenne | Bonne (linéarisation locale) |
| UKF | ~ | ✅ | Élevée | Meilleure (sigma points) |

---

## 6. Pourquoi Kalman est particulièrement utile sur un robot holonome

### 6.1 Le problème spécifique de l'holonome

Un robot holonome (3 roues omnidirectionnelles) peut se déplacer dans n'importe quelle direction sans changer son orientation. C'est sa force — mais aussi ce qui complique la localisation.

Sur un robot **différentiel**, si tu avances tout droit, les erreurs latérales sont faibles. La cinématique contrainte simplifie l'odométrie.

Sur un robot **holonome** :
- Les trois roues contribuent simultanément au déplacement en x, y **et** en θ
- Une erreur sur un seul encodeur se répercute sur les trois composantes de position
- Le déplacement latéral pur (strafe) est très sensible au glissement des roues omnidirectionnelles

Résultat : **l'odométrie seule dérive beaucoup plus vite** que sur un différentiel. La fusion avec l'IMU devient indispensable, et Kalman est l'outil adapté pour la faire proprement.

### 6.2 Ce que Kalman apporte concrètement

- **Fusion des trois capteurs :** chacun couvre les faiblesses des autres. Le capteur optique est bon sur les translations mais sensible aux vibrations. Les encodeurs moteurs sont rapides mais glissent en virage. L'IMU est fiable en rotation à court terme mais dérive. Kalman pondère les trois selon la situation.
- **Robustesse au glissement :** quand une roue omnidirectionnelle glisse (virage rapide, sol irrégulier), le filtre détecte l'incohérence entre l'encodeur moteur et le capteur optique et réduit automatiquement la confiance accordée à l'encodeur.
- **Lissage de la trajectoire :** l'état estimé est continu et lisse, contrairement à une lecture brute d'encodeur ou de capteur optique qui progresse par incréments discrets.

### 6.3 Ce que chaque capteur observe

```
x̂ = [ x, y, θ, vx, vy, ω ]ᵀ

  x, y   : position dans le repère terrain (mm)
  θ      : orientation (rad)
  vx, vy : vitesses linéaires dans le repère robot (mm/s)
  ω      : vitesse angulaire (rad/s)
```

| Capteur | Ce qu'il observe | Force | Limite |
|---|---|---|---|
| **Encodeurs moteurs** | vx, vy, ω (via cinématique inverse des 3 roues) | Rapide, haute fréquence | Sensible au glissement des roues omni |
| **Capteur optique** | vx, vy directement sur le sol (en counts/dt) | Insensible au glissement des roues | Peut perdre le tracking, sensible aux vibrations |
| **IMU — gyroscope** | ω directement | Précis à court terme, haute fréquence | Dérive angulaire sur le long terme |
| **IMU — accéléromètre** | ax, ay (à intégrer pour obtenir v) | Détecte les chocs, mouvements brusques | Bruit fort, intégration double → dérive rapide |

> **En pratique :** l'accéléromètre de l'IMU est rarement utilisé seul pour estimer la position — sa double intégration accumule trop d'erreurs. On l'utilise surtout pour détecter des événements (choc, blocage) ou en complément du gyroscope pour l'estimation d'angle (tangage/roulis si nécessaire).

> **Astuce Nantes :** le capteur optique et les encodeurs moteurs mesurent tous les deux la vitesse du robot, mais via des principes physiques différents. Leur désaccord est un excellent indicateur de glissement — le filtre peut exploiter cet écart pour adapter sa confiance en temps réel.

---

## 7. Problèmes courants et solutions

### Divergence du filtre

**Problème :** P devient énorme ou l'état estimé part dans tous les sens.

**Causes probables :**
- Q trop grand (le filtre ne fait plus confiance à rien)
- Modèle F incohérent avec la réalité (cinématique mal écrite)
- dt variable → matrices F et Q incorrectes

**Solution :** vérifier d'abord le modèle F à la main sur un exemple simple, puis fixer le dt.

### Estimation lisse mais fausse (biais)

**Problème :** le filtre converge mais l'estimation est systématiquement décalée par rapport à la réalité.

**Cause probable :** biais non modélisé dans les capteurs (ex : offset gyroscope non calibré) ou erreur dans la matrice H (modèle d'observation incorrect).

**Solution :** calibrer les capteurs avant le match (offset gyro à l'arrêt), vérifier H.

### Kalman trop lent à corriger

**Problème :** R trop grand → le filtre fait trop confiance au modèle et ignore les corrections capteurs.

**Solution :** diminuer R, ou vérifier que la fréquence du filtre est adaptée (trop lente = correction en retard).

---

## Résumé

```
1. Prédire l'état           →  x̂[k|k-1] = F × x̂[k-1]
2. Prédire l'incertitude    →  P[k|k-1]  = F × P × Fᵀ + Q
3. Calculer le gain         →  K = P × Hᵀ × (H × P × Hᵀ + R)⁻¹
4. Corriger avec la mesure  →  x̂[k] = x̂[k|k-1] + K × (z - H × x̂[k|k-1])
5. Mettre à jour P          →  P[k] = (I - K × H) × P[k|k-1]
6. Répéter à intervalle fixe
```

**Ordre de réglage :** estimer R depuis les capteurs à l'arrêt → fixer Q petit → augmenter Q si l'estimation dérive → utiliser EKF dès que la cinématique est non-linéaire.

---

*Pour aller plus loin : particle filter (Monte Carlo), SLAM, graph-based localization.*