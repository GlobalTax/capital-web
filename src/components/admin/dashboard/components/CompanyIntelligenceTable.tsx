
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CompanyVisit, getLeadScoreBadgeVariant, formatTimeOnSite } from '../types/CompanyIntelligenceTypes';
import { Eye, Clock, Globe } from 'lucide-react';

interface CompanyIntelligenceTableProps {
  visits: CompanyVisit[];
  onViewDetails: (visit: CompanyVisit) => void;
}

const CompanyIntelligenceTable = ({ visits, onViewDetails }: CompanyIntelligenceTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Sector</TableHead>
          <TableHead>Páginas</TableHead>
          <TableHead>Tiempo</TableHead>
          <TableHead>Lead Score</TableHead>
          <TableHead>Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map(visit => (
          <TableRow key={visit.domain}>
            <TableCell>
              <div>
                <div className="font-medium">{visit.companyName}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {visit.location}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{visit.industry}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-gray-400" />
                {visit.pagesVisited.length}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                {formatTimeOnSite(visit.timeOnSite)}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getLeadScoreBadgeVariant(visit.leadScore)}>
                {visit.leadScore}/100
              </Badge>
            </TableCell>
            <TableCell>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewDetails(visit)}
              >
                Ver Detalle
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CompanyIntelligenceTable;
