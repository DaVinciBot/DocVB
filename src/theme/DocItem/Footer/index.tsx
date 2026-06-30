import { useDoc } from "@docusaurus/plugin-content-docs/client";
import type { WrapperProps } from "@docusaurus/types";
import Footer from "@theme-original/DocItem/Footer";
import type FooterType from "@theme/DocItem/Footer";
import React, { JSX } from "react";
import Contributors, { type Contributor } from "./Contributors";

type Props = WrapperProps<typeof FooterType>;

/**
 * Wraps the default doc footer and appends a "Contributeurs" block built from
 * the page frontmatter. Contributors are declared manually via the
 * `additional_contributors` frontmatter key (no GitHub API call):
 *
 * ```yaml
 * additional_contributors:
 *   - username: Nom Affiché
 *     html_url: https://github.com/handle
 *     avatar_url: https://github.com/handle.png
 * ```
 *
 * Set `show_contributors: false` in the frontmatter to hide the block even when
 * contributors are declared.
 */
export default function FooterWrapper(props: Props): JSX.Element {
  const { metadata } = useDoc();
  const additionalContributors = metadata.frontMatter
    .additional_contributors as Contributor[] | undefined;
  const showContributors = metadata.frontMatter.show_contributors !== false;

  return (
    <>
      <Footer {...props} />
      {showContributors && (
        <Contributors contributors={additionalContributors} />
      )}
    </>
  );
}
