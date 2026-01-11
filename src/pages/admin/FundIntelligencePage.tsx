import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FundIntelligenceStats } from '@/components/admin/fund-intelligence/FundIntelligenceStats';
import { FundsList } from '@/components/admin/fund-intelligence/FundsList';
import { FundNewsFeed } from '@/components/admin/fund-intelligence/FundNewsFeed';
import { useFundIntelligence } from '@/hooks/useFundIntelligence';
import { Brain } from 'lucide-react';

const FundIntelligencePage = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const getInitialTab = () => {
    if (typeParam === 'cr') return 'cr-funds';
    if (typeParam === 'sf') return 'sf-funds';
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
    <>
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
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="sf-funds">Search Funds ({sfFunds.length})</TabsTrigger>
            <TabsTrigger value="cr-funds">Capital Riesgo ({crFunds.length})</TabsTrigger>
            <TabsTrigger value="news">Noticias ({news.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
        </Tabs>
      </div>
    </>
  );
};

export default FundIntelligencePage;
