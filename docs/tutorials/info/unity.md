---
title: Découvrir Unity avec un mini-jeu de plateforme 3D
description: "Documentation débutant : comprendre l'éditeur Unity, les objets, les composants et quelques scripts C# à travers un petit niveau jouable."
slug: unity
tags: [course, info, unity, csharp]
last_update:
  date: 2026-08-31
  author: Anne-Marie Faye
additional_contributors:
  - username: Anne-Marie Faye
    html_url: https://www.linkedin.com/in/anne-marie-faye-84621b1a2/
---

Documentation débutant : comprendre l'éditeur, les objets, les composants et quelques scripts C# à travers un petit niveau jouable.

## Préparer un projet Unity

Unity est un moteur de jeu : il sert à créer une scène, placer des objets, leur ajouter des composants, puis programmer leurs comportements. Le mini-jeu de plateforme sert ici d'exemple simple : un cube joueur se déplace, saute, active une plaque, ouvre une porte et atteint une zone finale.

![Fenêtre Unity Hub listant les projets existants](/img/tutorials/info/unity/01-unity-hub.png)
_Unity Hub permet de créer, ouvrir et gérer les projets ainsi que les versions de l'éditeur._

Le projet se prépare depuis Unity Hub avec le bouton **New project**. Pour un premier jeu 3D, le modèle **3D** classique suffit. Il est important de choisir une version installée de Unity et un dossier de projet facile à retrouver.

## Comprendre l'interface Unity

![Schéma des zones Hierarchy, Scene, Game, Inspector et Project de l'éditeur Unity](/img/tutorials/info/unity/02-reperes-interface-unity.png)
_Les zones principales de l'éditeur Unity._

![Éditeur Unity ouvert sur une scène vide avec ses panneaux](/img/tutorials/info/unity/03-scene-unity-vide.png)
_Vue générale d'une scène Unity vide avec ses panneaux principaux._

| Zone          | Rôle                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| **Hierarchy** | Liste tous les GameObjects présents dans la scène. Quand un objet est créé, il apparaît ici.              |
| **Scene**     | Vue de construction. Elle sert à placer les objets, déplacer la caméra de travail et organiser le niveau. |
| **Game**      | Vue du jeu réellement rendu par la Main Camera. C'est ce que le joueur verra.                             |
| **Inspector** | Affiche les propriétés de l'objet sélectionné : Transform, composants, matériaux, scripts.                |
| **Project**   | Affiche les fichiers du projet dans Assets : scènes, scripts, matériaux, modèles, sons.                   |

### Objets présents dans une nouvelle scène

Une scène 3D contient généralement **Main Camera** et **Directional Light**. Main Camera filme la scène et produit l'image visible dans Game. Directional Light éclaire la scène comme une lumière de soleil : sans lumière, les objets peuvent paraître trop sombres.

![Panneau Hierarchy contenant Main Camera et Directional Light](/img/tutorials/info/unity/04-hierarchy-scene-vide.png)
_Dans la Hierarchy, une scène vide contient souvent Main Camera et Directional Light._

![Vue Scene avec l'icône caméra de la Main Camera sélectionnée](/img/tutorials/info/unity/05-scene-main-camera.png)
_Dans Scene, l'icône caméra permet de repérer l'objet Main Camera._

![Vue Game affichant le rendu de la caméra](/img/tutorials/info/unity/06-game-view.png)
_La Game View montre le rendu de la caméra pendant le jeu._

## Organiser le projet et créer une scène

### Organisation des fichiers

Dans la fenêtre **Project**, les fichiers du jeu sont stockés dans `Assets`. Même pour un petit projet, il vaut mieux créer quelques dossiers : `Scenes` pour les scènes, `Scripts` pour le code, `Materials` pour les couleurs et textures, `Editor` seulement pour des outils internes si besoin.

![Dossier Assets contenant Editor, Materials, Scenes et Scripts](/img/tutorials/info/unity/07-organisation-assets.png)
_Exemple d'organisation simple du dossier Assets._

### Créer une scène

Une scène est un niveau ou un écran du jeu. Elle contient les objets visibles et invisibles nécessaires au fonctionnement : joueur, murs, plateformes, lumière, caméra, zones de mort et zone de victoire. Pour créer une scène : clic droit dans `Assets`, puis **Create > Scene**. La scène est ensuite enregistrée dans le dossier `Scenes`.

![Menu contextuel Create ouvert dans le dossier Assets](/img/tutorials/info/unity/08-menu-create.png)
_Le menu Create sert à créer une Scene, un Material, un C# Script et d'autres ressources._

## Créer un GameObject

Un **GameObject** est un objet de base dans Unity. Il peut être visible, comme un cube, ou invisible, comme un point de spawn. Pour créer un cube : clic droit dans la **Hierarchy**, puis **3D Object > Cube**.

![Menu contextuel 3D Object > Cube dans la Hierarchy](/img/tutorials/info/unity/09-creation-cube.png)
_Création d'un cube depuis la Hierarchy._

![Schéma d'un GameObject et de ses composants Transform, Mesh Renderer, Box Collider, Rigidbody et script C#](/img/tutorials/info/unity/10-gameobject-composants.png)
_Un GameObject devient utile grâce à ses composants._

Le composant **Transform** existe sur tous les GameObjects. Il définit la position, la rotation et l'échelle. Dans le mini-jeu, Transform sert à placer le joueur, les plateformes, la porte et les zones de sécurité.

![Inspector d'un cube affichant Transform, Mesh Renderer et Box Collider](/img/tutorials/info/unity/11-inspector-cube.png)
_Dans l'Inspector, le cube possède déjà Transform, Mesh Renderer et Box Collider._

### Mesh Renderer, Material et Collider

**Mesh Renderer** affiche l'objet à l'écran. Il utilise un **Material** pour savoir quelle couleur ou texture afficher. **Box Collider** donne au cube une zone de contact : sans Collider, les collisions du mini-jeu ne peuvent pas fonctionner correctement.

## Créer et appliquer un Material

Un Material définit l'apparence d'un objet : couleur, brillance, texture. Dans le mini-jeu, les couleurs servent aussi de feedback : rouge pour le sol mortel, vert pour la plaque activée, orange pour le joueur.

Pour créer un Material : clic droit dans `Assets`, puis **Create > Material**. Ensuite, la couleur se modifie dans l'Inspector.

![Menu Create > Material dans le dossier Assets](/img/tutorials/info/unity/12-creation-material.png)
_Création d'un Material depuis le dossier Assets._

![Inspector d'un Material orange avec son aperçu sphérique](/img/tutorials/info/unity/13-material-orange.png)
_Exemple de Material orange dans l'Inspector._

Pour appliquer un Material sur un cube, il suffit de le glisser depuis **Project** vers l'objet dans **Scene** ou vers la zone **Materials** du Mesh Renderer.

![Comparaison avant/après de l'application d'un Material orange sur un cube](/img/tutorials/info/unity/14-material-avant-apres.png)
_Avant/après : le cube blanc reçoit un Material orange._

## Préparer le code C #

### Package Manager et éditeur de code

Avant d'écrire du code, Unity doit être relié à un éditeur comme Visual Studio Code ou Visual Studio. Le **Package Manager** permet d'installer le paquet adapté : **Visual Studio Code Editor** pour VS Code, ou **Visual Studio Editor** pour Visual Studio.

![Menu Window avec l'entrée Package Manager](/img/tutorials/info/unity/15-window-package-manager.png)
_Ouverture du Package Manager depuis Window > Package Manager._

![Package Manager affichant le paquet Visual Studio Code Editor](/img/tutorials/info/unity/16-package-visual-studio-code-editor.png)
_Paquet Visual Studio Code Editor dans le Package Manager._

### Créer un script et l'ajouter à un objet

Un script C# est un fichier qui ajoute un comportement à un GameObject. Par exemple, `PlayerBehavior` contrôle le déplacement du cube joueur. Un script peut être créé depuis **Assets > Create > C# Script** ou depuis le bouton **Add Component** de l'Inspector.

![Bouton Add Component en bas de l'Inspector](/img/tutorials/info/unity/17-add-component.png)
_Le bouton Add Component ajoute un composant à l'objet sélectionné._

![Liste des catégories de composants proposées par Add Component](/img/tutorials/info/unity/18-categories-composants.png)
_Add Component donne accès aux catégories de composants Unity._

![Recherche « script » dans Add Component avec l'entrée New script](/img/tutorials/info/unity/19-recherche-script.png)
_La recherche Script permet de créer ou ajouter un script._

## Notions Unity appliquées au mini-jeu

### Rigidbody et physique

**Rigidbody** rend un objet contrôlé par la physique. Sur le joueur, il permet d'utiliser la gravité, les collisions et les forces. **Freeze Rotation** sert à éviter que le cube bascule sur les côtés après une collision.

![Composant Rigidbody dans l'Inspector avec Mass, Drag, Use Gravity et Constraints](/img/tutorials/info/unity/20-rigidbody.png)
_Réglages principaux d'un Rigidbody : masse, gravité, contraintes de rotation._

```csharp
void FixedUpdate()
{
    Vector3 movement = transform.forward * moveInput.z + transform.right * moveInput.x;
    rb.MovePosition(rb.position + movement * speed * Time.fixedDeltaTime);

    if (jumpInput && isGrounded)
    {
        rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        jumpInput = false;
    }
}
```

`MovePosition` déplace le Rigidbody proprement pendant la physique. `AddForce` applique une force, ici pour le saut. `FixedUpdate` est utilisé car le déplacement dépend de la physique.

### Input clavier et souris

Les inputs sont les actions du joueur : touches du clavier, souris, manette ou clics. Dans un jeu, on peut configurer ZQSD pour déplacer un personnage, `E` pour ouvrir un inventaire, `R` pour lancer une attaque spéciale, ou la souris pour orienter la caméra et le joueur.

```csharp
moveInput = Vector3.zero;
if (Input.GetKey(KeyCode.Z)) moveInput.z += 1f;
if (Input.GetKey(KeyCode.S)) moveInput.z -= 1f;
if (Input.GetKey(KeyCode.Q)) moveInput.x -= 1f;
if (Input.GetKey(KeyCode.D)) moveInput.x += 1f;

float mouseX = Input.GetAxis("Mouse X");
transform.Rotate(Vector3.up * mouseX * mouseSensitivity);
```

`Input.GetKey` vérifie si une touche est maintenue. `Input.GetAxis("Mouse X")` lit le mouvement horizontal de la souris. `transform.Rotate` modifie la rotation du joueur.

### Collider, Trigger et événements

Un Collider définit une zone de contact. Si **Is Trigger** est désactivé, l'objet bloque ou entre en collision. Si **Is Trigger** est activé, l'objet détecte le passage sans bloquer physiquement.

![Schéma comparant un Collider normal bloquant et un Trigger traversable](/img/tutorials/info/unity/21-collider-vs-trigger.png)
_Différence entre Collider et Trigger : collision bloquante ou détection sans blocage._

![Comparaison avant/après montrant la plaque de pression qui ouvre la porte](/img/tutorials/info/unity/22-trigger-plaque-porte.png)
_Avant/après : la plaque de pression active la porte grâce à un Trigger._

```csharp
void OnCollisionEnter(Collision collision)
{
    if (collision.gameObject.CompareTag("DeathGround"))
    {
        gameManager.RespawnPlayer();
    }
}

void OnTriggerEnter(Collider other)
{
    if (other.CompareTag("Player"))
    {
        active = true;
        renderer.material = activeColor;
    }
}
```

`OnCollisionEnter` réagit à une vraie collision, par exemple avec le sol rouge mortel. `OnTriggerEnter` réagit au passage dans une zone, par exemple la plaque de pression. `CompareTag` évite de confondre le joueur avec d'autres objets.

### Raycast pour détecter le sol sous le joueur

![Schéma d'un raycast vert détectant un sol et d'un raycast rouge dans le vide](/img/tutorials/info/unity/23-raycast-sol.png)
_Raycast vert : un sol est détecté sous le joueur. Raycast rouge : aucun sol détecté dessous._

```csharp
isGrounded = Physics.Raycast(
    transform.position,
    Vector3.down,
    groundCheckDistance
);
```

`Physics.Raycast` lance un rayon invisible. Dans cet exemple, il part du joueur vers le bas. Si un sol est détecté sous le joueur, il peut sauter ; sinon, il est considéré en l'air.

### Booléens, reset et GameManager

Un booléen stocke une réponse vraie ou fausse. Dans le mini-jeu, `active` indique si la plaque est pressée, `unlocked` si la porte peut s'ouvrir, `dead` ou `touched` si le joueur doit être replacé au spawn.

```csharp
public void ResetLevel()
{
    player.Reset();
    pressurePlate.Reset();
    door.Reset();
}
```

`Reset` remet les objets dans leur état de départ. Le GameManager évite de disperser toute la logique : il centralise le respawn, l'ouverture de la porte et la remise à zéro.

## Application : mini-jeu de plateforme

Le niveau se compose d'une zone de spawn sécurisée, de plateformes à atteindre, d'une plateforme mobile, d'un sol rouge mortel, d'une plaque de pression, d'une porte et d'une salle finale de victoire. Le joueur apprend à se déplacer, sauter, timer son saut et activer un mécanisme.

![Vue d'ensemble du niveau de plateforme dans l'éditeur Unity](/img/tutorials/info/unity/24-niveau-plateforme.png)
_Vue générale du niveau de plateforme 3D._

| Élément                | Notion Unity travaillée                                |
| ---------------------- | ------------------------------------------------------ |
| **Cube joueur**        | GameObject, Transform, Rigidbody, input, script C#     |
| **Plateformes**        | Transform, Collider, Material                          |
| **Plateforme mobile**  | `Update`, mouvement automatique, timing                |
| **Sol rouge**          | Collider, tag, `OnCollisionEnter`, respawn             |
| **Plaque de pression** | Trigger, booléen `active`, changement de Material      |
| **Porte**              | GameObject activé ou déplacé selon l'état de la plaque |
| **Salle finale**       | Zone sûre qui marque la réussite du niveau             |

## Ressources et utilisation de l'IA

Unity est un outil complet : l'interface, la physique, les composants et le code demandent du temps. Il est donc pertinent de combiner documentation officielle, tutoriels vidéo et assistants IA. Des outils comme Codex ou Claude Code peuvent aider à expliquer une erreur, proposer un script, structurer un niveau ou améliorer une documentation. Le résultat doit cependant toujours être testé dans Unity, car une IA peut se tromper de version, de package ou de réglage.

- [Unity Learn](https://learn.unity.com/learn) : cours officiels pour débuter.
- [Unity Documentation](https://docs.unity.com/en-us) : référence officielle des composants, fonctions et packages.
- [Unity et Claude Code](https://www.youtube.com/watch?v=xUYV2yxsaLs) : exemple d'utilisation d'une IA dans un workflow Unity.
- [Tutoriel Unity de 10h](https://www.youtube.com/watch?v=AmGSEH7QcDg) : parce qu'il en faut toujours un dans une documentation de code.
