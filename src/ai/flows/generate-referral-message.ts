'use server';

/**
 * @fileOverview An AI agent for generating personalized referral message templates for DSAs.
 *
 * - generateReferralMessage - A function that generates referral messages.
 * - GenerateReferralMessageInput - The input type for the generateReferralMessage function.
 * - GenerateReferralMessageOutput - The return type for the generateReferralMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReferralMessageInputSchema = z.object({
  productName: z
    .string()
    .describe('The name of the product to be referred.'),
  dsaName: z.string().describe('The name of the Direct Selling Agent.'),
  incentive: z
    .string()
    .describe(
      'The incentive offered to new users who sign up through the referral link.'
    ),
  referralLink: z
    .string()
    .describe('The unique referral link for the DSA.'),
});
export type GenerateReferralMessageInput = z.infer<
  typeof GenerateReferralMessageInputSchema
>;

const GenerateReferralMessageOutputSchema = z.object({
  message: z
    .string()
    .describe(
      'A personalized referral message template for the DSA, including emojis.'
    ),
});
export type GenerateReferralMessageOutput = z.infer<
  typeof GenerateReferralMessageOutputSchema
>;

export async function generateReferralMessage(
  input: GenerateReferralMessageInput
): Promise<GenerateReferralMessageOutput> {
  return generateReferralMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReferralMessagePrompt',
  input: {schema: GenerateReferralMessageInputSchema},
  output: {schema: GenerateReferralMessageOutputSchema},
  prompt: `You are an AI assistant specialized in creating engaging referral messages for Direct Selling Agents (DSAs).

  Given the following information, generate a personalized referral message template that the DSA can use to promote their referral link. Include relevant emojis to make the message more appealing.

  Product Name: {{{productName}}}
  DSA Name: {{{dsaName}}}
  Incentive: {{{incentive}}}
  Referral Link: {{{referralLink}}}

  The message should be concise, persuasive, and encourage users to sign up using the provided referral link.
  Example: "Hey there! 👋 Join me on {{productName}} and get {{incentive}} when you sign up using my link: {{referralLink}}. Don't miss out!"
  `,
});

const generateReferralMessageFlow = ai.defineFlow(
  {
    name: 'generateReferralMessageFlow',
    inputSchema: GenerateReferralMessageInputSchema,
    outputSchema: GenerateReferralMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
