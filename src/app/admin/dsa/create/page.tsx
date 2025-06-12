
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDSA } from '@/services/dsaService';
import type { DSA } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const dsaFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  status: z.enum(['Active', 'Suspended']).default('Active'),
  avatar: z.string().url({ message: "Avatar must be a valid URL." }).optional().or(z.literal('')),
});

type DsaFormData = z.infer<typeof dsaFormSchema>;

export default function CreateDsaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DsaFormData>({
    resolver: zodResolver(dsaFormSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'Active',
      avatar: '',
    },
  });

  const onSubmit: SubmitHandler<DsaFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const newDsaData: Omit<DSA, 'id' | 'activeLinks' | 'signups'> = {
        name: data.name,
        email: data.email,
        status: data.status,
        avatar: data.avatar || \`https://placehold.co/100x100.png?text=\${data.name.substring(0,2).toUpperCase()}\`, // Default placeholder
      };
      const result = await addDSA(newDsaData);
      if (result) {
        toast({
          title: "DSA Created",
          description: `DSA ${result.name} has been successfully created.`,
        });
        router.push('/admin'); // Redirect to admin dashboard
      } else {
        throw new Error("Failed to create DSA");
      }
    } catch (error) {
      console.error("Error creating DSA:", error);
      toast({
        title: "Error",
        description: "Failed to create DSA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Link>
      </Button>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <CardTitle>Create New DSA</CardTitle>
          </div>
          <CardDescription>Fill in the details to add a new Direct Selling Agent.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.png" {...field} />
                    </FormControl>
                    <FormDescription>If left blank, a placeholder will be used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Create DSA
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
