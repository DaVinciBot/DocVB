import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

type TutorialItem = {
  title: string;
  description: string;
  link: string;
  icon: string;
  color: string;
};

const TutorialList: TutorialItem[] = [
  {
    title: 'Create a Document',
    description: 'Learn how to create your first Markdown document and organize content with sidebars.',
    link: '/docs/tutorial-basics/create-a-document',
    icon: '📄',
    color: 'blue'
  },
  {
    title: 'Create a Page',
    description: 'Build custom React pages and create unique layouts for your documentation site.',
    link: '/docs/tutorial-basics/create-a-page',
    icon: '🎨',
    color: 'purple'
  },
  {
    title: 'Create a Blog Post',
    description: 'Start blogging with Docusaurus and engage your community with regular updates.',
    link: '/docs/tutorial-basics/create-a-blog-post',
    icon: '✍️',
    color: 'green'
  },
  {
    title: 'Markdown Features',
    description: 'Discover advanced Markdown features, code blocks, and interactive elements.',
    link: '/docs/tutorial-basics/markdown-features',
    icon: '⚡',
    color: 'orange'
  },
  {
    title: 'Deploy Your Site',
    description: 'Learn how to deploy your documentation to production with various hosting options.',
    link: '/docs/tutorial-basics/deploy-your-site',
    icon: '🚀',
    color: 'red'
  },
  {
    title: 'Translate Your Site',
    description: 'Localize your documentation for a global audience with Docusaurus i18n support.',
    link: '/docs/tutorial-extras/translate-your-site',
    icon: '🌐',
    color: 'teal'
  },
];

function TutorialCard({title, description, link, icon, color}: TutorialItem) {
  return (
    <Link to={link} className="group block rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 p-6 mb-6 no-underline">
      <div className="flex items-start">
        <div className={`text-4xl mr-4`}>{icon}</div>
        <div>
          <Heading as="h3" className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
            {title}
          </Heading>
          <p className="text-base text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function TutorialShowcase(): ReactNode {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <Heading as="h2" className="text-3xl font-bold text-center mb-12">
          Start Your Journey
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TutorialList.map((props, idx) => (
            <TutorialCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
