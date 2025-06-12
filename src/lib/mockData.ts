import type { DSA, ReferralLink, Product, SignupTrendData, PerformanceData } from '@/types';

export const mockDSAs: DSA[] = [
  { id: 'dsa1', name: 'Alice Wonderland', email: 'alice@example.com', activeLinks: 3, signups: 120, status: 'Active', avatar: 'https://placehold.co/100x100' },
  { id: 'dsa2', name: 'Bob The Builder', email: 'bob@example.com', activeLinks: 2, signups: 85, status: 'Active', avatar: 'https://placehold.co/100x100' },
  { id: 'dsa3', name: 'Charlie Chaplin', email: 'charlie@example.com', activeLinks: 1, signups: 30, status: 'Suspended', avatar: 'https://placehold.co/100x100' },
  { id: 'dsa4', name: 'Diana Prince', email: 'diana@example.com', activeLinks: 5, signups: 250, status: 'Active', avatar: 'https://placehold.co/100x100' },
];

export const mockProducts: Product[] = [
  { id: 'prod1', name: 'Super Saas Suite', description: 'All-in-one SaaS solution' },
  { id: 'prod2', name: 'Cloud Storage Pro', description: 'Unlimited cloud storage' },
  { id: 'prod3', name: 'DevTools Ultimate', description: 'Productivity tools for developers' },
];

export const mockReferralLinks: ReferralLink[] = [
  { 
    id: 'link1', 
    code: 'ALICEPROD1', 
    dsaId: 'dsa1', 
    dsaName: 'Alice Wonderland', 
    productId: 'prod1', 
    productName: 'Super Saas Suite', 
    clicks: 500, 
    signups: 50, 
    conversionRate: '10.00%', 
    creationDate: '2023-01-15T10:00:00Z',
    link: 'https://example.com/refer/ALICEPROD1'
  },
  { 
    id: 'link2', 
    code: 'ALICEPROD2', 
    dsaId: 'dsa1', 
    dsaName: 'Alice Wonderland', 
    productId: 'prod2', 
    productName: 'Cloud Storage Pro', 
    clicks: 300, 
    signups: 40, 
    conversionRate: '13.33%', 
    creationDate: '2023-02-20T11:00:00Z',
    link: 'https://example.com/refer/ALICEPROD2'
  },
  { 
    id: 'link3', 
    code: 'BOBPROD1', 
    dsaId: 'dsa2', 
    dsaName: 'Bob The Builder', 
    productId: 'prod1', 
    productName: 'Super Saas Suite', 
    clicks: 400, 
    signups: 35, 
    conversionRate: '8.75%', 
    creationDate: '2023-03-10T09:00:00Z',
    link: 'https://example.com/refer/BOBPROD1'
  },
  { 
    id: 'link4', 
    code: 'DIANAPROD3', 
    dsaId: 'dsa4', 
    dsaName: 'Diana Prince', 
    productId: 'prod3', 
    productName: 'DevTools Ultimate', 
    clicks: 1200, 
    signups: 150, 
    conversionRate: '12.50%', 
    creationDate: '2023-04-05T14:00:00Z',
    link: 'https://example.com/refer/DIANAPROD3'
  },
];

export const mockSignupTrends: SignupTrendData[] = [
  { date: 'Jan', count: 150 },
  { date: 'Feb', count: 200 },
  { date: 'Mar', count: 180 },
  { date: 'Apr', count: 220 },
  { date: 'May', count: 250 },
  { date: 'Jun', count: 230 },
];

export const mockTopDSAs: PerformanceData[] = mockDSAs
  .filter(dsa => dsa.status === 'Active')
  .map(dsa => ({ name: dsa.name, value: dsa.signups }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 5);

export const mockProductPerformance: PerformanceData[] = mockProducts.map(product => {
  const productSignups = mockReferralLinks
    .filter(link => link.productId === product.id)
    .reduce((sum, link) => sum + link.signups, 0);
  return { name: product.name, value: productSignups };
});

export const mockDsaUser = {
  id: 'dsa1',
  name: 'Alice Wonderland',
  email: 'alice@example.com',
};

export const mockDsaReferralLinks: ReferralLink[] = mockReferralLinks.filter(link => link.dsaId === 'dsa1');
