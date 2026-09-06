import type { LoadedContent } from "@docusaurus/plugin-content-docs";
import type { Plugin } from "@docusaurus/types";

/**
 * Les pages de tags de Docusaurus ne reçoivent pas assez de données pour la
 * mise en page DaVinciBot :
 *
 * - `DocTagDocListPage` ne connaît que SON tag, pas la liste complète des tags
 *   (nécessaire pour le rail « Tous les tags ») ;
 * - les documents listés sont réduits à `id | title | description | permalink`,
 *   donc leurs propres tags sont perdus (nécessaires pour les chips) ;
 * - `DocTagsListPage` ne reçoit que `label | permalink | description | count`,
 *   sans aucun document, alors que l'index affiche un aperçu du contenu de
 *   chaque tag (`tagDocs`).
 *
 * Ce plugin relit le contenu déjà chargé par les instances de
 * `plugin-content-docs` (aucun markdown n'est reparsé) et le sérialise dans les
 * données globales, scopé par `version.tagsPath` — qui vaut exactement le
 * `tag.allTagsPath` reçu côté composant. Chaque instance de docs et chaque
 * version a donc son propre jeu de tags, sans fuite de liens entre versions.
 */

export const PLUGIN_NAME = "dvb-tags-data";

/** Nombre de documents retenus par tag pour l'aperçu de l'index. */
const PREVIEW_LIMIT = 6;

export type DvbTagRef = {
  label: string;
  permalink: string;
};

export type DvbTag = DvbTagRef & {
  count: number;
};

export type DvbDocRef = {
  title: string;
  permalink: string;
};

export type DvbTagsScope = {
  /** Tous les tags de cette instance/version, triés par label. */
  tags: DvbTag[];
  /** Tags de chaque document, indexés par permalien de document. */
  docTags: { [docPermalink: string]: DvbTagRef[] };
  /**
   * Les `PREVIEW_LIMIT` premiers documents de chaque tag (triés par titre),
   * indexés par permalien de tag. Alimente la colonne « Contenu » de l'index.
   */
  tagDocs: { [tagPermalink: string]: DvbDocRef[] };
};

/** Indexé par `version.tagsPath`, c.-à-d. le `tag.allTagsPath` des composants. */
export type DvbTagsData = { [tagsPath: string]: DvbTagsScope };

export const EMPTY_TAGS_SCOPE: DvbTagsScope = {
  tags: [],
  docTags: {},
  tagDocs: {},
};

export default function dvbTagsData(): Plugin {
  return {
    name: PLUGIN_NAME,

    allContentLoaded({ allContent, actions }) {
      const docsInstances = (allContent["docusaurus-plugin-content-docs"] ??
        {}) as { [instanceId: string]: LoadedContent | undefined };

      const data: DvbTagsData = {};

      Object.values(docsInstances).forEach((instance) => {
        instance?.loadedVersions.forEach((version) => {
          const counts = new Map<string, DvbTag>();
          const docTags: DvbTagsScope["docTags"] = {};
          const tagDocs: DvbTagsScope["tagDocs"] = {};

          version.docs.forEach((doc) => {
            docTags[doc.permalink] = doc.tags.map(({ label, permalink }) => ({
              label,
              permalink,
            }));

            // Les docs `unlisted` sont retirés des compteurs pour rester
            // alignés sur le décompte affiché en production.
            if (doc.unlisted) {
              return;
            }

            doc.tags.forEach(({ label, permalink }) => {
              const known = counts.get(permalink);
              if (known) {
                known.count += 1;
              } else {
                counts.set(permalink, { label, permalink, count: 1 });
              }

              (tagDocs[permalink] ??= []).push({
                title: doc.title,
                permalink: doc.permalink,
              });
            });
          });

          // Même ordre que `tag.items` sur la page d'un tag, puis troncature :
          // seuls les premiers titres servent à l'aperçu.
          Object.keys(tagDocs).forEach((permalink) => {
            tagDocs[permalink] = tagDocs[permalink]!.sort((a, b) =>
              a.title.localeCompare(b.title, "fr"),
            ).slice(0, PREVIEW_LIMIT);
          });

          data[version.tagsPath] = {
            tags: [...counts.values()].sort((a, b) =>
              a.label.localeCompare(b.label, "fr"),
            ),
            docTags,
            tagDocs,
          };
        });
      });

      actions.setGlobalData(data);
    },
  };
}
