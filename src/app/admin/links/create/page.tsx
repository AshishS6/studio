
'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addReferralLink } from '@/services/referralLinkService';
import { getDSAs } from '@/services/dsaService';
import { getProducts } from '@/services/productService';
import type { DSA, Product, ReferralLink } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Link as LinkIconLucide, Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const referralLinkFormSchema = z.object({
  dsaId: z.string().min(1, { message: "DSA selection is required." }),
  productId: z.string().min(1, { message: "Product selection is required." }),
  code: z.string().min(3, { message: "Referral code must be at least 3 characters." }).regex(/^[a-zA-Z0-9_-]+$/, { message: "Code can only contain letters, numbers, underscores, and hyphens."}),
});

type ReferralLinkFormData = z.infer<typeof referralLinkFormSchema>;

export default function CreateReferralLinkPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dsas, setDsas] = useState<DSA[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      try {
        const [dsasData, productsData] = await Promise.all([
          getDSAs(),
          getProducts()
        ]);
        setDsas(dsasData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching DSAs or Products:", error);
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchData();
  }, [toast]);

  const form = useForm<ReferralLinkFormData>({
    resolver: zodResolver(referralLinkFormSchema),
    defaultValues: {
      dsaId: '',
      productId: '',
      code: '',
    },
  });

  const onSubmit: SubmitHandler<ReferralLinkFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newLinkData: Omit<ReferralLink, 'id' | 'clicks' | 'signups' | 'conversionRate' | 'creationDate' | 'dsaName' | 'productName' | 'link'> & { dsaId: string; productId: string; code: string } = {
        dsaId: data.dsaId,
        productId: data.productId,
        code: data.code.toUpperCase(),
      };
      const result = await addReferralLink(newLinkData);
      if (result) {
        toast({
          title: "Referral Link Created",
          description: `Link ${result.code} for ${result.dsaName} successfully created.`,
        });
        router.push('/admin?tab=referralManagement'); // Redirect to admin dashboard, referral tab
      } else {
        throw new Error("Failed to create referral link");
      }
    } catch (error) {
      console.error("Error creating referral link:", error);
      toast({
        title: "Error",
        description: "Failed to create referral link. It's possible the code is already in use or another issue occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/admin?tab=referralManagement">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Link>
      </Button>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <LinkIconLucide className="h-6 w-6 text-primary" />
            <CardTitle>Generate New Referral Link</CardTitle>
          </div>
          <CardDescription>Assign a unique referral link to a DSA for a specific product.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="dsaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direct Selling Agent (DSA)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={dsas.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a DSA" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dsas.length > 0 ? dsas.map(dsa => (
                          <SelectItem key={dsa.id} value={dsa.id}>{dsa.name} ({dsa.email})</SelectItem>
                        )) : <SelectItem value="nodsa" disabled>No DSAs available</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={products.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {products.length > 0 ? products.map(product => (
                          <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                        )) : <SelectItem value="noproduct" disabled>No products available</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Referral Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ALICEPROD1_SAVE10" {...field} />
                    </FormControl>
                    <FormDescription>Must be unique. Use letters, numbers, underscores, hyphens.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || dsas.length === 0 || products.length === 0}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Generate Link
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
