import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AmbientBackground from '@/components/AmbientBackground';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative overflow-hidden">
      <AmbientBackground />
      <div className="relative z-10 max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-4xl font-bold font-syne mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">
          This feature is coming soon to your futuristic health tracker.
          Stay tuned for updates!
        </p>

        <div className="aspect-video rounded-3xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-dm-sans">
            Under Construction
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;

export const StatsPage = () => <PlaceholderPage title="Statistics" />;
export const MealsPage = () => <PlaceholderPage title="Meal History" />;
export const ShopPage = () => <PlaceholderPage title="Shopping List" />;
export const CommunityPage = () => <PlaceholderPage title="Community" />;
export const GoalsPage = () => <PlaceholderPage title="Nutrition Goals" />;
export const BatchCookPage = () => <PlaceholderPage title="Batch Cook Planner" />;
export const ScannerPage = () => <PlaceholderPage title="Barcode Scanner" />;
export const HydrationPage = () => <PlaceholderPage title="Drink Water Customization" />;
export const FastingPage = () => <PlaceholderPage title="Fasting Tracker" />;
