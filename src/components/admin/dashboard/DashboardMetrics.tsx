
import React from 'react';
import { Card, Grid, Metric, Text, Flex, Icon } from '@tremor/react';
import { FileText, Building2, Users, MessageSquare, Calculator, TrendingUp, PenTool } from 'lucide-react';

interface DashboardStats {
  caseStudies: number;
  operations: number;
  blogPosts: number;
  testimonials: number;
  teamMembers: number;
  statistics: number;
  valuations: number;
}

interface DashboardMetricsProps {
  stats: DashboardStats;
}

const DashboardMetrics = ({ stats }: DashboardMetricsProps) => {
  return (
    <Grid numItemsSm={2} numItemsMd={3} numItemsLg={6} className="gap-4">
      <Card className="border-0 shadow-sm">
        <Flex alignItems="start" className="p-4">
          <div className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">Casos de Éxito</Text>
            <Metric className="text-2xl font-light text-gray-900">{stats.caseStudies}</Metric>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon icon={FileText} className="text-blue-600" />
          </div>
        </Flex>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <Flex alignItems="start" className="p-4">
          <div className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">Operaciones</Text>
            <Metric className="text-2xl font-light text-gray-900">{stats.operations}</Metric>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <Icon icon={Building2} className="text-green-600" />
          </div>
        </Flex>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <Flex alignItems="start" className="p-4">
          <div className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">Valoraciones</Text>
            <Metric className="text-2xl font-light text-gray-900">{stats.valuations}</Metric>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Icon icon={Calculator} className="text-purple-600" />
          </div>
        </Flex>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <Flex alignItems="start" className="p-4">
          <div className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">Blog Posts</Text>
            <Metric className="text-2xl font-light text-gray-900">{stats.blogPosts}</Metric>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <Icon icon={PenTool} className="text-orange-600" />
          </div>
        </Flex>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <Flex alignItems="start" className="p-4">
          <div className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">Testimonios</Text>
            <Metric className="text-2xl font-light text-gray-900">{stats.testimonials}</Metric>
          </div>
          <div className="p-2 bg-cyan-50 rounded-lg">
            <Icon icon={Users} className="text-cyan-600" />
          </div>
        </Flex>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <Flex alignItems="start" className="p-4">
          <div className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">Estadísticas</Text>
            <Metric className="text-2xl font-light text-gray-900">{stats.statistics}</Metric>
          </div>
          <div className="p-2 bg-pink-50 rounded-lg">
            <Icon icon={TrendingUp} className="text-pink-600" />
          </div>
        </Flex>
      </Card>
    </Grid>
  );
};

export default DashboardMetrics;
