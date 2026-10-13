import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, NavLink } from '@/lib/ui/Nav';
import { Container } from '@/lib/ui/Container';
import { LineChart, Star, Activity } from 'lucide-react';
import { MarketsPage } from '@/pages/MarketsPage';
import { MarketDetailPage } from '@/pages/MarketDetailPage';
import { WatchlistPage } from '@/pages/WatchlistPage';

function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMarkets = location.pathname.startsWith('/markets') || location.pathname === '/';
  const isWatchlist = location.pathname.startsWith('/watchlist');

  return (
    <div className="min-h-screen">
      <Nav
        brand={
          <Link to="/markets" className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <span>EdgeFinder</span>
          </Link>
        }
      >
        <NavLink
          href="/markets"
          active={isMarkets}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            navigate('/markets');
          }}
        >
          <LineChart size={14} className="mr-2" />Markets
        </NavLink>
        <NavLink
          href="/watchlist"
          active={isWatchlist}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            navigate('/watchlist');
          }}
        >
          <Star size={14} className="mr-2" />Watchlist
        </NavLink>
      </Nav>
      <main className="py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<MarketsPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/markets/:ticker" element={<MarketDetailPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
