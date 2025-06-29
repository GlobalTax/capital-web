
import React from 'react';
import { Card, Grid, Metric, Text, Title, AreaChart, BarChart, List, ListItem, Badge, Flex, Icon } from '@tremor/react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { FileText, Building2, Users, MessageSquare, Calculator, TrendingUp, Clock, Bell, PenTool } from 'lucide-react';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 lg:p-6">
        <div className="space-y-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <Grid numItemsSm={2} numItemsLg={3} className="gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-24">
                <div className="space-y-2 p-4">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </Grid>
        </div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

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

  const activities = [
    {
      title: 'Nueva valoración completada',
      description: 'Empresa TechStartup SA - Sector Tecnología',
      time: 'Hace 5 min',
      status: 'success'
    },
    {
      title: 'Caso de éxito publicado',
      description: 'Venta de empresa del sector retail por 2.5M€',
      time: 'Hace 15 min',
      status: 'info'
    },
    {
      title: 'Nuevo lead de contacto',
      description: 'Empresa busca asesoramiento para M&A',
      time: 'Hace 32 min',
      status: 'warning'
    },
    {
      title: 'Operación actualizada',
      description: 'Deal flow Q2 - Sector Industrial',
      time: 'Hace 1 hora',
      status: 'info'
    }
  ];

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full p-4 lg:p-6 space-y-6">
        
        {/* Header Simple */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Title className="text-2xl lg:text-3xl font-light text-gray-900 mb-1">Panel Capittal</Title>
            <Text className="text-gray-600">Bienvenido de vuelta. Aquí tienes el resumen de hoy.</Text>
          </div>
          <Flex className="justify-start sm:justify-end bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
            <Icon icon={Clock} className="text-gray-500" />
            <Text className="text-gray-700 ml-2 font-medium">{currentTime}</Text>
          </Flex>
        </div>

        {/* Métricas Principales - UN SOLO GRID */}
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

        {/* Gráficos */}
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

        {/* Actividad */}
        <Grid numItemsLg={2} className="gap-6">
          <Card className="border-0 shadow-sm">
            <div className="p-6">
              <Title className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</Title>
              <List className="mt-4 space-y-3">
                <ListItem className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                  <Flex justifyContent="start" className="space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon icon={Calculator} className="text-purple-600" />
                    </div>
                    <div>
                      <Text className="font-semibold text-gray-900">Nueva Valoración</Text>
                      <Text className="text-gray-600 text-sm">Procesa una valoración</Text>
                    </div>
                  </Flex>
                </ListItem>
                <ListItem className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                  <Flex justifyContent="start" className="space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon icon={FileText} className="text-blue-600" />
                    </div>
                    <div>
                      <Text className="font-semibold text-gray-900">Caso de Éxito</Text>
                      <Text className="text-gray-600 text-sm">Documenta un nuevo logro</Text>
                    </div>
                  </Flex>
                </ListItem>
                <ListItem className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                  <Flex justifyContent="start" className="space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon icon={Building2} className="text-green-600" />
                    </div>
                    <div>
                      <Text className="font-semibold text-gray-900">Nueva Operación</Text>
                      <Text className="text-gray-600 text-sm">Registra transacción M&A</Text>
                    </div>
                  </Flex>
                </ListItem>
              </List>
            </div>
          </Card>

          <Card className="border-0 shadow-sm">
            <div className="p-6">
              <Title className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</Title>
              <List className="mt-4 space-y-3">
                {activities.map((activity, index) => (
                  <ListItem key={index} className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                    <Flex justifyContent="start" className="space-x-3">
                      <Badge 
                        color={activity.status === 'success' ? 'green' : 
                               activity.status === 'warning' ? 'yellow' : 'blue'} 
                        size="sm"
                        className="flex-shrink-0 mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <Text className="font-semibold text-gray-900">{activity.title}</Text>
                        <Text className="text-gray-600 text-sm mt-1">{activity.description}</Text>
                        <Text className="text-xs text-gray-500 mt-2">{activity.time}</Text>
                      </div>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </div>
          </Card>
        </Grid>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
