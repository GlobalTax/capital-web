import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FundIntelligenceStats } from '@/components/admin/fund-intelligence/FundIntelligenceStats';
import { FundsList } from '@/components/admin/fund-intelligence/FundsList';
import { FundNewsFeed } from '@/components/admin/fund-intelligence/FundNewsFeed';
import { FundIntelligenceCharts } from '@/components/admin/fund-intelligence/FundIntelligenceCharts';
import { PortfolioAlertsPanel } from '@/components/admin/fund-intelligence/PortfolioAlertsPanel';
import { ExitSignalsPanel } from '@/components/admin/fund-intelligence/ExitSignalsPanel';
import { CompanyNewsPanel } from '@/components/admin/fund-intelligence/CompanyNewsPanel';
import { useFundIntelligence } from '@/hooks/useFundIntelligence';
import { usePortfolioIntelligence } from '@/hooks/usePortfolioIntelligence';
import { Brain } from 'lucide-react';

const FundIntelligencePage = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const getInitialTab = () => {
    if (typeParam === 'cr') return 'cr-funds';
    if (typeParam === 'sf') return 'sf-funds';
    if (typeParam === 'alerts') return 'portfolio-alerts';
    if (typeParam === 'exits') return 'exit-signals';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const {
    sfFunds,
    crFunds,
    news,
    isLoading,
    scrapeWebsite,
    isScraping,
    searchNews,
    isSearching,
    markAsProcessed,
    deleteNews,
  } = useFundIntelligence();

  const {
    pendingChanges,
    exitSignals,
  } = usePortfolioIntelligence();

  const stats = {
    totalSFFunds: sfFunds.length,
    totalCRFunds: crFunds.length,
    scrapedSF: sfFunds.filter(f => f.last_scraped_at).length,
    scrapedCR: crFunds.filter(f => f.last_scraped_at).length,
    totalNews: news.length,
    materialChanges: news.filter(n => n.is_material_change).length,
    unprocessedNews: news.filter(n => !n.is_processed).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Fund Intelligence</h1>
          <p className="text-muted-foreground">
            Scraping y monitoreo de fondos con Firecrawl
          </p>
        </div>
      </div>

      <FundIntelligenceStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="sf-funds">Search Funds ({sfFunds.length})</TabsTrigger>
          <TabsTrigger value="cr-funds">Capital Riesgo ({crFunds.length})</TabsTrigger>
          <TabsTrigger value="news">Noticias ({news.length})</TabsTrigger>
          <TabsTrigger value="portfolio-alerts" className="relative">
            Alertas Portfolio
            {pendingChanges.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                {pendingChanges.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="exit-signals" className="relative">
            Señales Exit
            {exitSignals.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {exitSignals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="company-news">Noticias Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Dashboard */}
          <FundIntelligenceCharts news={news} />
          
          <div className="grid lg:grid-cols-2 gap-6">
            <FundsList
              title="Search Funds recientes"
              funds={sfFunds.slice(0, 10)}
              fundType="sf"
              onScrape={(id) => scrapeWebsite({ fundId: id, fundType: 'sf' })}
              onSearchNews={(id) => searchNews({ fundId: id, fundType: 'sf' })}
              isScraping={isScraping}
              isSearching={isSearching}
            />
            <FundsList
              title="Capital Riesgo recientes"
              funds={crFunds.slice(0, 10)}
              fundType="cr"
              onScrape={(id) => scrapeWebsite({ fundId: id, fundType: 'cr' })}
              onSearchNews={(id) => searchNews({ fundId: id, fundType: 'cr' })}
              isScraping={isScraping}
              isSearching={isSearching}
            />
          </div>
          <FundNewsFeed
            news={news.slice(0, 20)}
            onMarkProcessed={markAsProcessed}
            onDelete={deleteNews}
            showFundInfo
          />
        </TabsContent>

        <TabsContent value="sf-funds">
          <FundsList
            title="Todos los Search Funds"
            funds={sfFunds}
            fundType="sf"
            onScrape={(id) => scrapeWebsite({ fundId: id, fundType: 'sf' })}
            onSearchNews={(id) => searchNews({ fundId: id, fundType: 'sf' })}
            isScraping={isScraping}
            isSearching={isSearching}
            showAll
          />
        </TabsContent>

        <TabsContent value="cr-funds">
          <FundsList
            title="Todos los fondos de Capital Riesgo"
            funds={crFunds}
            fundType="cr"
            onScrape={(id) => scrapeWebsite({ fundId: id, fundType: 'cr' })}
            onSearchNews={(id) => searchNews({ fundId: id, fundType: 'cr' })}
            isScraping={isScraping}
            isSearching={isSearching}
            showAll
          />
        </TabsContent>

        <TabsContent value="news">
          <FundNewsFeed
            news={news}
            onMarkProcessed={markAsProcessed}
            onDelete={deleteNews}
            showFundInfo
            showFilters
          />
        </TabsContent>

        <TabsContent value="portfolio-alerts">
          <PortfolioAlertsPanel />
        </TabsContent>

        <TabsContent value="exit-signals">
          <ExitSignalsPanel />
        </TabsContent>

        <TabsContent value="company-news">
          <CompanyNewsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundIntelligencePage;
