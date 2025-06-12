
import type { Product } from '@/types';

// For now, products are a static list. This can be expanded to fetch from Firestore if needed.
const staticProducts: Product[] = [
  { id: 'prod1', name: 'Super Saas Suite', description: 'All-in-one SaaS solution' },
  { id: 'prod2', name: 'Cloud Storage Pro', description: 'Unlimited cloud storage' },
  { id: 'prod3', name: 'DevTools Ultimate', description: 'Productivity tools for developers' },
];

export async function getProducts(): Promise<Product[]> {
  // Simulate async operation if this were fetching from a DB
  return Promise.resolve(staticProducts);
}

export async function getProductById(id: string): Promise<Product | null> {
  return Promise.resolve(staticProducts.find(p => p.id === id) || null);
}
