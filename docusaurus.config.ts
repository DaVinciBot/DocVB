import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'DaVinciBot',
  tagline: 'Learn to build amazing documentation',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.davincibot.fr',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'davincibot', // Usually your GitHub org/user name.
  projectName: 'DocVB', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  plugins: [
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

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // This makes docs the main page
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/davincibot/docvb/tree/main/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/dvb_og_img.jpg',
    navbar: {
      title: 'DaVinciBot',
      logo: {
        alt: 'DaVinciBot Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Formation',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Tutorials',
          items: [
            {
              label: 'Create Documents',
              to: '/tutorial-basics/create-a-document',
            },
            {
              label: 'Create Pages',
              to: '/tutorial-basics/create-a-page',
            },
            {
              label: 'Markdown Features',
              to: '/tutorial-basics/markdown-features',
            },
          ],
        },
        {
          title: 'Advanced',
          items: [
            {
              label: 'Deploy Your Site',
              to: '/tutorial-basics/deploy-your-site',
            },
            {
              label: 'Manage Versions',
              to: '/tutorial-extras/manage-docs-versions',
            },
            {
              label: 'Translate Site',
              to: '/tutorial-extras/translate-your-site',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/your-repo/docvb',
            },
            {
              label: 'Documentation',
              to: '/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DaVinciBot. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
