import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, MessageSquarePlus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold tracking-tight mb-4">
          Welcome to <span className="text-primary">ReferralFlow</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your referrals efficiently, track performance, and empower your DSAs with AI-driven tools.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Users className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="font-headline text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Oversee DSAs, manage referral links, and analyze overall performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin">Go to Admin <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Zap className="h-12 w-12 text-accent mb-4" />
            <CardTitle className="font-headline text-2xl">DSA Dashboard</CardTitle>
            <CardDescription>Track your referral links, view real-time stats, and manage your performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dsa">Go to DSA <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <MessageSquarePlus className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="font-headline text-2xl">Smart Message Generator</CardTitle>
            <CardDescription>Generate personalized referral messages with AI to boost your outreach.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/generate-message">Generate Message <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="mt-16 py-12 bg-card rounded-lg shadow-md">
        <div className="container mx-auto text-center">
          <h2 className="font-headline text-3xl font-bold mb-6">Why ReferralFlow?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6">
              <h3 className="font-headline text-xl font-semibold mb-2 text-primary">Seamless Management</h3>
              <p className="text-muted-foreground">Effortlessly create, assign, and track referral campaigns from a centralized dashboard.</p>
            </div>
            <div className="p-6">
              <h3 className="font-headline text-xl font-semibold mb-2 text-accent">Real-time Insights</h3>
              <p className="text-muted-foreground">Gain instant visibility into clicks, signups, and conversions to optimize your strategies.</p>
            </div>
            <div className="p-6">
              <h3 className="font-headline text-xl font-semibold mb-2 text-primary">AI-Powered Engagement</h3>
              <p className="text-muted-foreground">Leverage AI to craft compelling referral messages that drive action and engagement.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
