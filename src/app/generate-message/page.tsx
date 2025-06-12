import SmartMessageGeneratorForm from '@/components/shared/SmartMessageGeneratorForm';
import { Suspense } from 'react';

// Helper component to use useSearchParams
function SmartMessageGeneratorPageContent() {
  return <SmartMessageGeneratorForm />;
}


export default function GenerateMessagePage() {
  return (
    <div className="container mx-auto py-12 px-4">
       <Suspense fallback={<div>Loading form...</div>}>
        <SmartMessageGeneratorPageContent />
      </Suspense>
    </div>
  );
}
