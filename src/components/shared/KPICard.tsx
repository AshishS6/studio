import type { KPICardProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function KPICard({ title, value, icon: Icon, description, trend }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && <p className={cn("text-xs mt-1", trend.startsWith('+') ? "text-green-600" : "text-red-600")}>{trend}</p>}
      </CardContent>
    </Card>
  );
}
