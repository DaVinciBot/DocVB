import type {ReactNode} from 'react';
import Heading from '@theme/Heading';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className="col col--4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
          <Svg className="h-8 w-8 text-primary" role="img" />
        </div>
        <div className="text-center">
          <Heading as="h3" className="text-xl font-bold mb-2">
            {title}
          </Heading>
          <p className="text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className="py-20">
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
