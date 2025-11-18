export const OPERATION_STATUSES = {
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  DUE_DILIGENCE: 'due_diligence',
  DOCUMENTATION: 'documentation',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const;

export type OperationStatus = typeof OPERATION_STATUSES[keyof typeof OPERATION_STATUSES];

export interface StatusColumn {
  id: OperationStatus;
  title: string;
  color: string;
  bgColor: string;
  order: number;
}

export const STATUS_COLUMNS: StatusColumn[] = [
  {
    id: OPERATION_STATUSES.PROPOSAL,
    title: 'Propuesta Enviada',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    order: 1,
  },
  {
    id: OPERATION_STATUSES.NEGOTIATION,
    title: 'En Negociación',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    order: 2,
  },
  {
    id: OPERATION_STATUSES.DUE_DILIGENCE,
    title: 'Due Diligence',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    order: 3,
  },
  {
    id: OPERATION_STATUSES.DOCUMENTATION,
    title: 'Documentación',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    order: 4,
  },
  {
    id: OPERATION_STATUSES.CLOSED,
    title: 'Cerrada',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    order: 5,
  },
  {
    id: OPERATION_STATUSES.ARCHIVED,
    title: 'Archivada',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    order: 6,
  },
];

export const getStatusColumn = (status: string | undefined): StatusColumn => {
  const column = STATUS_COLUMNS.find((col) => col.id === status);
  return column || STATUS_COLUMNS[0];
};

export const getStatusLabel = (status: string | undefined): string => {
  return getStatusColumn(status).title;
};

export const getStatusColor = (status: string | undefined): string => {
  return getStatusColumn(status).color;
};
