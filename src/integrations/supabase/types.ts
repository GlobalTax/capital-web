export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
        Relationships: [
          {
            foreignKeyName: "blog_post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
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
          email_message_id: string | null
          email_opened: boolean | null
          email_opened_at: string | null
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
          email_message_id?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
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
          email_message_id?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
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
          abandonment_detected_at: string | null
          cif: string | null
          company_name: string
          competitive_advantage: string | null
          completion_percentage: number | null
          contact_name: string
          created_at: string
          current_step: number | null
          ebitda: number | null
          ebitda_multiple_used: number | null
          email: string
          email_message_id: string | null
          email_opened: boolean | null
          email_opened_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          employee_range: string
          final_valuation: number | null
          form_submitted_at: string | null
          growth_rate: number | null
          hubspot_sent: boolean | null
          hubspot_sent_at: string | null
          id: string
          immediate_alert_sent: boolean | null
          immediate_alert_sent_at: string | null
          industry: string
          ip_address: unknown | null
          last_activity_at: string | null
          last_modified_field: string | null
          location: string | null
          net_profit_margin: number | null
          ownership_participation: string | null
          phone: string | null
          phone_e164: string | null
          recovery_link_sent: boolean | null
          recovery_link_sent_at: string | null
          revenue: number | null
          time_spent_seconds: number | null
          unique_token: string | null
          user_agent: string | null
          v4_accessed: boolean | null
          v4_accessed_at: string | null
          v4_engagement_score: number | null
          v4_link_sent: boolean | null
          v4_link_sent_at: string | null
          v4_scenarios_viewed: Json | null
          v4_time_spent: number | null
          valuation_range_max: number | null
          valuation_range_min: number | null
          valuation_status: string | null
          whatsapp_opt_in: boolean | null
          whatsapp_sent: boolean | null
          whatsapp_sent_at: string | null
          years_of_operation: number | null
        }
        Insert: {
          abandonment_detected_at?: string | null
          cif?: string | null
          company_name: string
          competitive_advantage?: string | null
          completion_percentage?: number | null
          contact_name: string
          created_at?: string
          current_step?: number | null
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email: string
          email_message_id?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_range: string
          final_valuation?: number | null
          form_submitted_at?: string | null
          growth_rate?: number | null
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          immediate_alert_sent?: boolean | null
          immediate_alert_sent_at?: string | null
          industry: string
          ip_address?: unknown | null
          last_activity_at?: string | null
          last_modified_field?: string | null
          location?: string | null
          net_profit_margin?: number | null
          ownership_participation?: string | null
          phone?: string | null
          phone_e164?: string | null
          recovery_link_sent?: boolean | null
          recovery_link_sent_at?: string | null
          revenue?: number | null
          time_spent_seconds?: number | null
          unique_token?: string | null
          user_agent?: string | null
          v4_accessed?: boolean | null
          v4_accessed_at?: string | null
          v4_engagement_score?: number | null
          v4_link_sent?: boolean | null
          v4_link_sent_at?: string | null
          v4_scenarios_viewed?: Json | null
          v4_time_spent?: number | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          valuation_status?: string | null
          whatsapp_opt_in?: boolean | null
          whatsapp_sent?: boolean | null
          whatsapp_sent_at?: string | null
          years_of_operation?: number | null
        }
        Update: {
          abandonment_detected_at?: string | null
          cif?: string | null
          company_name?: string
          competitive_advantage?: string | null
          completion_percentage?: number | null
          contact_name?: string
          created_at?: string
          current_step?: number | null
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email?: string
          email_message_id?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_range?: string
          final_valuation?: number | null
          form_submitted_at?: string | null
          growth_rate?: number | null
          hubspot_sent?: boolean | null
          hubspot_sent_at?: string | null
          id?: string
          immediate_alert_sent?: boolean | null
          immediate_alert_sent_at?: string | null
          industry?: string
          ip_address?: unknown | null
          last_activity_at?: string | null
          last_modified_field?: string | null
          location?: string | null
          net_profit_margin?: number | null
          ownership_participation?: string | null
          phone?: string | null
          phone_e164?: string | null
          recovery_link_sent?: boolean | null
          recovery_link_sent_at?: string | null
          revenue?: number | null
          time_spent_seconds?: number | null
          unique_token?: string | null
          user_agent?: string | null
          v4_accessed?: boolean | null
          v4_accessed_at?: string | null
          v4_engagement_score?: number | null
          v4_link_sent?: boolean | null
          v4_link_sent_at?: string | null
          v4_scenarios_viewed?: Json | null
          v4_time_spent?: number | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          valuation_status?: string | null
          whatsapp_opt_in?: boolean | null
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
          email_message_id: string | null
          email_opened: boolean | null
          email_opened_at: string | null
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
          email_message_id?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
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
          email_message_id?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
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
      custom_widgets: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          permissions: string[]
          updated_at: string
          user_id: string
          widget_config: Json
          widget_name: string
          widget_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          permissions?: string[]
          updated_at?: string
          user_id: string
          widget_config?: Json
          widget_name: string
          widget_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          permissions?: string[]
          updated_at?: string
          user_id?: string
          widget_config?: Json
          widget_name?: string
          widget_type?: string
        }
        Relationships: []
      }
      daily_incomplete_reports: {
        Row: {
          created_at: string
          email_id: string | null
          email_sent: boolean
          email_subject: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          incomplete_count: number
          incomplete_valuations: Json
          period_end: string
          period_start: string
          report_date: string
          report_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_id?: string | null
          email_sent?: boolean
          email_subject?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          incomplete_count?: number
          incomplete_valuations?: Json
          period_end: string
          period_start: string
          report_date: string
          report_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_id?: string | null
          email_sent?: boolean
          email_subject?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          incomplete_count?: number
          incomplete_valuations?: Json
          period_end?: string
          period_start?: string
          report_date?: string
          report_status?: string
          updated_at?: string
        }
        Relationships: []
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
      hero_slides: {
        Row: {
          autoplay_duration: number | null
          background_color: string | null
          created_at: string
          cta_primary_text: string | null
          cta_primary_url: string | null
          cta_secondary_text: string | null
          cta_secondary_url: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          autoplay_duration?: number | null
          background_color?: string | null
          created_at?: string
          cta_primary_text?: string | null
          cta_primary_url?: string | null
          cta_secondary_text?: string | null
          cta_secondary_url?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          autoplay_duration?: number | null
          background_color?: string | null
          created_at?: string
          cta_primary_text?: string | null
          cta_primary_url?: string | null
          cta_secondary_text?: string | null
          cta_secondary_url?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          subtitle?: string | null
          text_color?: string | null
          title?: string
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
      newsletter_subscribers: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          interests: string[] | null
          ip_address: unknown | null
          is_active: boolean
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          interests?: string[] | null
          ip_address?: unknown | null
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          interests?: string[] | null
          ip_address?: unknown | null
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
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
      security_events: {
        Row: {
          action_attempted: string | null
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_attempted?: string | null
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_attempted?: string | null
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      user_dashboard_layouts: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          is_shared: boolean
          layout_data: Json
          layout_name: string
          shared_with: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          is_shared?: boolean
          layout_data?: Json
          layout_name: string
          shared_with?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          is_shared?: boolean
          layout_data?: Json
          layout_name?: string
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      v4_interactions: {
        Row: {
          company_valuation_id: string | null
          created_at: string | null
          id: string
          interaction_data: Json | null
          interaction_type: string
        }
        Insert: {
          company_valuation_id?: string | null
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: string
        }
        Update: {
          company_valuation_id?: string | null
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "v4_interactions_company_valuation_id_fkey"
            columns: ["company_valuation_id"]
            isOneToOne: false
            referencedRelation: "company_valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_actions: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_result: Json | null
          execution_status: string
          id: string
          lead_score_id: string | null
          started_at: string
          total_actions: number | null
          trigger_data: Json | null
          updated_at: string
          workflow_id: string
        }
        Insert: {
          completed_actions?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_result?: Json | null
          execution_status?: string
          id?: string
          lead_score_id?: string | null
          started_at?: string
          total_actions?: number | null
          trigger_data?: Json | null
          updated_at?: string
          workflow_id: string
        }
        Update: {
          completed_actions?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_result?: Json | null
          execution_status?: string
          id?: string
          lead_score_id?: string | null
          started_at?: string
          total_actions?: number | null
          trigger_data?: Json | null
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workflow_executions_lead_score_id"
            columns: ["lead_score_id"]
            isOneToOne: false
            referencedRelation: "lead_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workflow_executions_workflow_id"
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
      bootstrap_first_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      calculate_lead_score: {
        Args: { p_visitor_id: string }
        Returns: number
      }
      check_rate_limit: {
        Args: {
          identifier: string
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
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
      detect_abandoned_valuations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_proposal_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_proposal_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_v4_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_basic_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          full_name: string
          id: string
          is_active: boolean
          last_login: string
          role: Database["public"]["Enums"]["admin_role"]
        }[]
      }
      is_user_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_user_super_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      log_auth_security_event: {
        Args: {
          details?: Json
          event_type: string
          ip_address?: unknown
          user_agent?: string
          user_email?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_action_attempted?: string
          p_details?: Json
          p_event_type: string
          p_severity?: string
          p_table_name?: string
        }
        Returns: undefined
      }
      log_security_violation: {
        Args: {
          details?: Json
          table_name: string
          user_id?: string
          violation_type: string
        }
        Returns: undefined
      }
      process_automation_workflows: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      send_recovery_emails: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      validate_strong_password: {
        Args: { password_text: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
