import { Hero } from "@/components/landing/Hero";
import { StackBar } from "@/components/landing/StackBar";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowAuthWorks } from "@/components/landing/HowAuthWorks";
import { TaskBoardPreview } from "@/components/landing/TaskBoardPreview";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { CtaFooter } from "@/components/landing/CtaFooter";

export default function Home() {
  return (
    <main>
      <Hero />
      <StackBar />
      <FeatureGrid />
      <HowAuthWorks />
      <TaskBoardPreview />
      <SecuritySection />
      <CtaFooter />
    </main>
  );
}
