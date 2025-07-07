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
      blog_analytics: {
        Row: {
          id: string
          ip_address: unknown | null
          post_id: string
          post_slug: string
          reading_time: number | null
          referrer: string | null
          scroll_percentage: number | null
          session_id: string | null
          user_agent: string | null
          viewed_at: string
          visitor_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          post_id: string
          post_slug: string
          reading_time?: number | null
          referrer?: string | null
          scroll_percentage?: number | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string
          visitor_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          post_id?: string
          post_slug?: string
          reading_time?: number | null
          referrer?: string | null
          scroll_percentage?: number | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      blog_post_metrics: {
        Row: {
          avg_reading_time: number | null
          avg_scroll_percentage: number | null
          created_at: string
          id: string
          last_viewed: string | null
          post_id: string
          post_slug: string
          total_views: number | null
          unique_views: number | null
          updated_at: string
        }
        Insert: {
          avg_reading_time?: number | null
          avg_scroll_percentage?: number | null
          created_at?: string
          id?: string
          last_viewed?: string | null
          post_id: string
          post_slug: string
          total_views?: number | null
          unique_views?: number | null
          updated_at?: string
        }
        Update: {
          avg_reading_time?: number | null
          avg_scroll_percentage?: number | null
          created_at?: string
          id?: string
          last_viewed?: string | null
          post_id?: string
          post_slug?: string
          total_views?: number | null
          unique_views?: number | null
          updated_at?: string
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
      design_resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
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
      landing_page_conversions: {
        Row: {
          attribution_data: Json | null
          conversion_type: string
          conversion_value: number | null
          created_at: string
          form_data: Json | null
          id: string
          ip_address: unknown | null
          landing_page_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visitor_data: Json | null
          visitor_id: string | null
        }
        Insert: {
          attribution_data?: Json | null
          conversion_type: string
          conversion_value?: number | null
          created_at?: string
          form_data?: Json | null
          id?: string
          ip_address?: unknown | null
          landing_page_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_data?: Json | null
          visitor_id?: string | null
        }
        Update: {
          attribution_data?: Json | null
          conversion_type?: string
          conversion_value?: number | null
          created_at?: string
          form_data?: Json | null
          id?: string
          ip_address?: unknown | null
          landing_page_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_data?: Json | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_conversions_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_templates: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          preview_image_url: string | null
          template_config: Json
          template_html: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          preview_image_url?: string | null
          template_config?: Json
          template_html: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          preview_image_url?: string | null
          template_config?: Json
          template_html?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          analytics_config: Json
          content_config: Json
          conversion_goals: Json
          created_at: string
          created_by: string | null
          custom_css: string | null
          custom_js: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          published_at: string | null
          slug: string
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          analytics_config?: Json
          content_config?: Json
          conversion_goals?: Json
          created_at?: string
          created_by?: string | null
          custom_css?: string | null
          custom_js?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          analytics_config?: Json
          content_config?: Json
          conversion_goals?: Json
          created_at?: string
          created_by?: string | null
          custom_css?: string | null
          custom_js?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "landing_page_templates"
            referencedColumns: ["id"]
          },
        ]
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
