import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

interface MobileNavigationProps {
  children: React.ReactNode;
  title: string;
}

export const MobileNavigation = ({ children, title }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-lg font-bold truncate">{title}</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="space-y-4">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};