
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Linkedin,
  Crown,
  Building2
} from 'lucide-react';
import { ApolloContact } from '@/types/integrations';

interface ApolloContactCardProps {
  contact: ApolloContact;
}

const ApolloContactCard = ({ contact }: ApolloContactCardProps) => {
  const getSeniorityColor = (seniority?: string) => {
    if (!seniority) return 'bg-gray-100 text-gray-800';
    switch (seniority.toLowerCase()) {
      case 'c_suite':
      case 'founder':
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'vp':
      case 'director':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-green-100 text-green-800';
      case 'manager':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-semibold';
    if (score >= 60) return 'text-blue-600 font-medium';
    if (score >= 40) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{contact.full_name}</h3>
            {contact.is_decision_maker && (
              <Crown className="h-4 w-4 text-purple-600" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{contact.title}</p>
          <p className="text-xs text-muted-foreground">{contact.company_domain}</p>
        </div>
        <div className="text-right space-y-1">
          <div className={`text-sm ${getContactScoreColor(contact.contact_score)}`}>
            Score: {contact.contact_score}
          </div>
          {contact.seniority && (
            <Badge className={getSeniorityColor(contact.seniority)}>
              {contact.seniority.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`mailto:${contact.email}`}
              className="text-blue-600 hover:underline truncate"
            >
              {contact.email}
            </a>
          </div>
        )}
        
        {contact.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`tel:${contact.phone}`}
              className="text-blue-600 hover:underline"
            >
              {contact.phone}
            </a>
          </div>
        )}
        
        {contact.linkedin_url && (
          <div className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-muted-foreground" />
            <a 
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LinkedIn
            </a>
          </div>
        )}

        {contact.department && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{contact.department}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground">
        Enriquecido: {new Date(contact.last_enriched).toLocaleDateString('es-ES')}
      </div>
    </div>
  );
};

export default ApolloContactCard;
