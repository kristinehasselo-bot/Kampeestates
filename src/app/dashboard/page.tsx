import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { fetchAllMarketData } from '@/lib/market-data';
import Dashboard from '@/components/Dashboard';

export const metadata: Metadata = {
  title: 'Dashbord – Kämpe Estates Markedsrapport',
  description: 'Generer og rediger markedsrapporter for det italienske luksuseiendomsmarkedet.',
};

// Revalidate market data every hour
export const revalidate = 3600;

export default async function DashboardPage() {
  // Verify authentication server-side using iron-session
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/login');
  }

  const marketData = await fetchAllMarketData();

  return <Dashboard initialMarketData={marketData} />;
}
