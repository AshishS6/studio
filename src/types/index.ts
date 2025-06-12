
export interface DSA {
  id: string;
  name: string;
  email: string;
  activeLinks: number; // This will be managed by referral link additions/deletions
  signups: number; // This will be managed by referral link updates
  status: 'Active' | 'Suspended';
  avatar?: string; 
}

export interface Product {
  id: string;
  name: string;
  description: string;
}

export interface ReferralLink {
  id: string;
  code: string;
  dsaId: string;
  dsaName: string; 
  productId: string;
  productName: string; 
  clicks: number;
  signups: number;
  conversionRate: string; 
  creationDate: string; // ISO String
  link: string;
}

export interface SignupTrendData {
  date: string; // e.g., 'Jan', 'Feb'
  count: number;
}

export interface PerformanceData {
  name: string; // DSA name or Product name
  value: number; // e.g., signups
}

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string; // e.g. "+5% from last month"
}
