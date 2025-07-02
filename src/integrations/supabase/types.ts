export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_conversions: {
        Row: {
          company_domain: string | null
          conversion_name: string | null
          conversion_type: string
          conversion_value: number | null
          created_at: string
          gclid: string | null
          id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
        }
        Insert: {
          company_domain?: string | null
          conversion_name?: string | null
          conversion_type: string
          conversion_value?: number | null
          created_at?: string
          gclid?: string | null
          id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Update: {
          company_domain?: string | null
          conversion_name?: string | null
          conversion_type?: string
          conversion_value?: number | null
          created_at?: string
          gclid?: string | null
          id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          target_user_email: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_user_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          target_user_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_notifications_log: {
        Row: {
          created_at: string
          email_id: string | null
          error_message: string | null
          id: string
          notification_type: string
          recipient_email: string
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_email: string
          sent_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          sent_at?: string
          status?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      apollo_companies: {
        Row: {
          apollo_id: string | null
          company_domain: string
          company_name: string
          contacts_count: number | null
          created_at: string
          decision_makers_count: number | null
          employee_count: number | null
          founded_year: number | null
          id: string
          industry: string | null
          is_target_account: boolean | null
          last_enriched: string | null
          location: string | null
          revenue_range: string | null
          technologies: string[] | null
          updated_at: string
        }
        Insert: {
          apollo_id?: string | null
          company_domain: string
          company_name: string
          contacts_count?: number | null
          created_at?: string
          decision_makers_count?: number | null
          employee_count?: number | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_target_account?: boolean | null
          last_enriched?: string | null
          location?: string | null
          revenue_range?: string | null
          technologies?: string[] | null
          updated_at?: string
        }
        Update: {
          apollo_id?: string | null
          company_domain?: string
          company_name?: string
          contacts_count?: number | null
          created_at?: string
          decision_makers_count?: number | null
          employee_count?: number | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_target_account?: boolean | null
          last_enriched?: string | null
          location?: string | null
          revenue_range?: string | null
          technologies?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      apollo_contacts: {
        Row: {
          apollo_data: Json | null
          apollo_person_id: string | null
          company_domain: string | null
          company_id: string | null
          contact_score: number | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string
          full_name: string | null
          id: string
          is_decision_maker: boolean | null
          last_enriched: string | null
          last_name: string
          linkedin_url: string | null
          phone: string | null
          seniority: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          apollo_data?: Json | null
          apollo_person_id?: string | null
          company_domain?: string | null
          company_id?: string | null
          contact_score?: number | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          is_decision_maker?: boolean | null
          last_enriched?: string | null
          last_name: string
          linkedin_url?: string | null
          phone?: string | null
          seniority?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          apollo_data?: Json | null
          apollo_person_id?: string | null
          company_domain?: string | null
          company_id?: string | null
          contact_score?: number | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          is_decision_maker?: boolean | null
          last_enriched?: string | null
          last_name?: string
          linkedin_url?: string | null
          phone?: string | null
          seniority?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apollo_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "apollo_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      attribution_touchpoints: {
        Row: {
          attribution_weight: number | null
          campaign: string | null
          channel: string
          company_domain: string | null
          content: string | null
          conversion_value: number | null
          created_at: string
          id: string
          medium: string | null
          page_path: string | null
          session_id: string | null
          source: string | null
          timestamp: string
          touchpoint_order: number
          visitor_id: string
        }
        Insert: {
          attribution_weight?: number | null
          campaign?: string | null
          channel: string
          company_domain?: string | null
          content?: string | null
          conversion_value?: number | null
          created_at?: string
          id?: string
          medium?: string | null
          page_path?: string | null
          session_id?: string | null
          source?: string | null
          timestamp?: string
          touchpoint_order: number
          visitor_id: string
        }
        Update: {
          attribution_weight?: number | null
          campaign?: string | null
          channel?: string
          company_domain?: string | null
          content?: string | null
          conversion_value?: number | null
          created_at?: string
          id?: string
          medium?: string | null
          page_path?: string | null
          session_id?: string | null
          source?: string | null
          timestamp?: string
          touchpoint_order?: number
          visitor_id?: string
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          actions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed: string | null
          name: string
          trigger_conditions: Json
          updated_at: string | null
        }
        Insert: {
          actions: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          name: string
          trigger_conditions: Json
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          name?: string
          trigger_conditions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_metrics: {
        Row: {
          avg_deal_size: number
          conversion_rate: number
          created_at: string
          deal_count: number
          id: string
          period_end: string
          period_start: string
          revenue_amount: number
          updated_at: string
        }
        Insert: {
          avg_deal_size?: number
          conversion_rate?: number
          created_at?: string
          deal_count?: number
          id?: string
          period_end: string
          period_start: string
          revenue_amount?: number
          updated_at?: string
        }
        Update: {
          avg_deal_size?: number
          conversion_rate?: number
          created_at?: string
          deal_count?: number
          id?: string
          period_end?: string
          period_start?: string
          revenue_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      carousel_logos: {
        Row: {
          company_name: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      carousel_testimonials: {
        Row: {
          client_company: string
          client_name: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          quote: string
          updated_at: string
        }
        Insert: {
          client_company: string
          client_name: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          quote: string
          updated_at?: string
        }
        Update: {
          client_company?: string
          client_name?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          quote?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          company_size: string | null
          created_at: string
          description: string
          display_locations: string[] | null
          featured_image_url: string | null
          highlights: string[] | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          sector: string
          title: string
          updated_at: string
          value_amount: number | null
          value_currency: string | null
          year: number | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string
          description: string
          display_locations?: string[] | null
          featured_image_url?: string | null
          highlights?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          sector: string
          title: string
          updated_at?: string
          value_amount?: number | null
          value_currency?: string | null
          year?: number | null
        }
        Update: {
          company_size?: string | null
          created_at?: string
          description?: string
          display_locations?: string[] | null
          featured_image_url?: string | null
          highlights?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          sector?: string
          title?: string
          updated_at?: string
          value_amount?: number | null
          value_currency?: string | null
          year?: number | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          org_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          org_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          org_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          org_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          org_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          org_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_applications: {
        Row: {
          company: string | null
          created_at: string
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          experience: string | null
          full_name: string
          hubspot_sent: boolean | null
          hubspot_sent_at: string | null
          id: string
          ip_address: unknown | null
          motivation: string | null
          phone: string
          profession: string
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          experience?: string | null
          full_name: string
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          ip_address?: unknown | null
          motivation?: string | null
          phone: string
          profession: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          experience?: string | null
          full_name?: string
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          ip_address?: unknown | null
          motivation?: string | null
          phone?: string
          profession?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      company_operations: {
        Row: {
          company_name: string
          created_at: string
          description: string
          display_locations: string[] | null
          featured_image_url: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          sector: string
          updated_at: string
          valuation_amount: number
          valuation_currency: string | null
          year: number
        }
        Insert: {
          company_name: string
          created_at?: string
          description: string
          display_locations?: string[] | null
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          sector: string
          updated_at?: string
          valuation_amount: number
          valuation_currency?: string | null
          year: number
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string
          display_locations?: string[] | null
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          sector?: string
          updated_at?: string
          valuation_amount?: number
          valuation_currency?: string | null
          year?: number
        }
        Relationships: []
      }
      company_valuations: {
        Row: {
          cif: string | null
          company_name: string
          competitive_advantage: string | null
          contact_name: string
          created_at: string
          ebitda: number | null
          ebitda_multiple_used: number | null
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          employee_range: string
          final_valuation: number | null
          growth_rate: number | null
          hubspot_sent: boolean | null
          hubspot_sent_at: string | null
          id: string
          industry: string
          ip_address: unknown | null
          location: string | null
          net_profit_margin: number | null
          ownership_participation: string | null
          phone: string | null
          revenue: number | null
          user_agent: string | null
          valuation_range_max: number | null
          valuation_range_min: number | null
          whatsapp_sent: boolean | null
          whatsapp_sent_at: string | null
          years_of_operation: number | null
        }
        Insert: {
          cif?: string | null
          company_name: string
          competitive_advantage?: string | null
          contact_name: string
          created_at?: string
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_range: string
          final_valuation?: number | null
          growth_rate?: number | null
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          industry: string
          ip_address?: unknown | null
          location?: string | null
          net_profit_margin?: number | null
          ownership_participation?: string | null
          phone?: string | null
          revenue?: number | null
          user_agent?: string | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          whatsapp_sent?: boolean | null
          whatsapp_sent_at?: string | null
          years_of_operation?: number | null
        }
        Update: {
          cif?: string | null
          company_name?: string
          competitive_advantage?: string | null
          contact_name?: string
          created_at?: string
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_range?: string
          final_valuation?: number | null
          growth_rate?: number | null
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          industry?: string
          ip_address?: unknown | null
          location?: string | null
          net_profit_margin?: number | null
          ownership_participation?: string | null
          phone?: string | null
          revenue?: number | null
          user_agent?: string | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          whatsapp_sent?: boolean | null
          whatsapp_sent_at?: string | null
          years_of_operation?: number | null
        }
        Relationships: []
      }
      contact_leads: {
        Row: {
          company: string
          company_size: string | null
          country: string | null
          created_at: string
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          full_name: string
          hubspot_sent: boolean | null
          hubspot_sent_at: string | null
          id: string
          ip_address: unknown | null
          phone: string | null
          referral: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          full_name: string
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          ip_address?: unknown | null
          phone?: string | null
          referral?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company?: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          full_name?: string
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          ip_address?: unknown | null
          phone?: string | null
          referral?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_list_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          contact_id: string
          contact_source: string
          id: string
          list_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          contact_id: string
          contact_source: string
          id?: string
          list_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          contact_id?: string
          contact_source?: string
          id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_assignments_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          contact_count: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          list_type: string
          name: string
          updated_at: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          list_type?: string
          name: string
          updated_at?: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          list_type?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_segments: {
        Row: {
          auto_update: boolean | null
          contact_count: number | null
          created_at: string
          created_by: string | null
          criteria: Json
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          auto_update?: boolean | null
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          auto_update?: boolean | null
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_tag_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          contact_id: string
          contact_source: string
          id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          contact_id: string
          contact_source: string
          id?: string
          tag_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          contact_id?: string
          contact_source?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "contact_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          avg_time_on_page: number
          blog_post_id: string | null
          bounce_rate: number
          created_at: string
          engagement_score: number
          id: string
          page_views: number
          period_date: string
          unique_visitors: number
          updated_at: string
        }
        Insert: {
          avg_time_on_page?: number
          blog_post_id?: string | null
          bounce_rate?: number
          created_at?: string
          engagement_score?: number
          id?: string
          page_views?: number
          period_date: string
          unique_visitors?: number
          updated_at?: string
        }
        Update: {
          avg_time_on_page?: number
          blog_post_id?: string | null
          bounce_rate?: number
          created_at?: string
          engagement_score?: number
          id?: string
          page_views?: number
          period_date?: string
          unique_visitors?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_cache: {
        Row: {
          cache_data: Json
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          updated_at: string
        }
        Insert: {
          cache_data: Json
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          updated_at?: string
        }
        Update: {
          cache_data?: Json
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_sequence_steps: {
        Row: {
          attachment_type: string | null
          content: string
          created_at: string | null
          delay_hours: number
          email_template: string | null
          id: string
          include_attachment: boolean | null
          is_active: boolean | null
          sequence_id: string | null
          step_order: number
          subject: string
        }
        Insert: {
          attachment_type?: string | null
          content: string
          created_at?: string | null
          delay_hours?: number
          email_template?: string | null
          id?: string
          include_attachment?: boolean | null
          is_active?: boolean | null
          sequence_id?: string | null
          step_order: number
          subject: string
        }
        Update: {
          attachment_type?: string | null
          content?: string
          created_at?: string | null
          delay_hours?: number
          email_template?: string | null
          id?: string
          include_attachment?: boolean | null
          is_active?: boolean | null
          sequence_id?: string | null
          step_order?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fee_proposals: {
        Row: {
          approved_at: string | null
          base_fee_percentage: number | null
          client_company: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          company_valuation_id: string | null
          contact_lead_id: string | null
          created_at: string
          created_by: string
          estimated_fee: number | null
          id: string
          minimum_fee: number | null
          proposal_content: Json | null
          proposal_number: string
          proposal_title: string
          rejected_at: string | null
          sections: Json | null
          sent_at: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["proposal_status"] | null
          success_fee_percentage: number | null
          template_id: string | null
          terms_and_conditions: string | null
          transaction_value: number | null
          unique_url: string | null
          updated_at: string
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          approved_at?: string | null
          base_fee_percentage?: number | null
          client_company?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          company_valuation_id?: string | null
          contact_lead_id?: string | null
          created_at?: string
          created_by: string
          estimated_fee?: number | null
          id?: string
          minimum_fee?: number | null
          proposal_content?: Json | null
          proposal_number: string
          proposal_title: string
          rejected_at?: string | null
          sections?: Json | null
          sent_at?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["proposal_status"] | null
          success_fee_percentage?: number | null
          template_id?: string | null
          terms_and_conditions?: string | null
          transaction_value?: number | null
          unique_url?: string | null
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          approved_at?: string | null
          base_fee_percentage?: number | null
          client_company?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          company_valuation_id?: string | null
          contact_lead_id?: string | null
          created_at?: string
          created_by?: string
          estimated_fee?: number | null
          id?: string
          minimum_fee?: number | null
          proposal_content?: Json | null
          proposal_number?: string
          proposal_title?: string
          rejected_at?: string | null
          sections?: Json | null
          sent_at?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["proposal_status"] | null
          success_fee_percentage?: number | null
          template_id?: string | null
          terms_and_conditions?: string | null
          transaction_value?: number | null
          unique_url?: string | null
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_proposals_company_valuation_id_fkey"
            columns: ["company_valuation_id"]
            isOneToOne: false
            referencedRelation: "company_valuations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_proposals_contact_lead_id_fkey"
            columns: ["contact_lead_id"]
            isOneToOne: false
            referencedRelation: "contact_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "fee_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_templates: {
        Row: {
          base_fee_percentage: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          minimum_fee: number | null
          name: string
          service_type: Database["public"]["Enums"]["service_type"]
          success_fee_percentage: number | null
          template_sections: Json | null
          updated_at: string
        }
        Insert: {
          base_fee_percentage?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_fee?: number | null
          name: string
          service_type: Database["public"]["Enums"]["service_type"]
          success_fee_percentage?: number | null
          template_sections?: Json | null
          updated_at?: string
        }
        Update: {
          base_fee_percentage?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_fee?: number | null
          name?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          success_fee_percentage?: number | null
          template_sections?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      form_ab_tests: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          page_path: string
          start_date: string | null
          test_name: string
          traffic_split: number | null
          updated_at: string | null
          variant_a_config: Json
          variant_b_config: Json
          winner_variant: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          page_path: string
          start_date?: string | null
          test_name: string
          traffic_split?: number | null
          updated_at?: string | null
          variant_a_config: Json
          variant_b_config: Json
          winner_variant?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          page_path?: string
          start_date?: string | null
          test_name?: string
          traffic_split?: number | null
          updated_at?: string | null
          variant_a_config?: Json
          variant_b_config?: Json
          winner_variant?: string | null
        }
        Relationships: []
      }
      form_conversions: {
        Row: {
          conversion_value: number | null
          converted: boolean | null
          created_at: string | null
          form_data: Json | null
          id: string
          ip_address: unknown | null
          session_id: string
          test_id: string | null
          user_agent: string | null
          variant: string
          visitor_id: string
        }
        Insert: {
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          form_data?: Json | null
          id?: string
          ip_address?: unknown | null
          session_id: string
          test_id?: string | null
          user_agent?: string | null
          variant: string
          visitor_id: string
        }
        Update: {
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          form_data?: Json | null
          id?: string
          ip_address?: unknown | null
          session_id?: string
          test_id?: string | null
          user_agent?: string | null
          variant?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_conversions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "form_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      form_tracking_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          field_name: string | null
          field_value: string | null
          form_type: string
          id: string
          ip_address: unknown | null
          page_path: string
          session_id: string
          timestamp: string
          updated_at: string
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          field_name?: string | null
          field_value?: string | null
          form_type: string
          id?: string
          ip_address?: unknown | null
          page_path: string
          session_id: string
          timestamp?: string
          updated_at?: string
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          field_name?: string | null
          field_value?: string | null
          form_type?: string
          id?: string
          ip_address?: unknown | null
          page_path?: string
          session_id?: string
          timestamp?: string
          updated_at?: string
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          config_id: string | null
          error_message: string | null
          generated_at: string
          id: string
          pdf_url: string | null
          recipients_sent: string[] | null
          report_data: Json
          sent_at: string | null
          status: string
        }
        Insert: {
          config_id?: string | null
          error_message?: string | null
          generated_at?: string
          id?: string
          pdf_url?: string | null
          recipients_sent?: string[] | null
          report_data: Json
          sent_at?: string | null
          status?: string
        }
        Update: {
          config_id?: string | null
          error_message?: string | null
          generated_at?: string
          id?: string
          pdf_url?: string | null
          recipients_sent?: string[] | null
          report_data?: Json
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "report_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          config_data: Json
          created_at: string
          id: string
          integration_name: string
          is_active: boolean | null
          last_sync: string | null
          sync_frequency_minutes: number | null
          updated_at: string
        }
        Insert: {
          config_data?: Json
          created_at?: string
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_frequency_minutes?: number | null
          updated_at?: string
        }
        Update: {
          config_data?: Json
          created_at?: string
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_frequency_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          company_domain: string | null
          created_at: string
          data_payload: Json | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          integration_type: string
          operation: string
          status: string
        }
        Insert: {
          company_domain?: string | null
          created_at?: string
          data_payload?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_type: string
          operation: string
          status?: string
        }
        Update: {
          company_domain?: string | null
          created_at?: string
          data_payload?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_type?: string
          operation?: string
          status?: string
        }
        Relationships: []
      }
      key_statistics: {
        Row: {
          display_locations: string[] | null
          display_order: number | null
          id: string
          is_active: boolean | null
          metric_key: string
          metric_label: string
          metric_value: string
          updated_at: string
        }
        Insert: {
          display_locations?: string[] | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metric_key: string
          metric_label: string
          metric_value: string
          updated_at?: string
        }
        Update: {
          display_locations?: string[] | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metric_key?: string
          metric_label?: string
          metric_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_page_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          template_config: Json | null
          template_html: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          template_config?: Json | null
          template_html: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          template_config?: Json | null
          template_html?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          lead_score_id: string | null
          message: string
          priority: string | null
          threshold_reached: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          lead_score_id?: string | null
          message: string
          priority?: string | null
          threshold_reached?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          lead_score_id?: string | null
          message?: string
          priority?: string | null
          threshold_reached?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_alerts_lead_score_id_fkey"
            columns: ["lead_score_id"]
            isOneToOne: false
            referencedRelation: "lead_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_behavior_events: {
        Row: {
          company_domain: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_path: string | null
          points_awarded: number | null
          referrer: string | null
          rule_id: string | null
          session_id: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
        }
        Insert: {
          company_domain?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          points_awarded?: number | null
          referrer?: string | null
          rule_id?: string | null
          session_id: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Update: {
          company_domain?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          points_awarded?: number | null
          referrer?: string | null
          rule_id?: string | null
          session_id?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_behavior_events_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "lead_scoring_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_magnet_downloads: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          lead_magnet_id: string
          referrer: string | null
          user_agent: string | null
          user_company: string | null
          user_email: string
          user_name: string | null
          user_phone: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          lead_magnet_id: string
          referrer?: string | null
          user_agent?: string | null
          user_company?: string | null
          user_email: string
          user_name?: string | null
          user_phone?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          lead_magnet_id?: string
          referrer?: string | null
          user_agent?: string | null
          user_company?: string | null
          user_email?: string
          user_name?: string | null
          user_phone?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_magnet_downloads_lead_magnet_id_fkey"
            columns: ["lead_magnet_id"]
            isOneToOne: false
            referencedRelation: "lead_magnets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_magnets: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          description: string
          download_count: number
          featured_image_url: string | null
          file_url: string | null
          id: string
          landing_page_slug: string | null
          lead_conversion_count: number
          meta_description: string | null
          meta_title: string | null
          sector: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          download_count?: number
          featured_image_url?: string | null
          file_url?: string | null
          id?: string
          landing_page_slug?: string | null
          lead_conversion_count?: number
          meta_description?: string | null
          meta_title?: string | null
          sector: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          download_count?: number
          featured_image_url?: string | null
          file_url?: string | null
          id?: string
          landing_page_slug?: string | null
          lead_conversion_count?: number
          meta_description?: string | null
          meta_title?: string | null
          sector?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_scores: {
        Row: {
          assigned_to: string | null
          company_domain: string | null
          company_name: string | null
          company_size: string | null
          contact_name: string | null
          created_at: string | null
          crm_id: string | null
          crm_synced: boolean | null
          email: string | null
          first_visit: string | null
          hot_lead_threshold: number | null
          id: string
          industry: string | null
          is_hot_lead: boolean | null
          last_activity: string | null
          lead_status: string | null
          location: string | null
          notes: string | null
          phone: string | null
          total_score: number | null
          updated_at: string | null
          visit_count: number | null
          visitor_id: string
        }
        Insert: {
          assigned_to?: string | null
          company_domain?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_id?: string | null
          crm_synced?: boolean | null
          email?: string | null
          first_visit?: string | null
          hot_lead_threshold?: number | null
          id?: string
          industry?: string | null
          is_hot_lead?: boolean | null
          last_activity?: string | null
          lead_status?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          total_score?: number | null
          updated_at?: string | null
          visit_count?: number | null
          visitor_id: string
        }
        Update: {
          assigned_to?: string | null
          company_domain?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_id?: string | null
          crm_synced?: boolean | null
          email?: string | null
          first_visit?: string | null
          hot_lead_threshold?: number | null
          id?: string
          industry?: string | null
          is_hot_lead?: boolean | null
          last_activity?: string | null
          lead_status?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          total_score?: number | null
          updated_at?: string | null
          visit_count?: number | null
          visitor_id?: string
        }
        Relationships: []
      }
      lead_scoring_rules: {
        Row: {
          company_size_filter: string[] | null
          created_at: string | null
          decay_days: number | null
          description: string | null
          id: string
          industry_specific: string[] | null
          is_active: boolean | null
          name: string
          page_pattern: string | null
          points: number
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          company_size_filter?: string[] | null
          created_at?: string | null
          decay_days?: number | null
          description?: string | null
          id?: string
          industry_specific?: string[] | null
          is_active?: boolean | null
          name: string
          page_pattern?: string | null
          points?: number
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          company_size_filter?: string[] | null
          created_at?: string | null
          decay_days?: number | null
          description?: string | null
          id?: string
          industry_specific?: string[] | null
          is_active?: boolean | null
          name?: string
          page_pattern?: string | null
          points?: number
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      linkedin_intelligence: {
        Row: {
          company_domain: string
          company_name: string
          company_updates: string[] | null
          confidence_score: number | null
          created_at: string
          decision_makers: Json | null
          funding_signals: Json | null
          growth_signals: string[] | null
          id: string
          last_updated: string | null
          optimal_outreach_timing: string | null
          recent_hires: number | null
        }
        Insert: {
          company_domain: string
          company_name: string
          company_updates?: string[] | null
          confidence_score?: number | null
          created_at?: string
          decision_makers?: Json | null
          funding_signals?: Json | null
          growth_signals?: string[] | null
          id?: string
          last_updated?: string | null
          optimal_outreach_timing?: string | null
          recent_hires?: number | null
        }
        Update: {
          company_domain?: string
          company_name?: string
          company_updates?: string[] | null
          confidence_score?: number | null
          created_at?: string
          decision_makers?: Json | null
          funding_signals?: Json | null
          growth_signals?: string[] | null
          id?: string
          last_updated?: string | null
          optimal_outreach_timing?: string | null
          recent_hires?: number | null
        }
        Relationships: []
      }
      marketing_attribution: {
        Row: {
          attribution_weight: number | null
          campaign: string | null
          channel: string
          conversion_value: number | null
          created_at: string | null
          id: string
          lead_score_id: string | null
          medium: string | null
          source: string | null
          touchpoint_data: Json
          touchpoint_order: number | null
        }
        Insert: {
          attribution_weight?: number | null
          campaign?: string | null
          channel: string
          conversion_value?: number | null
          created_at?: string | null
          id?: string
          lead_score_id?: string | null
          medium?: string | null
          source?: string | null
          touchpoint_data: Json
          touchpoint_order?: number | null
        }
        Update: {
          attribution_weight?: number | null
          campaign?: string | null
          channel?: string
          conversion_value?: number | null
          created_at?: string | null
          id?: string
          lead_score_id?: string | null
          medium?: string | null
          source?: string | null
          touchpoint_data?: Json
          touchpoint_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_attribution_lead_score_id_fkey"
            columns: ["lead_score_id"]
            isOneToOne: false
            referencedRelation: "lead_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposal_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          proposal_id: string
          user_agent: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          proposal_id: string
          user_agent?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          proposal_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_activities_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "fee_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_sections: {
        Row: {
          content_template: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          section_type: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
        }
        Insert: {
          content_template?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          section_type?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
        }
        Update: {
          content_template?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          section_type?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
        }
        Relationships: []
      }
      report_configs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          metrics: string[]
          name: string
          recipients: string[]
          schedule: string
          template: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          metrics?: string[]
          name: string
          recipients?: string[]
          schedule: string
          template: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          metrics?: string[]
          name?: string
          recipients?: string[]
          schedule?: string
          template?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          lead_score_id: string | null
          opened_at: string | null
          recipient_email: string
          scheduled_for: string
          sent_at: string | null
          sequence_id: string | null
          status: string | null
          step_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_score_id?: string | null
          opened_at?: string | null
          recipient_email: string
          scheduled_for: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: string | null
          step_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_score_id?: string | null
          opened_at?: string | null
          recipient_email?: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: string | null
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_lead_score_id_fkey"
            columns: ["lead_score_id"]
            isOneToOne: false
            referencedRelation: "lead_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_emails_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_emails_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "email_sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_multiples: {
        Row: {
          description: string | null
          ebitda_multiple: number
          employee_range: string | null
          id: string
          is_active: boolean
          last_updated: string
          revenue_multiple: number
          sector_name: string
        }
        Insert: {
          description?: string | null
          ebitda_multiple: number
          employee_range?: string | null
          id?: string
          is_active?: boolean
          last_updated?: string
          revenue_multiple: number
          sector_name: string
        }
        Update: {
          description?: string | null
          ebitda_multiple?: number
          employee_range?: string | null
          id?: string
          is_active?: boolean
          last_updated?: string
          revenue_multiple?: number
          sector_name?: string
        }
        Relationships: []
      }
      sector_valuation_multiples: {
        Row: {
          description: string | null
          display_locations: string[] | null
          display_order: number | null
          id: string
          is_active: boolean | null
          median_multiple: string
          multiple_range: string
          sector_name: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          display_locations?: string[] | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          median_multiple: string
          multiple_range: string
          sector_name: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          display_locations?: string[] | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          median_multiple?: string
          multiple_range?: string
          sector_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          component: string | null
          context: string | null
          created_at: string
          environment: string | null
          error_stack: string | null
          id: string
          level: string
          log_data: Json | null
          message: string
          session_id: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          context?: string | null
          created_at?: string
          environment?: string | null
          error_stack?: string | null
          id?: string
          level: string
          log_data?: Json | null
          message: string
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          context?: string | null
          created_at?: string
          environment?: string | null
          error_stack?: string | null
          id?: string
          level?: string
          log_data?: Json | null
          message?: string
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          active_users: number
          api_response_time: number
          created_at: string
          error_rate: number
          id: string
          recorded_at: string
          server_load: number
          uptime_percentage: number
        }
        Insert: {
          active_users?: number
          api_response_time?: number
          created_at?: string
          error_rate?: number
          id?: string
          recorded_at?: string
          server_load?: number
          uptime_percentage?: number
        }
        Update: {
          active_users?: number
          api_response_time?: number
          created_at?: string
          error_rate?: number
          id?: string
          recorded_at?: string
          server_load?: number
          uptime_percentage?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          case_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          org_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          position: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          position?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_company: string
          client_name: string
          client_photo_url: string | null
          client_position: string | null
          created_at: string
          display_locations: string[] | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          project_type: string | null
          rating: number | null
          sector: string | null
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          client_company: string
          client_name: string
          client_photo_url?: string | null
          client_position?: string | null
          created_at?: string
          display_locations?: string[] | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          project_type?: string | null
          rating?: number | null
          sector?: string | null
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          client_company?: string
          client_name?: string
          client_photo_url?: string | null
          client_position?: string | null
          created_at?: string
          display_locations?: string[] | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          project_type?: string | null
          rating?: number | null
          sector?: string | null
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          case_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_billable: boolean
          org_id: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_billable?: boolean
          org_id: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_billable?: boolean
          org_id?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_ratings: {
        Row: {
          company_sector: string | null
          company_size: string | null
          created_at: string
          ease_of_use: number
          feedback_comment: string | null
          id: string
          ip_address: unknown | null
          recommendation: number
          result_accuracy: number
          user_agent: string | null
          user_email: string | null
        }
        Insert: {
          company_sector?: string | null
          company_size?: string | null
          created_at?: string
          ease_of_use: number
          feedback_comment?: string | null
          id?: string
          ip_address?: unknown | null
          recommendation: number
          result_accuracy: number
          user_agent?: string | null
          user_email?: string | null
        }
        Update: {
          company_sector?: string | null
          company_size?: string | null
          created_at?: string
          ease_of_use?: number
          feedback_comment?: string | null
          id?: string
          ip_address?: unknown | null
          recommendation?: number
          result_accuracy?: number
          user_agent?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          org_id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          org_id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          org_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          actions_completed: number | null
          completed_at: string | null
          error_message: string | null
          execution_status: string | null
          id: string
          lead_score_id: string | null
          started_at: string | null
          total_actions: number | null
          trigger_data: Json | null
          workflow_id: string | null
        }
        Insert: {
          actions_completed?: number | null
          completed_at?: string | null
          error_message?: string | null
          execution_status?: string | null
          id?: string
          lead_score_id?: string | null
          started_at?: string | null
          total_actions?: number | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Update: {
          actions_completed?: number | null
          completed_at?: string | null
          error_message?: string | null
          execution_status?: string | null
          id?: string
          lead_score_id?: string | null
          started_at?: string | null
          total_actions?: number | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_lead_score_id_fkey"
            columns: ["lead_score_id"]
            isOneToOne: false
            referencedRelation: "lead_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_score: {
        Args: { p_visitor_id: string }
        Returns: number
      }
      check_user_admin_role: {
        Args: { check_user_id: string }
        Returns: string
      }
      cleanup_old_lead_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_proposal_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_proposal_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_user_super_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      process_automation_workflows: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "editor" | "viewer"
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "approved"
        | "rejected"
        | "expired"
      service_type:
        | "venta_empresas"
        | "due_diligence"
        | "valoraciones"
        | "asesoramiento_legal"
        | "planificacion_fiscal"
        | "reestructuraciones"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "admin", "editor", "viewer"],
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "approved",
        "rejected",
        "expired",
      ],
      service_type: [
        "venta_empresas",
        "due_diligence",
        "valoraciones",
        "asesoramiento_legal",
        "planificacion_fiscal",
        "reestructuraciones",
      ],
    },
  },
} as const
