import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  usePluralForm,
} from "@docusaurus/theme-common";
import { translate } from "@docusaurus/Translate";
import { usePluginData } from "@docusaurus/useGlobalData";
import SearchMetadata from "@theme/SearchMetadata";
import Unlisted from "@theme/ContentVisibility/Unlisted";
import Heading from "@theme/Heading";
import type { Props } from "@theme/DocTagDocListPage";
import type {
  DvbTagRef,
  DvbTagsData,
  DvbTagsScope,
} from "@site/src/plugins/dvb-tags-data";
import { EMPTY_TAGS_SCOPE, PLUGIN_NAME } from "@site/src/plugins/dvb-tags-data";

// Très simple pluralisation : suffisant pour le titre du document.
function useNDocsTaggedPlural() {
  const { selectMessage } = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: "theme.docs.tagDocListPageTitle.nDocsTagged",
          description:
            'Pluralized label for "{count} docs tagged". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: "One doc tagged|{count} docs tagged",
        },
        { count },
      ),
    );
}

// Conservé tel quel : alimente le <title> et l'index de recherche, même si
// le titre visible de la page est désormais le seul label du tag.
function usePageTitle(props: Props): string {
  const nDocsTaggedPlural = useNDocsTaggedPlural();
  return translate(
    {
      id: "theme.docs.tagDocListPageTitle",
      description: "The title of the page for a docs tag",
      message: '{nDocsTagged} with "{tagName}"',
    },
    { nDocsTagged: nDocsTaggedPlural(props.tag.count), tagName: props.tag.label },
  );
}

function useTagsScope(allTagsPath: string): DvbTagsScope {
  const data = usePluginData(PLUGIN_NAME) as DvbTagsData | undefined;
  return data?.[allTagsPath] ?? EMPTY_TAGS_SCOPE;
}

function padCount(count: number): string {
  return String(count).padStart(2, "0");
}

// Reprend le markup de `@theme/DocBreadcrumbs` pour hériter du style déjà
// appliqué aux pages de docs (« ACCUEIL » gris injecté en ::before, liens en
// encre, dernier segment en bleu) — cf. custom.css, section « Breadcrumb ».
function Breadcrumbs({ tag }: { tag: Props["tag"] }) {
  return (
    <nav
      className="theme-doc-breadcrumbs dvbTagCrumbs"
      aria-label={translate({
        id: "theme.docs.breadcrumbs.navAriaLabel",
        message: "Fil d'Ariane",
        description: "The ARIA label for the breadcrumbs",
      })}
    >
      <ul className="breadcrumbs">
        <li className="breadcrumbs__item">
          <Link
            aria-label={translate({
              id: "theme.docs.breadcrumbs.home",
              message: "Page d'accueil",
              description: "The ARIA label for the home page in the breadcrumbs",
            })}
            className="breadcrumbs__link"
            to="/"
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </li>
        <li className="breadcrumbs__item">
          <Link className="breadcrumbs__link" to={tag.allTagsPath}>
            Tags
          </Link>
        </li>
        <li className="breadcrumbs__item breadcrumbs__item--active">
          <span className="breadcrumbs__link">{tag.label}</span>
        </li>
      </ul>
    </nav>
  );
}

function TagHeader({ tag }: { tag: Props["tag"] }) {
  return (
    <header className="dvbTagHead">
      <Heading as="h1" className="dvbTagTitle">
        {tag.label}
      </Heading>
      <p className="dvbTagLead">
        <span className="dvbTagLeadCount">
          {tag.count} documentation{tag.count > 1 ? "s" : ""}
        </span>
        {tag.description && (
          <>
            <span className="dvbTagLeadSep" aria-hidden="true">
              •
            </span>
            {tag.description}
          </>
        )}
      </p>
    </header>
  );
}

function DocChips({
  tags,
  currentPermalink,
}: {
  tags: DvbTagRef[];
  currentPermalink: string;
}) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <div className="dvbTagChips">
      {tags.map((docTag) => (
        <Link
          key={docTag.permalink}
          to={docTag.permalink}
          className={clsx(
            "dvbTagChip",
            docTag.permalink === currentPermalink && "dvbTagChipActive",
          )}
        >
          {docTag.label}
        </Link>
      ))}
    </div>
  );
}

function DocList({
  tag,
  scope,
}: {
  tag: Props["tag"];
  scope: DvbTagsScope;
}) {
  return (
    <ol className="dvbTagList">
      {tag.items.map((doc, index) => (
        <li key={doc.id} className="dvbTagItem">
          <span className="dvbTagIndex" aria-hidden="true">
            {padCount(index + 1)}
          </span>
          <div className="dvbTagItemBody">
            <Heading as="h2" className="dvbTagItemTitle">
              <Link to={doc.permalink} className="dvbTagItemLink">
                {doc.title}
              </Link>
            </Heading>
            {doc.description && (
              <p className="dvbTagItemDesc">{doc.description}</p>
            )}
            <DocChips
              tags={scope.docTags[doc.permalink] ?? []}
              currentPermalink={tag.permalink}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

function TagRail({ tag, scope }: { tag: Props["tag"]; scope: DvbTagsScope }) {
  return (
    <aside className={clsx("dvbTagRail", "thin-scrollbar")}>
      <div className="dvbTagRailHead">
        <Heading as="h2" className="dvbTagRailTitle">
          Tous les tags
        </Heading>
        <Link to={tag.allTagsPath} className="dvbTagRailAll">
          Voir tous →
        </Link>
      </div>
      {scope.tags.length > 0 && (
        <ul className="dvbTagRailList">
          {scope.tags.map((railTag) => {
            const isActive = railTag.permalink === tag.permalink;
            return (
              <li key={railTag.permalink}>
                <Link
                  to={railTag.permalink}
                  className={clsx(
                    "dvbTagRailItem",
                    isActive && "dvbTagRailItemActive",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="dvbTagRailLabel">{railTag.label}</span>
                  <span className="dvbTagRailCount">{railTag.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

function DocTagDocListPageMetadata({ title, tag }: Props & { title: string }) {
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="doc_tag_doc_list" />
    </>
  );
}

function DocTagDocListPageContent({ tag }: Props): React.ReactElement {
  const scope = useTagsScope(tag.allTagsPath);
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.page.docsTagDocListPage)}
    >
      <div className="container margin-vert--lg">
        {tag.unlisted && <Unlisted />}
        <div className="dvbTagPage">
          <div className="dvbTagMain">
            <Breadcrumbs tag={tag} />
            <TagHeader tag={tag} />
            <hr className="dvbTagRule" />
            <DocList tag={tag} scope={scope} />
          </div>
          <TagRail tag={tag} scope={scope} />
        </div>
      </div>
    </HtmlClassNameProvider>
  );
}

export default function DocTagDocListPage(props: Props): React.ReactElement {
  const title = usePageTitle(props);
  return (
    <>
      <DocTagDocListPageMetadata {...props} title={title} />
      <DocTagDocListPageContent {...props} />
    </>
  );
}
