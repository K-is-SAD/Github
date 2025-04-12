export interface FeatureItem {
    id: string;
    text: string;
    highlighted?: boolean;
  }

  export const features: FeatureItem[] = [
    { id: 'fields', text: 'Advanced custom fields' },
    { id: 'audit', text: 'Audit log and data history' },
    { id: 'backup', text: 'Backup your account' },
    { id: 'service', text: 'Personalized Service' },
    { id: 'more', text: '+many more...', highlighted: true },
  ];

  export const basicFeatures: FeatureItem[] = [
    { id: 'fields', text: 'Advanced custom fields' },
    { id: 'audit', text: 'Audit log and data history' },
    { id: 'backup', text: 'Backup your account' },
  ];
  
  export const proFeatures: FeatureItem[] = [
    { id: 'service', text: 'Personalized Service' },
    { id: 'more', text: '+many more...', highlighted: true },
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