import { ProductOverview } from '@/components/public/product-overview';
import { getPublicMetadata } from '@/lib/public-metadata';

export function generateMetadata() {
  return getPublicMetadata('en');
}

export default function AboutPage() {
  return <ProductOverview locale="en" />;
}
