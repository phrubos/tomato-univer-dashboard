import { SeasonProvider } from '@/contexts/SeasonContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SeasonProvider>{children}</SeasonProvider>;
}
