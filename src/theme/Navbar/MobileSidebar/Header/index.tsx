import React from "react";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import IconClose from "@theme/Icon/Close";
import NavbarLogo from "@theme/Navbar/Logo";

function CloseButton() {
  const mobileSidebar = useNavbarMobileSidebar();
  return (
    <button
      type="button"
      aria-label={translate({
        id: "theme.docs.sidebar.closeSidebarButtonAriaLabel",
        message: "Close navigation bar",
        description: "The ARIA label for close button of mobile sidebar",
      })}
      className="clean-btn navbar-sidebar__close"
      onClick={() => mobileSidebar.toggle()}
    >
      <IconClose color="var(--ifm-color-emphasis-600)" />
    </button>
  );
}

function GithubLink() {
  const items = useThemeConfig().navbar.items as Array<Record<string, any>>;
  const gh = items.find(
    (item) =>
      typeof item.className === "string" &&
      item.className.includes("header-github-link"),
  );
  if (!gh?.href) {
    return null;
  }
  return (
    <a
      className={gh.className}
      href={gh.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={(gh["aria-label"] as string) ?? "GitHub"}
    />
  );
}

export default function NavbarMobileSidebarHeader(): React.ReactElement {
  return (
    <div className="navbar-sidebar__brand">
      <NavbarLogo />
      <GithubLink />
      <NavbarColorModeToggle className="margin-right--md" />
      <CloseButton />
    </div>
  );
}
