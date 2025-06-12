import KPICard from '@/components/shared/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDSAs, mockReferralLinks, mockSignupTrends, mockTopDSAs, mockProductPerformance } from '@/lib/mockData';
import { Users, Link as LinkIcon, BarChart2, Edit, Trash2, PlusCircle, TrendingUp, TrendingDown, ExternalLink, Copy, Send } from 'lucide-react';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, CartesianGrid } from 'recharts';

const chartConfig = {
  signups: { label: "Signups", color: "hsl(var(--chart-1))" },
  clicks: { label: "Clicks", color: "hsl(var(--chart-2))" },
};

const topDsaChartConfig = {
  value: { label: "Signups", color: "hsl(var(--chart-1))" },
};

const productPerformanceChartConfig = {
  value: { label: "Signups", color: "hsl(var(--chart-1))" },
};


export default function AdminDashboardPage() {
  const totalDSAs = mockDSAs.length;
  const activeReferralLinks = mockReferralLinks.length;
  const totalSignups = mockReferralLinks.reduce((sum, link) => sum + link.signups, 0);
  const totalClicks = mockReferralLinks.reduce((sum, link) => sum + link.clicks, 0);
  const conversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(2) + '%' : '0%';

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage DSAs, referral links, and view performance analytics.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <KPICard title="Total DSAs" value={totalDSAs} icon={Users} trend="+2 this month" />
        <KPICard title="Active Links" value={activeReferralLinks} icon={LinkIcon} trend="+10 this month" />
        <KPICard title="Total Signups" value={totalSignups} icon={TrendingUp} trend="+150 this month" />
        <KPICard title="Total Clicks" value={totalClicks} icon={BarChart2} trend="+1.2k this month" />
        <KPICard title="Conversion Rate" value={conversionRate} icon={TrendingUp} trend="+1.5% this month" />
      </section>

      <Tabs defaultValue="dsaManagement" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
          <TabsTrigger value="dsaManagement">DSA Management</TabsTrigger>
          <TabsTrigger value="referralManagement">Referral Link Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dsaManagement">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>DSA Management</CardTitle>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New DSA</Button>
              </div>
              <CardDescription>View, add, edit, or suspend DSA accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Active Links</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDSAs.map((dsa) => (
                    <TableRow key={dsa.id}>
                      <TableCell className="font-medium">{dsa.name}</TableCell>
                      <TableCell>{dsa.email}</TableCell>
                      <TableCell>{dsa.activeLinks}</TableCell>
                      <TableCell>{dsa.signups}</TableCell>
                      <TableCell><Badge variant={dsa.status === 'Active' ? 'default' : 'destructive'}>{dsa.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referralManagement">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Referral Link Management</CardTitle>
                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Generate New Link</Button>
              </div>
              <CardDescription>Manage referral links and their performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>DSA</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReferralLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.code}</TableCell>
                      <TableCell>{link.dsaName}</TableCell>
                      <TableCell>{link.productName}</TableCell>
                      <TableCell>{link.clicks}</TableCell>
                      <TableCell>{link.signups}</TableCell>
                      <TableCell>{link.conversionRate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Copy className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Signup Trends</CardTitle>
                <CardDescription>Monthly signup performance.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <RechartsLineChart data={mockSignupTrends}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="count" type="monotone" stroke="var(--color-signups)" strokeWidth={2} dot={false} name="Signups" />
                  </RechartsLineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing DSAs</CardTitle>
                <CardDescription>DSAs with the most signups.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={topDsaChartConfig} className="h-[300px] w-full">
                  <BarChart data={mockTopDSAs} layout="vertical" margin={{ right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} name="Signups" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
             <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Signups per product.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer config={productPerformanceChartConfig} className="h-[300px] w-full max-w-md">
                  <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={mockProductPerformance} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="var(--color-value)" />
                     <ChartLegend content={<ChartLegendContent />} />
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
