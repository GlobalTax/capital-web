
import React from 'react';
import { Flex, Icon, Text, Title } from '@tremor/react';
import { Clock } from 'lucide-react';

const DashboardHeader = () => {
  const currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
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
  );
};

export default DashboardHeader;
