import { EmailScheduler } from "@/components/EmailScheduler";

export default function EmailSchedulingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EmailScheduler />
      </div>
    </div>
  );
}