
import React from 'react';
import { Card, Grid, Title, AreaChart, BarChart } from '@tremor/react';

const DashboardCharts = () => {
  const chartData = [
    { mes: 'Ene', valoraciones: 12, leads: 45 },
    { mes: 'Feb', valoraciones: 19, leads: 52 },
    { mes: 'Mar', valoraciones: 15, leads: 38 },
    { mes: 'Abr', valoraciones: 25, leads: 67 },
    { mes: 'May', valoraciones: 22, leads: 58 },
    { mes: 'Jun', valoraciones: 30, leads: 78 }
  ];

  const sectorData = [
    { sector: 'Tecnología', valoraciones: 45 },
    { sector: 'Retail', valoraciones: 28 },
    { sector: 'Industrial', valoraciones: 25 },
    { sector: 'Servicios', valoraciones: 22 },
    { sector: 'Otros', valoraciones: 20 }
  ];

  return (
    <Grid numItemsLg={3} className="gap-6">
      <Card className="col-span-full lg:col-span-2 border-0 shadow-sm">
        <div className="p-6">
          <Title className="text-xl font-semibold text-gray-900 mb-4">Valoraciones y Leads</Title>
          <AreaChart
            className="mt-4"
            data={chartData}
            index="mes"
            categories={["valoraciones", "leads"]}
            colors={["slate", "gray"]}
            valueFormatter={(number: number) => `${number}`}
            yAxisWidth={48}
            showLegend={true}
            showGridLines={true}
          />
        </div>
      </Card>

      <Card className="border-0 shadow-sm">
        <div className="p-6">
          <Title className="text-xl font-semibold text-gray-900 mb-4">Top Sectores</Title>
          <BarChart
            className="mt-4"
            data={sectorData}
            index="sector"
            categories={["valoraciones"]}
            colors={["slate"]}
            valueFormatter={(number: number) => `${number}`}
            layout="vertical"
            yAxisWidth={80}
            showLegend={false}
          />
        </div>
      </Card>
    </Grid>
  );
};

export default DashboardCharts;
