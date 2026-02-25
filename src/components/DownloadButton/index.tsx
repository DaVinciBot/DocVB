import React from "react";
import styles from "./styles.module.css";

interface DownloadButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  icon?: string;
}

export default function DownloadButton({
  href,
  children,
  size = "lg",
  icon,
}: DownloadButtonProps): React.JSX.Element {
  const buttonClass = `button button--primary button--${size}`;

  return (
    <a
      href={href}
      download
      className={`${buttonClass} ${styles.downloadButton}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </a>
  );
}
