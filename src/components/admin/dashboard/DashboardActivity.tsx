
import React from 'react';
import { Card, Grid, Title, List, ListItem, Flex, Icon, Text, Badge } from '@tremor/react';
import { Calculator, FileText, Building2 } from 'lucide-react';

const DashboardActivity = () => {
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
  );
};

export default DashboardActivity;
