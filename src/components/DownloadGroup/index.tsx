import React from 'react';
import styles from './styles.module.css';

interface DownloadGroupProps {
  children: React.ReactNode;
  title?: string;
}

export default function DownloadGroup({
  children,
  title,
}: DownloadGroupProps): React.JSX.Element {
  return (
    <div className={styles.downloadGroup}>
      {title && <h4 className={styles.groupTitle}>{title}</h4>}
      <div className={styles.buttonContainer}>{children}</div>
    </div>
  );
}
