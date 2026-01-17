import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { ApolloOrganization } from '@/hooks/useApolloVisitorImport';

interface OrganizationPreviewTableProps {
  organizations: ApolloOrganization[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

const getIntentBadgeVariant = (intent?: string) => {
  switch (intent?.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function OrganizationPreviewTable({
  organizations,
  selectedIds,
  onToggleSelect,
}: OrganizationPreviewTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead className="text-center">Empleados</TableHead>
            <TableHead className="text-center">Intent</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow 
              key={org.id} 
              className={org.existsInEmpresas ? 'bg-muted/30' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(org.id)}
                  onCheckedChange={() => onToggleSelect(org.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{org.name}</p>
                    {(org.website_url || org.primary_domain) && (
                      <a
                        href={org.website_url || `https://${org.primary_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        {org.primary_domain || org.website_url}
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {org.industry || '-'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {[org.city, org.country].filter(Boolean).join(', ') || '-'}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {org.estimated_num_employees ? (
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {org.estimated_num_employees.toLocaleString()}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {org.intent_level ? (
                  <Badge variant={getIntentBadgeVariant(org.intent_level)} className="text-xs">
                    {org.intent_level}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {org.account_score ? (
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    {org.account_score}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {org.existsInEmpresas ? (
                  <Badge variant="outline" className="text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Existe
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Nueva
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
