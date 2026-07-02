import React, { useState } from "react";
import clsx from "clsx";
import { ThemeClassNames, useThemeConfig } from "@docusaurus/theme-common";
import {
  useAnnouncementBar,
  useScrollPosition,
} from "@docusaurus/theme-common/internal";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { translate } from "@docusaurus/Translate";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebar/Desktop/Content";
import styles from "./styles.module.css";

function useShowAnnouncementBar() {
  const { isActive } = useAnnouncementBar();
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);
  useScrollPosition(
    ({ scrollY }) => {
      if (isActive) {
        setShowAnnouncementBar(scrollY === 0);
      }
    },
    [isActive],
  );
  return isActive && showAnnouncementBar;
}

function useSidebarLabel(): string {
  const sidebar = useDocsSidebar();
  const items = useThemeConfig().navbar.items as Array<Record<string, any>>;
  const match = items.find((item) => item.sidebarId === sidebar?.name);
  return (match?.label as string) ?? "";
}

export default function DocSidebarDesktopContent({
  path,
  sidebar,
  className,
}: Props): React.ReactElement {
  const showAnnouncementBar = useShowAnnouncementBar();
  const label = useSidebarLabel();
  return (
    <nav
      aria-label={translate({
        id: "theme.docs.sidebar.navAriaLabel",
        message: "Docs sidebar",
        description: "The ARIA label for the sidebar navigation",
      })}
      className={clsx(
        "menu thin-scrollbar",
        styles.menu,
        showAnnouncementBar && styles.menuWithAnnouncementBar,
        className,
      )}
    >
      {label && (
        <div className="dvb-sidebar-title">{label} / Sommaire</div>
      )}
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, "menu__list")}>
        <DocSidebarItems items={sidebar} activePath={path} level={1} />
      </ul>
    </nav>
  );
}
