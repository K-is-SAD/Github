export interface FeatureItem {
    id: string;
    text: string;
    highlighted?: boolean;
  }

  export const features: FeatureItem[] = [
    { id: 'fields', text: 'Generate README files for public GitHub repositories' },
    { id: 'audit', text: 'Generate LinkedIn article and Twitter post summaries' },
    { id: 'backup', text: 'Create a basic pitch presentation (up to 10 slides)' },
    { id: 'service', text: 'Access to community chat for project feedback' },
    { id: 'events', text: 'Basic project analysis and suggestions' },
    { id: 'updates', text: 'Limited to 5 projects per month' },
    { id: 'notes', text: 'No Web3 publishing available' },
    { id: 'more', text: '+many more...', highlighted: true },
  ];

  export const basicFeatures: FeatureItem[] = [
 { id: 'fields', text: 'Generate README files for public GitHub repositories' },
    { id: 'audit', text: 'Generate LinkedIn article and Twitter post summaries' },
    { id: 'backup', text: 'Create a basic pitch presentation (up to 10 slides)' },
    { id: 'service', text: 'Access to community chat for project feedback' },
    { id: 'events', text: 'Basic project analysis and suggestions' },
    { id: 'updates', text: 'Limited to 5 projects per month' },
    { id: 'notes', text: 'No Web3 publishing available' },
  ];
  
  export const proFeatures: FeatureItem[] = [
    { id: 'fields', text: 'Generate README files for both public and private GitHub repositories' },
    { id: 'audit', text: 'Generate LinkedIn article and Twitter post summaries' },
    { id: 'backup', text: 'Create an advanced pitch presentation (up to 25 slides)' },
    { id: 'service', text: 'Priority project feedback through AI chat' },
    { id: 'events', text: 'Automatic vulnerability and optimization suggestions' },
    { id: 'updates', text: 'Save projects for later editing' },
    { id: 'notes', text: 'Up to 50 projects per month' },
    { id: 'web3_access', text: 'Export content and publish to Web3 platform' }
  ];
  
  export const enterpriseFeatures: FeatureItem[] = [
    { id: 'events', text: 'Attend events' },
    { id: 'updates', text: 'Automatic updates' },
    { id: 'notes', text: 'Audit log and notes' },
    { id: 'requests', text: 'Feature requests' },
  ];

  export interface CheckIconProps {
    color?: string;
    size?: number;
  }

  export const defaultIconConfig: CheckIconProps = {
    color: 'text-blue-500',
    size: 16
  };

