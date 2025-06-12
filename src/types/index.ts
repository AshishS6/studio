export interface DSA {
  id: string;
  name: string;
  email: string;
  activeLinks: number;
  signups: number;
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
  creationDate: string; 
  link: string;
}

export interface SignupTrendData {
  date: string;
  count: number;
}

export interface PerformanceData {
  name: string; 
  value: number; 
}

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string; // e.g. "+5% from last month"
}
