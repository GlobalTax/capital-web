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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
