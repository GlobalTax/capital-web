
import React from 'react';
import { Card, Grid, Metric, Text, Title, AreaChart, BarChart, DonutChart, List, ListItem, Badge, Flex, Icon } from '@tremor/react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { FileText, Building2, Users, MessageSquare, Calculator, TrendingUp, Clock, Bell } from 'lucide-react';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="w-full h-full p-8">
        <div className="space-y-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <Grid numItemsSm={2} numItemsLg={3} className="gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-24">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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
      <div className="w-full p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Title className="text-3xl font-light text-gray-900">Panel Capittal</Title>
            <Text className="text-gray-500 mt-2">
              Bienvenido de vuelta. Aquí tienes el resumen de hoy.
            </Text>
          </div>
          <Flex className="justify-start sm:justify-end">
            <Icon icon={Clock} className="text-gray-400" />
            <Text className="text-gray-400 ml-2">{currentTime}</Text>
          </Flex>
        </div>

        {/* Métricas Principales */}
        <Grid numItemsSm={2} numItemsMd={3} numItemsLg={6} className="gap-6">
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Casos de Éxito</Text>
                <Metric>{stats.caseStudies}</Metric>
              </div>
              <Icon icon={FileText} variant="light" />
            </Flex>
          </Card>
          
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Operaciones</Text>
                <Metric>{stats.operations}</Metric>
              </div>
              <Icon icon={Building2} variant="light" />
            </Flex>
          </Card>
          
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Valoraciones</Text>
                <Metric>{stats.valuations}</Metric>
              </div>
              <Icon icon={Calculator} variant="light" />
            </Flex>
          </Card>
          
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Blog Posts</Text>
                <Metric>{stats.blogPosts}</Metric>
              </div>
              <Icon icon={MessageSquare} variant="light" />
            </Flex>
          </Card>
          
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Testimonios</Text>
                <Metric>{stats.testimonials}</Metric>
              </div>
              <Icon icon={Users} variant="light" />
            </Flex>
          </Card>
          
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Estadísticas</Text>
                <Metric>{stats.statistics}</Metric>
              </div>
              <Icon icon={TrendingUp} variant="light" />
            </Flex>
          </Card>
        </Grid>

        {/* Métricas del Header */}
        <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Valoraciones Totales</Text>
                <Metric>{stats.valuations}</Metric>
              </div>
              <Icon icon={TrendingUp} variant="light" />
            </Flex>
          </Card>
          
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Leads Hoy</Text>
                <Metric>8</Metric>
              </div>
              <Icon icon={Bell} variant="light" />
            </Flex>
          </Card>
          
          <Card>
            <Flex alignItems="start">
              <div>
                <Text>Usuarios Activos</Text>
                <Metric>3</Metric>
              </div>
              <Icon icon={Users} variant="light" />
            </Flex>
          </Card>
        </Grid>

        {/* Gráficos y Datos */}
        <Grid numItemsLg={3} className="gap-6">
          {/* Gráfico Principal */}
          <Card className="col-span-full lg:col-span-2">
            <Title>Valoraciones y Leads</Title>
            <AreaChart
              className="mt-6"
              data={chartData}
              index="mes"
              categories={["valoraciones", "leads"]}
              colors={["slate", "gray"]}
              valueFormatter={(number: number) => `${number}`}
              yAxisWidth={48}
            />
          </Card>

          {/* Top Sectores */}
          <Card>
            <Title>Top Sectores</Title>
            <BarChart
              className="mt-6"
              data={sectorData}
              index="sector"
              categories={["valoraciones"]}
              colors={["slate"]}
              valueFormatter={(number: number) => `${number}`}
              layout="vertical"
              yAxisWidth={80}
            />
          </Card>
        </Grid>

        {/* Acciones Rápidas y Actividad */}
        <Grid numItemsLg={2} className="gap-6">
          {/* Acciones Rápidas */}
          <Card>
            <Title>Acciones Rápidas</Title>
            <List className="mt-6">
              <ListItem>
                <Flex justifyContent="start" className="truncate space-x-4">
                  <Icon icon={Calculator} variant="light" />
                  <div className="truncate">
                    <Text className="truncate">
                      <strong>Nueva Valoración</strong>
                    </Text>
                    <Text className="truncate">Procesa una valoración</Text>
                  </div>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justifyContent="start" className="truncate space-x-4">
                  <Icon icon={FileText} variant="light" />
                  <div className="truncate">
                    <Text className="truncate">
                      <strong>Caso de Éxito</strong>
                    </Text>
                    <Text className="truncate">Documenta un nuevo logro</Text>
                  </div>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justifyContent="start" className="truncate space-x-4">
                  <Icon icon={Building2} variant="light" />
                  <div className="truncate">
                    <Text className="truncate">
                      <strong>Nueva Operación</strong>
                    </Text>
                    <Text className="truncate">Registra transacción M&A</Text>
                  </div>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justifyContent="start" className="truncate space-x-4">
                  <Icon icon={MessageSquare} variant="light" />
                  <div className="truncate">
                    <Text className="truncate">
                      <strong>Contenido Blog</strong>
                    </Text>
                    <Text className="truncate">Crear nuevo artículo</Text>
                  </div>
                </Flex>
              </ListItem>
            </List>
          </Card>

          {/* Actividad Reciente */}
          <Card>
            <Title>Actividad Reciente</Title>
            <List className="mt-6">
              {activities.map((activity, index) => (
                <ListItem key={index}>
                  <Flex justifyContent="start" className="truncate space-x-4">
                    <Badge 
                      color={activity.status === 'success' ? 'green' : 
                             activity.status === 'warning' ? 'yellow' : 'blue'} 
                      size="xs"
                    />
                    <div className="truncate">
                      <Text className="truncate">
                        <strong>{activity.title}</strong>
                      </Text>
                      <Text className="truncate">{activity.description}</Text>
                      <Text className="text-xs text-gray-500">{activity.time}</Text>
                    </div>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
