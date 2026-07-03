import { Users } from "lucide-react";
import React, { JSX } from "react";
import styles from "./contributors.module.css";

const FALLBACK_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

export interface Contributor {
  /** Display name shown under the avatar. */
  username: string;
  /** Link to the contributor's profile (opened in a new tab). */
  html_url?: string;
  /** Avatar image URL; falls back to a generic icon when missing/broken. */
  avatar_url?: string;
}

interface ContributorsProps {
  contributors?: Contributor[];
}

/**
 * Renders the list of contributors declared in a doc's frontmatter. Returns
 * `null` when no contributor is provided so pages without the
 * `additional_contributors` key keep the default footer untouched.
 */
export default function Contributors({
  contributors,
}: ContributorsProps): JSX.Element | null {
  if (!contributors?.length) {
    return null;
  }

  const sorted = [...contributors].sort((a, b) =>
    a.username.localeCompare(b.username),
  );

  return (
    <div className={styles.contributors}>
      <h3 className={styles.heading}>
        <Users className={styles.headingIcon} aria-hidden="true" />
        Contributeur·ice·s
      </h3>

      <ul className={styles.wrapper}>
        {sorted.map((contributor) => {
          const username = contributor.username ?? "inconnu";
          const profileUrl = contributor.html_url ?? "";
          const avatarUrl = contributor.avatar_url || FALLBACK_AVATAR;

          return (
            <li key={username} className={styles.contributor}>
              <a
                className={styles.card}
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={username}
                aria-label={`Ouvrir le profil de ${username} (nouvel onglet)`}
              >
                <img
                  className={styles.avatar}
                  src={avatarUrl}
                  alt={`Avatar de ${username}`}
                  width={44}
                  height={44}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_AVATAR) {
                      e.currentTarget.src = FALLBACK_AVATAR;
                    }
                  }}
                />
                <span className={styles.name}>{username}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
