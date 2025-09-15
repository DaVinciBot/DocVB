# Meilleures pratiques en matière de CEM pour la conception de circuits imprimés

## Introduction

Lors de la conception de circuits imprimés, il est essentiel de suivre les meilleures pratiques afin de garantir des performances CEM optimales. Ce document présente les principales directives et recommandations destinées à aider les concepteurs à minimiser les interférences électromagnétiques (EMI) et à améliorer les performances globales de leurs conceptions de circuits imprimés.

## Meilleures pratiques

En matière de conception de circuits imprimés, il existe des directives permettant d'optimiser les performances CEM :

- Toujours tenir compte et déterminer où et comment les courants de retour circulent.
- Ne faites pas passer les signaux au-dessus des espaces de masse.
- Divisez les circuits imprimés à signaux mixtes en sections analogiques et numériques distinctes.
- Ne divisez pas le plan de retour de courant ; utilisez un plan solide sous les sections analogiques et numériques
de la carte.
- Acheminez les signaux numériques uniquement dans la section numérique de la carte (pour toutes les couches liées au numérique).
- Si les plans de masse ou d'alimentation sont divisés pour une raison spécifique (c'est-à-dire mécanique et/ou
électrique), ne faites passer aucune trace à travers la division sur une couche adjacente.
- Les traces (analogiques ou numériques) qui doivent passer au-dessus d'une division de plan d'alimentation doivent se trouver sur une couche
adjacente à un plan de masse solide (analogique ou numérique).
- Les convertisseurs A/N et N/A, ainsi que la plupart des autres circuits intégrés à signaux mixtes, doivent être considérés
comme des dispositifs analogiques avec une section numérique, et non comme des dispositifs numériques avec une section analogique.
- Les désignations AGND et DGND sur les broches d'un circuit intégré à signaux mixtes font référence à l'endroit où les
broches sont connectées en interne, et n'impliquent pas où ni comment elles doivent être
connectées en externe. Sur la plupart des circuits intégrés à signaux mixtes, les broches AGND et DGND
doivent être connectées au plan de retour analogique.
- Le condensateur de découplage numérique doit être connecté directement à la broche de masse numérique.
- Les condensateurs de découplage sont nécessaires pour fournir, via un chemin à faible inductance, une partie
ou la totalité du courant d'alimentation transitoire requis lors de la commutation d'une porte logique du circuit intégré.
- Les condensateurs de découplage sont nécessaires pour court-circuiter, ou au moins réduire, le bruit réinjecté
dans le système de masse d'alimentation.
- Le découplage n'est pas le processus qui consiste à placer un condensateur à côté d'un circuit intégré pour fournir le
courant de commutation transitoire ; il s'agit plutôt du processus qui consiste à placer un réseau L-C à côté
du circuit intégré pour fournir le courant de commutation transitoire.
- La valeur du ou des condensateurs de découplage est importante pour l'efficacité du découplage à basse fréquence.

- La valeur du ou des condensateurs de découplage n'est pas importante à haute fréquence. À haute
fréquence, le critère le plus important est de réduire l'inductance en série avec les
condensateurs de découplage.
- Un découplage haute fréquence efficace nécessite l'utilisation d'un grand nombre de condensateurs.
- Placez les condensateurs de découplage aussi près que possible du dispositif.
- Acheminez les signaux RFI et RFO de manière symétrique et évitez les longues traces de signaux pour le
réseau d'adaptation. Maintenez les traces entre RFO1 et RFO2 proches les unes des autres et
procédez de même pour RFI1 et RFI2.
- Les composants d'adaptation doivent être placés à proximité les uns des autres et de manière symétrique

## Sources et lectures complémentaires

- Note d'application ST AN5240 : [Comment concevoir un circuit imprimé pour les produits NFC/RFID ST25R](https://www.st.com/resource/en/application_note/an5240-layout-recommendations-for-the-design-of-boards-with-the-st25r391616b-1717b-18-19b-and-2020b-devices-stmicroelectronics.pdf)
