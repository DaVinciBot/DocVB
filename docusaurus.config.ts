import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "DaVinciBot",
  tagline: "Documentation officielle de DaVinciBot",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://docs.davincibot.fr",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "davincibot", // Usually your GitHub org/user name.
  projectName: "DocVB", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "fr",
    locales: ["fr"],
  },

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "cdr-paris",
        path: "cdr/paris",
        routeBasePath: "cdr/paris",
        sidebarPath: "./sidebars/cdr.ts",
        editUrl: "https://github.com/davincibot/docvb/tree/main/",
        showLastUpdateTime: true,
        showLastUpdateAuthor: false,
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        // Versionnage année par année : la doc de travail (cdr/paris)
        // correspond à la saison en cours, les saisons passées sont archivées
        // via `npm run docusaurus docs:version:cdr-paris <année>`.
        lastVersion: "current",
        versions: {
          current: {
            label: "2025/2026",
            path: "2026",
            banner: "unreleased",
          },
          2025: {
            label: "2024/2025",
            path: "2025",
          },
        },
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "cdr-nantes",
        path: "cdr/nantes",
        routeBasePath: "cdr/nantes",
        sidebarPath: "./sidebars/cdr.ts",
        editUrl: "https://github.com/davincibot/docvb/tree/main/",
        showLastUpdateTime: true,
        showLastUpdateAuthor: false,
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        // Mêmes paramètres que CDR Paris ; les archives se créeront via
        // `npm run docusaurus docs:version:cdr-nantes <année>` en fin de saison.
        lastVersion: "current",
        versions: {
          current: {
            label: "2025/2026",
            path: "2026",
            banner: "unreleased",
          },
        },
      },
    ],
    async function myPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require("@tailwindcss/postcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        docsRouteBasePath: "/",
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        searchBarShortcut: true,
        searchBarShortcutKeymap: "mod+k",
        searchBarShortcutHint: true,
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars/main.ts",
          routeBasePath: "/", // This makes docs the main page
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/davincibot/docvb/tree/main/",
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "light",
      respectPrefersColorScheme: true,
    },
    // Replace with your project's social card
    image: "img/dvb_og_img.jpg",
    navbar: {
      title: "DaVinciBot",
      logo: {
        alt: "DaVinciBot Logo",
        src: "img/logo.svg",
        srcDark: "img/logo_dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docSidebar",
          position: "left",
          label: "Minis-projets",
        },
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Formation",
        },
        {
          type: "docSidebar",
          sidebarId: "cdrSidebar",
          docsPluginId: "cdr-paris",
          position: "left",
          label: "CDR Paris",
        },
        {
          type: "docSidebar",
          sidebarId: "cdrSidebar",
          docsPluginId: "cdr-nantes",
          position: "left",
          label: "CDR Nantes",
        },
        {
          type: "docsVersionDropdown",
          docsPluginId: "cdr-paris",
          position: "right",
          dropdownActiveClassDisabled: true,
          className: "navbar-cdr-paris-version-dropdown",
        },
        {
          type: "docsVersionDropdown",
          docsPluginId: "cdr-nantes",
          position: "right",
          dropdownActiveClassDisabled: true,
          className: "navbar-cdr-nantes-version-dropdown",
        },
        {
          href: "https://github.com/DaVinciBot",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub DaVinciBot",
        },
      ],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
    footer: {
      style: "dark",
      logo: {
        alt: "DaVinciBot",
        src: "img/logo_dark.svg",
        href: "https://davincibot.fr",
        width: 40,
      },
      links: [
        {
          title: "Community",
          items: [
            {
              label: "Instagram",
              href: "https://www.instagram.com/davincibot_pulv/",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/company/davincibot/",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/DaVinciBot",
            },
            {
              label: "davincibot.fr",
              href: "https://davincibot.fr",
            },
            {
              label: "Documentation",
              to: "/",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DaVinciBot.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "bash",
        "c",
        "cpp",
        "csharp",
        "css",
        "json",
        "latex",
        "markdown",
        "powershell",
        "python",
        "rust",
        "sql",
        "typescript",
        "yaml",
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
