'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateReferralMessage, type GenerateReferralMessageInput, type GenerateReferralMessageOutput } from '@/ai/flows/generate-referral-message';
import { Loader2, Copy, Share2, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';


const formSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  dsaName: z.string().min(1, 'DSA name is required'),
  incentive: z.string().min(1, 'Incentive is required'),
  referralLink: z.string().url('Must be a valid URL').min(1, 'Referral link is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function SmartMessageGeneratorForm() {
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      dsaName: '',
      incentive: '',
      referralLink: '',
    },
  });

 useEffect(() => {
    const productName = searchParams.get('productName');
    const referralLink = searchParams.get('referralLink');
    const dsaName = searchParams.get('dsaName');

    if (productName) form.setValue('productName', productName);
    if (referralLink) form.setValue('referralLink', referralLink);
    if (dsaName) form.setValue('dsaName', dsaName);
  }, [searchParams, form]);


  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedMessage(null);
    try {
      const result: GenerateReferralMessageOutput = await generateReferralMessage(data);
      setGeneratedMessage(result.message);
      toast({
        title: "Message Generated!",
        description: "Your personalized referral message is ready.",
      });
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        title: "Error",
        description: "Failed to generate message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage);
      toast({ title: "Copied!", description: "Message copied to clipboard." });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Wand2 className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-3xl">Smart Message Generator</CardTitle>
        </div>
        <CardDescription>Create personalized referral messages with AI. Fill in the details below and let our AI craft an engaging message for you.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Super SaaS Suite" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dsaName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name (DSA)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Alex Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="incentive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incentive for New User</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1 month free, $10 credit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referralLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Referral Link</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/refer/your-code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Message
            </Button>
          
            {generatedMessage && (
              <Card className="mt-6 bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-xl">Generated Message:</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea value={generatedMessage} readOnly rows={5} className="bg-background"/>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                  <Button variant="outline" onClick={() => {
                     if (typeof navigator.share === 'function') {
                        navigator.share({ title: 'Referral Message', text: generatedMessage })
                          .then(() => toast({ title: "Shared!", description: "Message shared successfully."}))
                          .catch(err => console.error('Error sharing:', err));
                      } else {
                        toast({ title: "Share Not Supported", description: "Web Share API not supported in your browser. Please copy the message."});
                      }
                  }}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </CardFooter>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
