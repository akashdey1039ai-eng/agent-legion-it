export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          id: string
          last_sync_at: string | null
          opportunity_id: string | null
          owner_id: string | null
          salesforce_id: string | null
          scheduled_at: string | null
          status: string | null
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          opportunity_id?: string | null
          owner_id?: string | null
          salesforce_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          opportunity_id?: string | null
          owner_id?: string | null
          salesforce_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_members: {
        Row: {
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          first_responded_date: string | null
          has_responded: boolean | null
          id: string
          last_sync_at: string | null
          salesforce_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          first_responded_date?: string | null
          has_responded?: boolean | null
          id?: string
          last_sync_at?: string | null
          salesforce_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          first_responded_date?: string | null
          has_responded?: boolean | null
          id?: string
          last_sync_at?: string | null
          salesforce_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          actual_cost: number | null
          budgeted_cost: number | null
          created_at: string
          description: string | null
          end_date: string | null
          expected_response: number | null
          expected_revenue: number | null
          id: string
          last_sync_at: string | null
          name: string
          number_sent: number | null
          owner_id: string | null
          salesforce_id: string | null
          start_date: string | null
          status: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          budgeted_cost?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          expected_response?: number | null
          expected_revenue?: number | null
          id?: string
          last_sync_at?: string | null
          name: string
          number_sent?: number | null
          owner_id?: string | null
          salesforce_id?: string | null
          start_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          budgeted_cost?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          expected_response?: number | null
          expected_revenue?: number | null
          id?: string
          last_sync_at?: string | null
          name?: string
          number_sent?: number | null
          owner_id?: string | null
          salesforce_id?: string | null
          start_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          case_number: string | null
          closed_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          id: string
          last_sync_at: string | null
          origin: string | null
          owner_id: string | null
          priority: string
          reason: string | null
          salesforce_id: string | null
          status: string
          subject: string
          type: string | null
          updated_at: string
        }
        Insert: {
          case_number?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          origin?: string | null
          owner_id?: string | null
          priority?: string
          reason?: string | null
          salesforce_id?: string | null
          status?: string
          subject: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          case_number?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          origin?: string | null
          owner_id?: string | null
          priority?: string
          reason?: string | null
          salesforce_id?: string | null
          status?: string
          subject?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          last_sync_at: string | null
          name: string
          phone: string | null
          revenue: number | null
          salesforce_id: string | null
          size: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          last_sync_at?: string | null
          name: string
          phone?: string | null
          revenue?: number | null
          salesforce_id?: string | null
          size?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          last_sync_at?: string | null
          name?: string
          phone?: string | null
          revenue?: number | null
          salesforce_id?: string | null
          size?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          department: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          last_sync_at: string | null
          lead_score: number | null
          lead_source: string | null
          owner_id: string | null
          phone: string | null
          salesforce_id: string | null
          salesforce_type: string | null
          status: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          last_sync_at?: string | null
          lead_score?: number | null
          lead_source?: string | null
          owner_id?: string | null
          phone?: string | null
          salesforce_id?: string | null
          salesforce_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          last_sync_at?: string | null
          lead_score?: number | null
          lead_source?: string | null
          owner_id?: string | null
          phone?: string | null
          salesforce_id?: string | null
          salesforce_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          article_number: string | null
          article_type: string | null
          content: string | null
          created_at: string
          created_by_id: string | null
          data_category: string | null
          data_category_group: string | null
          id: string
          is_visible_in_app: boolean | null
          is_visible_in_csp: boolean | null
          is_visible_in_pkb: boolean | null
          language: string | null
          last_modified_by_id: string | null
          last_sync_at: string | null
          publish_status: string | null
          published_at: string | null
          salesforce_id: string | null
          summary: string | null
          title: string
          updated_at: string
          url_name: string | null
          validation_status: string | null
        }
        Insert: {
          article_number?: string | null
          article_type?: string | null
          content?: string | null
          created_at?: string
          created_by_id?: string | null
          data_category?: string | null
          data_category_group?: string | null
          id?: string
          is_visible_in_app?: boolean | null
          is_visible_in_csp?: boolean | null
          is_visible_in_pkb?: boolean | null
          language?: string | null
          last_modified_by_id?: string | null
          last_sync_at?: string | null
          publish_status?: string | null
          published_at?: string | null
          salesforce_id?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          url_name?: string | null
          validation_status?: string | null
        }
        Update: {
          article_number?: string | null
          article_type?: string | null
          content?: string | null
          created_at?: string
          created_by_id?: string | null
          data_category?: string | null
          data_category_group?: string | null
          id?: string
          is_visible_in_app?: boolean | null
          is_visible_in_csp?: boolean | null
          is_visible_in_pkb?: boolean | null
          language?: string | null
          last_modified_by_id?: string | null
          last_sync_at?: string | null
          publish_status?: string | null
          published_at?: string | null
          salesforce_id?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          url_name?: string | null
          validation_status?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          amount: number | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          expected_close_date: string | null
          id: string
          last_sync_at: string | null
          name: string
          owner_id: string | null
          probability: number | null
          salesforce_id: string | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          owner_id?: string | null
          probability?: number | null
          salesforce_id?: string | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          owner_id?: string | null
          probability?: number | null
          salesforce_id?: string | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          display_name: string
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          display_name: string
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          display_name?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      salesforce_sync_log: {
        Row: {
          completed_at: string | null
          created_at: string
          data_payload: Json | null
          error_message: string | null
          id: string
          local_id: string | null
          object_type: string
          operation: string
          salesforce_id: string | null
          status: string
          sync_direction: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data_payload?: Json | null
          error_message?: string | null
          id?: string
          local_id?: string | null
          object_type: string
          operation: string
          salesforce_id?: string | null
          status?: string
          sync_direction: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data_payload?: Json | null
          error_message?: string | null
          id?: string
          local_id?: string | null
          object_type?: string
          operation?: string
          salesforce_id?: string | null
          status?: string
          sync_direction?: string
        }
        Relationships: []
      }
      salesforce_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          instance_url: string
          refresh_token: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          instance_url: string
          refresh_token?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          instance_url?: string
          refresh_token?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
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
    Enums: {},
  },
} as const
