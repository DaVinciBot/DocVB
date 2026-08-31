import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  translateTagsPageTitle,
} from "@docusaurus/theme-common";
import { usePluginData } from "@docusaurus/useGlobalData";
import SearchMetadata from "@theme/SearchMetadata";
import Heading from "@theme/Heading";
import type { Props } from "@theme/DocTagsListPage";
import type { DvbDocRef, DvbTagsData } from "@site/src/plugins/dvb-tags-data";
import { PLUGIN_NAME } from "@site/src/plugins/dvb-tags-data";

type TagsListItem = Props["tags"][number];

type SortKey = "volume" | "az" | "za";

type PointerHandlers = {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "volume", label: "Volume" },
  { key: "az", label: "A → Z" },
  { key: "za", label: "Z → A" },
];

const ITEM_CLASS = "previewItem";
const MORE_CLASS = "previewMore";

/** Largeur supposée du `+N` tant qu'il n'est pas monté pour être mesuré. */
const MORE_FALLBACK_WIDTH = 34;

/** Référence stable : évite de recréer un tableau vide à chaque rendu. */
const NO_DOCS: DvbDocRef[] = [];

const useIsomorphicLayoutEffect = ExecutionEnvironment.canUseDOM
  ? useLayoutEffect
  : useEffect;

/**
 * Les permaliens de tags sont globalement uniques — ils sont préfixés par le
 * `tagsPath` de leur version (`/tags/cdr` vs `/cdr/paris/2026/tags/cdr`). On
 * peut donc aplatir tous les scopes en une seule table sans avoir à résoudre
 * l'instance de docs courante.
 */
function useDocsByTag(): { [tagPermalink: string]: DvbDocRef[] } {
  const data = usePluginData(PLUGIN_NAME) as DvbTagsData | undefined;
  return useMemo(
    () => Object.assign({}, ...Object.values(data ?? {}).map((s) => s.tagDocs)),
    [data],
  );
}

function useSortedTags(tags: TagsListItem[], sort: SortKey): TagsListItem[] {
  return useMemo(() => {
    const byLabel = (a: TagsListItem, b: TagsListItem) =>
      a.label.localeCompare(b.label, "fr");
    if (sort === "volume") {
      return [...tags].sort((a, b) => b.count - a.count || byLabel(a, b));
    }
    return [...tags].sort((a, b) => (sort === "az" ? 1 : -1) * byLabel(a, b));
  }, [tags, sort]);
}

function padCount(count: number): string {
  return String(count).padStart(2, "0");
}

function Intro({
  title,
  sort,
  onSort,
}: {
  title: string;
  sort: SortKey;
  onSort: (key: SortKey) => void;
}) {
  return (
    <aside className={clsx("tagsIntro", "thin-scrollbar")}>
      <nav className="tagsCrumbs" aria-label="Fil d'Ariane">
        <Link to="/" className="tagsCrumb">
          Accueil
        </Link>
        <span className="tagsCrumbSep" aria-hidden="true">
          /
        </span>
        <span className="tagsCrumbCurrent" aria-current="page">
          {title}
        </span>
      </nav>

      <Heading as="h1" className="tagsTitle">
        {title}
      </Heading>

      <p className="tagsLead">
        Points d&apos;entrée transversaux dans la documentation : un tag
        regroupe les pages qui traitent d&apos;un même sujet, quel que soit le
        parcours.
      </p>

      <div className="tagsSpacer" />

      <div className="tagsSortBox">
        <span className="tagsSortLabel" id="tagsSortLabel">
          Tri
        </span>
        <div
          className="tagsSortChips"
          role="group"
          aria-labelledby="tagsSortLabel"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={clsx(
                "tagsSortChip",
                option.key === sort && "tagsSortChipActive",
              )}
              aria-pressed={option.key === sort}
              onClick={() => onSort(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/**
 * L'aperçu tient sur une seule ligne, quelle que soit la largeur disponible.
 * Le CSS le garantit (`nowrap` + `overflow: hidden`) ; ce composant décide
 * combien de titres afficher avant que le `+N` ne prenne le relais.
 *
 * La largeur d'un titre n'est connue qu'une fois rendu : on mesure donc une
 * fois tous les titres montés, on met leurs étendues en cache (elles ne
 * dépendent pas de la largeur du conteneur, les items étant en `flex: none`),
 * puis on recalcule le seuil à chaque redimensionnement à partir du cache.
 */
function PreviewCell({
  tag,
  docs,
  className,
  hover,
  onNavigate,
}: {
  tag: TagsListItem;
  docs: DvbDocRef[];
  className: string;
  hover: PointerHandlers;
  onNavigate: () => void;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const extents = useRef<number[] | null>(null);
  const [fit, setFit] = useState(docs.length);

  useIsomorphicLayoutEffect(() => {
    const cell = cellRef.current;
    if (!cell || docs.length === 0) {
      return undefined;
    }

    const compute = () => {
      const items = Array.from(
        cell.querySelectorAll<HTMLElement>(`.${ITEM_CLASS}`),
      );
      if (items.length === docs.length) {
        extents.current = items.map((el) => el.offsetLeft + el.offsetWidth);
      }
      const ends = extents.current;
      if (!ends || ends.length === 0) {
        return;
      }

      const style = getComputedStyle(cell);
      const room = cell.clientWidth - (parseFloat(style.paddingRight) || 0);
      const overflows =
        ends[ends.length - 1]! > room || tag.count > ends.length;

      let visible = ends.length;
      if (overflows) {
        const more = cell.querySelector<HTMLElement>(`.${MORE_CLASS}`);
        const reserve =
          (more?.offsetWidth ?? MORE_FALLBACK_WIDTH) +
          (parseFloat(style.columnGap) || 0);
        visible = 0;
        while (visible < ends.length && ends[visible]! <= room - reserve) {
          visible += 1;
        }
      }

      setFit(Math.max(1, visible));
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(cell);
    return () => observer.disconnect();
  }, [docs, fit, tag.count]);

  useEffect(() => {
    // Le swap de police élargit les titres sans toucher au conteneur : aucun
    // ResizeObserver ne se déclenche, il faut réinvalider le cache à la main.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) {
        extents.current = null;
        setFit(docs.length);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [docs]);

  const rest = tag.count - fit;

  return (
    <div ref={cellRef} className={className} {...hover} onClick={onNavigate}>
      {docs.slice(0, fit).map((doc) => (
        <Link
          key={doc.permalink}
          to={doc.permalink}
          className={ITEM_CLASS}
          onClick={(e) => e.stopPropagation()}
        >
          {doc.title}
        </Link>
      ))}
      {rest > 0 && <span className={MORE_CLASS}>+{rest}</span>}
    </div>
  );
}

function TagRow({
  tag,
  docs,
  countMax,
  active,
  onActive,
}: {
  tag: TagsListItem;
  docs: DvbDocRef[];
  countMax: number;
  active: boolean;
  onActive: (permalink: string | null) => void;
}) {
  const history = useHistory();
  const goToTag = () => history.push(tag.permalink);
  const cellClass = clsx("tagsCell", active && "tagsCellActive");

  // `onMouseEnter` est inutilisable ici : `@docusaurus/Link` l'écrase par son
  // propre gestionnaire de préchargement (`{...props}` étalé avant, cf. Link.js).
  // Les événements pointer, eux, traversent intacts.
  const hover: PointerHandlers = {
    onPointerEnter: () => onActive(tag.permalink),
    onPointerLeave: () => onActive(null),
    onFocus: () => onActive(tag.permalink),
    onBlur: () => onActive(null),
  };

  return (
    <>
      <Link to={tag.permalink} className={clsx(cellClass, "cellTag")} {...hover}>
        <span className="cellTagName">{tag.label}</span>
        {tag.description && (
          <span className="cellTagDesc">{tag.description}</span>
        )}
      </Link>

      <PreviewCell
        tag={tag}
        docs={docs}
        className={clsx(cellClass, "cellPreview")}
        hover={hover}
        onNavigate={goToTag}
      />

      <Link
        to={tag.permalink}
        tabIndex={-1}
        aria-hidden="true"
        className={clsx(cellClass, "cellCount")}
        {...hover}
      >
        <span className="countBar" aria-hidden="true">
          <span
            className="countBarFill"
            style={{ width: `${(tag.count / countMax) * 100}%` }}
          />
        </span>
        <span className="countValue">{padCount(tag.count)}</span>
      </Link>
    </>
  );
}

function DocTagsListPageContent({
  tags,
  title,
}: Props & { title: string }): React.ReactElement {
  const [sort, setSort] = useState<SortKey>("volume");
  const [active, setActive] = useState<string | null>(null);
  const docsByTag = useDocsByTag();
  const sortedTags = useSortedTags(tags, sort);
  const countMax = useMemo(
    () => Math.max(1, ...tags.map((tag) => tag.count)),
    [tags],
  );

  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.page.docsTagsListPage, "tagsIndexPage")}
    >
      <div className="tagsIndexRoot">
        <Intro title={title} sort={sort} onSort={setSort} />

        <div className="tagsTable">
          <div className="tagsHeadCell">Tag</div>
          <div className="tagsHeadCell">Contenu</div>
          <div className="tagsHeadCell tagsHeadCount">Références</div>

          {sortedTags.map((tag) => (
            <React.Fragment key={tag.permalink}>
              <TagRow
                tag={tag}
                docs={docsByTag[tag.permalink] ?? NO_DOCS}
                countMax={countMax}
                active={active === tag.permalink}
                onActive={setActive}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </HtmlClassNameProvider>
  );
}

function DocTagsListPageMetadata({ title }: { title: string }) {
  return (
    <>
      <PageMetadata title={title} />
      <SearchMetadata tag="doc_tags_list" />
    </>
  );
}

export default function DocTagsListPage(props: Props): React.ReactElement {
  const title = translateTagsPageTitle();
  return (
    <>
      <DocTagsListPageMetadata title={title} />
      <DocTagsListPageContent {...props} title={title} />
    </>
  );
}
