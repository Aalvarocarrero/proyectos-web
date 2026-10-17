import type { Metadata } from 'next';
import { FarmShowcase } from '@/components/farm-showcase';

export const metadata: Metadata = {
  title: 'Finca modelo de 10 ha · solo lectura',
  description: 'Explora una finca ficticia de 10 hectáreas en 360°, con sus áreas, animales y cultivos de ejemplo.',
  robots: { index: false, follow: false },
};

export default function FarmShowcasePage() {
  return <FarmShowcase />;
}
