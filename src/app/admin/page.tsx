
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import KPICard from '@/components/shared/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Link as LinkIconLucide, BarChart2, Edit, Trash2, PlusCircle, TrendingUp, ExternalLink, Copy, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { DSA, ReferralLink } from '@/types';
import { getDSAs, deleteDSA } from '@/services/dsaService'; // Added deleteDSA
import { getReferralLinks, deleteReferralLink } from '@/services/referralLinkService'; // Added deleteReferralLink
import { mockSignupTrends, mockProductPerformance as mockProductPerformanceData } from '@/lib/mockData'; // Keep for analytics for now
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


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

function AdminDashboardCore() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [dsas, setDsas] = useState<DSA[]>([]);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "dsaManagement");

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/admin?tab=${value}`, { scroll: false });
  };

  const handleDeleteDsa = async (dsaId: string, dsaName: string) => {
    try {
      // Check if DSA has active referral links
      const linksForDsa = referralLinks.filter(link => link.dsaId === dsaId);
      if (linksForDsa.length > 0) {
        toast({
          title: "Cannot Delete DSA",
          description: `${dsaName} has active referral links. Please delete or reassign them first.`,
          variant: "destructive",
        });
        return;
      }
      
      const success = await deleteDSA(dsaId);
      if (success) {
        toast({
          title: "DSA Deleted",
          description: `DSA ${dsaName} has been successfully deleted.`,
        });
        fetchData(); // Refresh data
      } else {
        throw new Error("Failed to delete DSA from service");
      }
    } catch (error) {
      console.error("Error deleting DSA:", error);
      toast({
        title: "Error Deleting DSA",
        description: "Could not delete DSA. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReferralLink = async (linkId: string, linkCode: string) => {
    try {
      const success = await deleteReferralLink(linkId);
      if (success) {
        toast({
          title: "Referral Link Deleted",
          description: `Link ${linkCode} has been successfully deleted.`,
        });
        fetchData(); // Refresh data
      } else {
        throw new Error("Failed to delete referral link from service");
      }
    } catch (error) {
      console.error("Error deleting referral link:", error);
      toast({
        title: "Error Deleting Link",
        description: "Could not delete referral link. Please try again.",
        variant: "destructive",
      });
    }
  };


  const totalDSAs = dsas.length;
  const activeReferralLinks = referralLinks.length;
  const totalSignups = dsas.reduce((sum, dsa) => sum + (dsa.signups || 0), 0); // Ensure signups is a number
  const totalClicks = referralLinks.reduce((sum, link) => sum + link.clicks, 0);
  const conversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(2) + '%' : '0%';
  
  const topDSAsPerformance = dsas
    .filter(dsa => dsa.status === 'Active')
    .map(dsa => ({ name: dsa.name, value: dsa.signups || 0 }))
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
        <Button onClick={fetchData}>Try Again</Button>
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
        <KPICard title="Active Links" value={activeReferralLinks} icon={LinkIconLucide} />
        <KPICard title="Total Signups" value={totalSignups} icon={TrendingUp} />
        <KPICard title="Total Clicks" value={totalClicks} icon={BarChart2} />
        <KPICard title="Conversion Rate" value={conversionRate} icon={TrendingUp} />
      </section>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                      <TableCell>{dsa.activeLinks || 0}</TableCell>
                      <TableCell>{dsa.signups || 0}</TableCell>
                      <TableCell><Badge variant={dsa.status === 'Active' ? 'default' : 'destructive'}>{dsa.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" disabled> {/* Edit to be implemented: Link href={`/admin/dsa/edit/${dsa.id}`} */}
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the DSA "{dsa.name}".
                                DSAs with active referral links cannot be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDsa(dsa.id, dsa.name)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete DSA
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {dsas.length === 0 && <p className="text-center text-muted-foreground py-4">No DSAs found. <Link href="/admin/dsa/create" className="text-primary hover:underline">Add one now</Link>.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referralManagement">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Referral Link Management</CardTitle>
                <Button size="sm" asChild>
                    <Link href="/admin/links/create">
                      <PlusCircle className="mr-2 h-4 w-4" /> Generate New Link
                    </Link>
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
                        <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(link.link).then(() => toast({title: "Copied!", description: "Referral link copied."}))}><Copy className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" asChild><Link href={link.link} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the referral link "{link.code}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReferralLink(link.id, link.code)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Link
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {referralLinks.length === 0 && <p className="text-center text-muted-foreground py-4">No referral links found. <Link href="/admin/links/create" className="text-primary hover:underline">Generate one now</Link>.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Signup Trends</CardTitle>
                <CardDescription>Monthly signup performance (using mock data for now).</CardDescription>
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
                <CardDescription>DSAs with the most signups (from live data).</CardDescription>
              </CardHeader>
              <CardContent>
                 {topDSAsPerformance.length > 0 ? (
                    <ChartContainer config={topDsaChartConfig} className="h-[300px] w-full">
                    <BarChart data={topDSAsPerformance} layout="vertical" margin={{ right: 20 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" dataKey="value"/>
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} interval={0} />
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
                <CardDescription>Signups per product (using mock data for now).</CardDescription>
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    }>
      <AdminDashboardCore />
    </Suspense>
  )
}
