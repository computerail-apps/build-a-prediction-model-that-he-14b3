export interface Market {
  ticker: string;
  title: string;
  category: string;
  lastPrice: number;
  yesBid: number;
  yesAsk: number;
  volume: number;
  volume24h: number;
  openInterest: number;
  closeTime: string;
}

export const MOCK_MARKETS: Market[] = [
  { ticker: 'FED-24DEC-HIKE', title: 'Fed raises rates at December meeting?', category: 'Economics', lastPrice: 12, yesBid: 11, yesAsk: 13, volume: 284500, volume24h: 18200, openInterest: 52000, closeTime: '2025-12-18T19:00:00Z' },
  { ticker: 'INXD-24-T5000', title: 'S&P 500 closes above 5,000 this week?', category: 'Economics', lastPrice: 63, yesBid: 62, yesAsk: 64, volume: 412300, volume24h: 30210, openInterest: 71000, closeTime: '2025-06-20T20:00:00Z' },
  { ticker: 'CPI-NOV-HIGH', title: 'November CPI print above 3.5% YoY?', category: 'Economics', lastPrice: 41, yesBid: 40, yesAsk: 42, volume: 98200, volume24h: 7100, openInterest: 21000, closeTime: '2025-12-11T13:30:00Z' },
  { ticker: 'GOPNOM-24-TRUMP', title: 'Trump wins GOP nomination?', category: 'Politics', lastPrice: 88, yesBid: 87, yesAsk: 89, volume: 731200, volume24h: 42300, openInterest: 154000, closeTime: '2025-07-18T23:00:00Z' },
  { ticker: 'PRES-24-DEM', title: 'Democrat wins 2024 presidential election?', category: 'Politics', lastPrice: 47, yesBid: 46, yesAsk: 48, volume: 982100, volume24h: 61200, openInterest: 221000, closeTime: '2025-11-05T05:00:00Z' },
  { ticker: 'SHUTDOWN-JAN', title: 'Government shutdown occurs in January?', category: 'Politics', lastPrice: 15, yesBid: 14, yesAsk: 16, volume: 66300, volume24h: 4100, openInterest: 12500, closeTime: '2025-01-31T23:59:00Z' },
  { ticker: 'HIGHNY-24DEC15', title: 'NYC high temp exceeds 50F on Dec 15?', category: 'Climate', lastPrice: 34, yesBid: 33, yesAsk: 35, volume: 18400, volume24h: 2100, openInterest: 4200, closeTime: '2025-12-15T23:59:00Z' },
  { ticker: 'ARCTICICE-24MIN', title: 'Arctic sea ice hits record low in 2025?', category: 'Climate', lastPrice: 22, yesBid: 21, yesAsk: 23, volume: 31500, volume24h: 1800, openInterest: 7300, closeTime: '2025-09-30T23:59:00Z' },
  { ticker: 'AI-GPT5-24', title: 'GPT-5 released before year end?', category: 'Tech', lastPrice: 19, yesBid: 18, yesAsk: 20, volume: 203400, volume24h: 25600, openInterest: 38900, closeTime: '2025-12-31T23:59:00Z' },
  { ticker: 'APPLE-VR2-25', title: 'Apple announces Vision Pro 2 in 2025?', category: 'Tech', lastPrice: 56, yesBid: 55, yesAsk: 57, volume: 144700, volume24h: 9800, openInterest: 29100, closeTime: '2025-12-31T23:59:00Z' },
  { ticker: 'SB-CHIEFS-WIN', title: 'Chiefs win the Super Bowl?', category: 'Sports', lastPrice: 27, yesBid: 26, yesAsk: 28, volume: 512900, volume24h: 48700, openInterest: 98400, closeTime: '2026-02-08T23:30:00Z' },
  { ticker: 'NBA-CHAMP-CELT', title: 'Celtics win the NBA championship?', category: 'Sports', lastPrice: 31, yesBid: 30, yesAsk: 32, volume: 287600, volume24h: 19400, openInterest: 55200, closeTime: '2026-06-20T03:00:00Z' },
  { ticker: 'OSCAR-BARBIE', title: 'Barbie wins Best Picture?', category: 'Entertainment', lastPrice: 8, yesBid: 7, yesAsk: 9, volume: 41200, volume24h: 2900, openInterest: 9100, closeTime: '2025-03-10T04:00:00Z' },
  { ticker: 'GRAMMY-TAYLOR', title: 'Taylor Swift wins Album of the Year?', category: 'Entertainment', lastPrice: 71, yesBid: 70, yesAsk: 72, volume: 158300, volume24h: 11200, openInterest: 32600, closeTime: '2025-02-02T04:00:00Z' }
];
