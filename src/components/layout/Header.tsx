import Link from 'next/link';
import AppLogo from '@/components/icons/AppLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Users, Zap, MessageSquarePlus, LineChart } from 'lucide-react';

const navLinks = [
  { href: '/admin', label: 'Admin', icon: Users },
  { href: '/dsa', label: 'DSA', icon: Zap },
  { href: '/generate-message', label: 'Generate Message', icon: MessageSquarePlus },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <AppLogo />
        </Link>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" asChild>
              <Link href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Placeholder for user profile/actions */}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-8">
            <Link href="/" className="mb-4">
              <AppLogo />
            </Link>
              {navLinks.map((link) => (
                <Button key={link.href} variant="ghost" asChild className="justify-start">
                  <Link href={link.href}>
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
