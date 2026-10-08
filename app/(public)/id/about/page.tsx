import { ProductOverview } from '@/components/public/product-overview';
import { getPublicMetadata } from '@/lib/public-metadata';

export function generateMetadata() {
  return getPublicMetadata('id');
}

export default function AboutPage() {
  return <ProductOverview locale="id" />;
}
