'use client';

import KPICard from '@/components/shared/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockDsaUser, mockDsaReferralLinks, mockSignupTrends, mockProductPerformance } from '@/lib/mockData';
import { Link as LinkIcon, BarChart2, Copy, Share2, MessageSquarePlus, TrendingUp, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, CartesianGrid } from 'recharts';

const chartConfig = {
  signups: { label: "Signups", color: "hsl(var(--chart-1))" },
  clicks: { label: "Clicks", color: "hsl(var(--chart-2))" },
};

const productPerformanceChartConfig = {
  value: { label: "Signups", color: "hsl(var(--chart-1))" },
};


export default function DsaDashboardPage() {
  const dsa = mockDsaUser;
  const referralLinks = mockDsaReferralLinks;

  const totalClicks = referralLinks.reduce((sum, link) => sum + link.clicks, 0);
  const totalSignups = referralLinks.reduce((sum, link) => sum + link.signups, 0);
  const conversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(2) + '%' : '0%';

  const dsaSignupTrends = mockSignupTrends.map(trend => ({...trend, count: Math.floor(trend.count * 0.3) })); // Mocking DSA specific trend
  const dsaProductPerformance = mockProductPerformance.map(perf => ({...perf, value: Math.floor(perf.value * 0.3)}));


  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Welcome, {dsa.name}!</h1>
        <p className="text-muted-foreground">Here's an overview of your referral performance.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <KPICard title="Total Clicks" value={totalClicks} icon={BarChart2} trend="+50 this week" />
        <KPICard title="Total Signups" value={totalSignups} icon={TrendingUp} trend="+12 this week" />
        <KPICard title="Conversion Rate" value={conversionRate} icon={TrendingUp} trend="+0.5% this week" />
      </section>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Links</CardTitle>
            <CardDescription>Manage and share your unique referral links.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {referralLinks.map((link) => (
              <Card key={link.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{link.productName}</CardTitle>
                  <CardDescription>Code: <span className="font-semibold text-primary">{link.code}</span></CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-sm">Clicks: <span className="font-bold">{link.clicks}</span></p>
                    <p className="text-sm">Signups: <span className="font-bold">{link.signups}</span></p>
                    <p className="text-sm">Conversion: <span className="font-bold">{link.conversionRate}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline"><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
                    <Button size="sm" variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                    <Button size="sm" asChild>
                      <Link href={`/generate-message?productName=${encodeURIComponent(link.productName)}&referralLink=${encodeURIComponent(link.link)}&dsaName=${encodeURIComponent(dsa.name)}`}>
                        <MessageSquarePlus className="mr-2 h-4 w-4" /> Generate Message
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>
      
      <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Signup Trends</CardTitle>
            <CardDescription>Your monthly signup performance.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsLineChart data={dsaSignupTrends}>
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
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>Your signups per product.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={productPerformanceChartConfig} className="h-[300px] w-full max-w-md">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={dsaProductPerformance} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="var(--color-value)" />
                <ChartLegend content={<ChartLegendContent />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
