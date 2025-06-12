
'use client';

import { useEffect, useState } from 'react';
import KPICard from '@/components/shared/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Link as LinkIcon, BarChart2, Edit, Trash2, PlusCircle, TrendingUp, ExternalLink, Copy, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { DSA, ReferralLink } from '@/types';
import { getDSAs } from '@/services/dsaService';
import { getReferralLinks } from '@/services/referralLinkService';
import { mockSignupTrends, mockTopDSAs as mockTopDSAsData, mockProductPerformance as mockProductPerformanceData } from '@/lib/mockData'; // Keep for analytics for now

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
  const [dsas, setDsas] = useState<DSA[]>([]);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [dsasData, linksData] = await Promise.all([
          getDSAs(),
          getReferralLinks()
        ]);
        setDsas(dsasData);
        setReferralLinks(linksData);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalDSAs = dsas.length;
  const activeReferralLinks = referralLinks.length;
  const totalSignups = referralLinks.reduce((sum, link) => sum + link.signups, 0);
  const totalClicks = referralLinks.reduce((sum, link) => sum + link.clicks, 0);
  const conversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(2) + '%' : '0%';
  
  // For analytics, we'll still use mock data or derived data from fetched DSAs if simple enough
  const mockTopDSAs = dsas
    .filter(dsa => dsa.status === 'Active')
    .map(dsa => ({ name: dsa.name, value: dsa.signups }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <CardTitle className="text-xl mb-2">Oops! Something went wrong.</CardTitle>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage DSAs, referral links, and view performance analytics.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <KPICard title="Total DSAs" value={totalDSAs} icon={Users} />
        <KPICard title="Active Links" value={activeReferralLinks} icon={LinkIcon} />
        <KPICard title="Total Signups" value={totalSignups} icon={TrendingUp} />
        <KPICard title="Total Clicks" value={totalClicks} icon={BarChart2} />
        <KPICard title="Conversion Rate" value={conversionRate} icon={TrendingUp} />
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
                <Button size="sm" asChild>
                  <Link href="/admin/dsa/create">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New DSA
                  </Link>
                </Button>
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
                  {dsas.map((dsa) => (
                    <TableRow key={dsa.id}>
                      <TableCell className="font-medium">{dsa.name}</TableCell>
                      <TableCell>{dsa.email}</TableCell>
                      <TableCell>{dsa.activeLinks}</TableCell>
                      <TableCell>{dsa.signups}</TableCell>
                      <TableCell><Badge variant={dsa.status === 'Active' ? 'default' : 'destructive'}>{dsa.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" disabled> {/* Edit to be implemented */}
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled> {/* Delete to be implemented */}
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {dsas.length === 0 && <p className="text-center text-muted-foreground py-4">No DSAs found.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referralManagement">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Referral Link Management</CardTitle>
                <Button size="sm" disabled> {/* Link to be implemented: /admin/links/create */}
                    <PlusCircle className="mr-2 h-4 w-4" /> Generate New Link
                </Button>
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
                  {referralLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.code}</TableCell>
                      <TableCell>{link.dsaName}</TableCell>
                      <TableCell>{link.productName}</TableCell>
                      <TableCell>{link.clicks}</TableCell>
                      <TableCell>{link.signups}</TableCell>
                      <TableCell>{link.conversionRate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" disabled><ExternalLink className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" disabled><Copy className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {referralLinks.length === 0 && <p className="text-center text-muted-foreground py-4">No referral links found.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Signup Trends</CardTitle>
                <CardDescription>Monthly signup performance (using mock data).</CardDescription>
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
                <CardDescription>DSAs with the most signups (derived from fetched data).</CardDescription>
              </CardHeader>
              <CardContent>
                 {mockTopDSAs.length > 0 ? (
                    <ChartContainer config={topDsaChartConfig} className="h-[300px] w-full">
                    <BarChart data={mockTopDSAs} layout="vertical" margin={{ right: 20 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4} name="Signups" />
                    </BarChart>
                    </ChartContainer>
                 ) : (
                    <p className="text-center text-muted-foreground py-4">No DSA performance data available.</p>
                 )}
              </CardContent>
            </Card>
             <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Signups per product (using mock data).</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer config={productPerformanceChartConfig} className="h-[300px] w-full max-w-md">
                  <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={mockProductPerformanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="var(--color-value)" />
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
