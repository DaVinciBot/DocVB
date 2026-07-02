import React from "react";
import clsx from "clsx";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { translate } from "@docusaurus/Translate";
import { useColorMode } from "@docusaurus/theme-common";
import IconLightMode from "@theme/Icon/LightMode";
import IconDarkMode from "@theme/Icon/DarkMode";
import type { Props } from "@theme/ColorModeToggle";
import styles from "./styles.module.css";

export default function ColorModeToggle({
  className,
  buttonClassName,
}: Props): React.ReactElement {
  const isBrowser = useIsBrowser();
  const { colorMode, setColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <div className={clsx(styles.toggle, className)}>
      <button
        className={clsx(
          "clean-btn",
          styles.toggleButton,
          !isBrowser && styles.toggleButtonDisabled,
          buttonClassName,
        )}
        type="button"
        onClick={() => setColorMode(isDark ? "light" : "dark")}
        disabled={!isBrowser}
        title={translate({
          message: "Basculer entre thème clair et sombre",
          id: "theme.colorToggle.ariaLabel",
        })}
        aria-label={translate({
          message: "Basculer entre thème clair et sombre",
          id: "theme.colorToggle.ariaLabel",
        })}
      >
        <IconLightMode
          aria-hidden
          className={clsx(styles.toggleIcon, styles.lightToggleIcon)}
        />
        <IconDarkMode
          aria-hidden
          className={clsx(styles.toggleIcon, styles.darkToggleIcon)}
        />
      </button>
    </div>
  );
}
