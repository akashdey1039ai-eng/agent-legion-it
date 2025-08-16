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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          attendees: Json | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          last_sync_at: string | null
          location: string | null
          opportunity_id: string | null
          outcome: string | null
          owner_id: string | null
          priority: string | null
          salesforce_id: string | null
          scheduled_at: string | null
          status: string | null
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          activity_type?: string
          attendees?: Json | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          last_sync_at?: string | null
          location?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          owner_id?: string | null
          priority?: string | null
          salesforce_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          attendees?: Json | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          last_sync_at?: string | null
          location?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          owner_id?: string | null
          priority?: string | null
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
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "secure_contacts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
      ai_agent_executions: {
        Row: {
          agent_id: string
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          confidence_score: number | null
          cost_usd: number | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          execution_type: string
          human_approved: boolean | null
          id: string
          input_data: Json
          output_data: Json | null
          status: string
          tokens_used: number | null
        }
        Insert: {
          agent_id: string
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          execution_type: string
          human_approved?: boolean | null
          id?: string
          input_data: Json
          output_data?: Json | null
          status?: string
          tokens_used?: number | null
        }
        Update: {
          agent_id?: string
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          execution_type?: string
          human_approved?: boolean | null
          id?: string
          input_data?: Json
          output_data?: Json | null
          status?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          config: Json
          created_at: string
          created_by: string
          deployed_at: string | null
          id: string
          last_activity_at: string | null
          max_confidence_threshold: number | null
          min_confidence_threshold: number | null
          name: string
          requires_human_approval: boolean | null
          security_level: string
          status: string
          type: string
          updated_at: string
          version: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by: string
          deployed_at?: string | null
          id?: string
          last_activity_at?: string | null
          max_confidence_threshold?: number | null
          min_confidence_threshold?: number | null
          name: string
          requires_human_approval?: boolean | null
          security_level?: string
          status?: string
          type: string
          updated_at?: string
          version?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string
          deployed_at?: string | null
          id?: string
          last_activity_at?: string | null
          max_confidence_threshold?: number | null
          min_confidence_threshold?: number | null
          name?: string
          requires_human_approval?: boolean | null
          security_level?: string
          status?: string
          type?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      ai_performance_metrics: {
        Row: {
          agent_id: string
          avg_confidence_score: number | null
          avg_execution_time_ms: number | null
          created_at: string
          failed_executions: number | null
          human_override_rate: number | null
          id: string
          metric_date: string
          successful_executions: number | null
          total_cost_usd: number | null
          total_executions: number | null
          user_satisfaction_score: number | null
        }
        Insert: {
          agent_id: string
          avg_confidence_score?: number | null
          avg_execution_time_ms?: number | null
          created_at?: string
          failed_executions?: number | null
          human_override_rate?: number | null
          id?: string
          metric_date?: string
          successful_executions?: number | null
          total_cost_usd?: number | null
          total_executions?: number | null
          user_satisfaction_score?: number | null
        }
        Update: {
          agent_id?: string
          avg_confidence_score?: number | null
          avg_execution_time_ms?: number | null
          created_at?: string
          failed_executions?: number | null
          human_override_rate?: number | null
          id?: string
          metric_date?: string
          successful_executions?: number | null
          total_cost_usd?: number | null
          total_executions?: number | null
          user_satisfaction_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_performance_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_security_events: {
        Row: {
          agent_id: string | null
          description: string
          detected_at: string
          event_type: string
          execution_id: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          source_ip: unknown | null
          user_agent: string | null
        }
        Insert: {
          agent_id?: string | null
          description: string
          detected_at?: string
          event_type: string
          execution_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          source_ip?: unknown | null
          user_agent?: string | null
        }
        Update: {
          agent_id?: string | null
          description?: string
          detected_at?: string
          event_type?: string
          execution_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          source_ip?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_security_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_security_events_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "campaign_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "secure_contacts_view"
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
          {
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "secure_contacts_view"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          annual_revenue: number | null
          assigned_user_id: string | null
          city: string | null
          company_type: string | null
          country: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          employee_count: number | null
          id: string
          industry: string | null
          last_sync_at: string | null
          name: string
          parent_company_id: string | null
          phone: string | null
          primary_contact_id: string | null
          rating: string | null
          revenue: number | null
          salesforce_id: string | null
          size: string | null
          social_media: Json | null
          state: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          assigned_user_id?: string | null
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          last_sync_at?: string | null
          name: string
          parent_company_id?: string | null
          phone?: string | null
          primary_contact_id?: string | null
          rating?: string | null
          revenue?: number | null
          salesforce_id?: string | null
          size?: string | null
          social_media?: Json | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          assigned_user_id?: string | null
          city?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          last_sync_at?: string | null
          name?: string
          parent_company_id?: string | null
          phone?: string | null
          primary_contact_id?: string | null
          rating?: string | null
          revenue?: number | null
          salesforce_id?: string | null
          size?: string | null
          social_media?: Json | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: Json | null
          birthday: string | null
          company_id: string | null
          created_at: string
          custom_fields: Json | null
          department: string | null
          email: string
          first_name: string
          hubspot_id: string | null
          id: string
          last_name: string
          last_sync_at: string | null
          lead_score: number | null
          lead_source: string | null
          mobile_phone: string | null
          owner_id: string | null
          phone: string | null
          preferred_contact_method: string | null
          salesforce_id: string | null
          salesforce_type: string | null
          social_media: Json | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          birthday?: string | null
          company_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email: string
          first_name: string
          hubspot_id?: string | null
          id?: string
          last_name: string
          last_sync_at?: string | null
          lead_score?: number | null
          lead_source?: string | null
          mobile_phone?: string | null
          owner_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          salesforce_id?: string | null
          salesforce_type?: string | null
          social_media?: Json | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          birthday?: string | null
          company_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email?: string
          first_name?: string
          hubspot_id?: string | null
          id?: string
          last_name?: string
          last_sync_at?: string | null
          lead_score?: number | null
          lead_source?: string | null
          mobile_phone?: string | null
          owner_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          salesforce_id?: string | null
          salesforce_type?: string | null
          social_media?: Json | null
          status?: string | null
          tags?: string[] | null
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
      data_classifications: {
        Row: {
          audit_required: boolean | null
          classification: string
          column_name: string
          created_at: string
          encryption_required: boolean | null
          id: string
          retention_days: number | null
          table_name: string
        }
        Insert: {
          audit_required?: boolean | null
          classification: string
          column_name: string
          created_at?: string
          encryption_required?: boolean | null
          id?: string
          retention_days?: number | null
          table_name: string
        }
        Update: {
          audit_required?: boolean | null
          classification?: string
          column_name?: string
          created_at?: string
          encryption_required?: boolean | null
          id?: string
          retention_days?: number | null
          table_name?: string
        }
        Relationships: []
      }
      deal_products: {
        Row: {
          created_at: string
          deal_id: string
          discount_percent: number | null
          id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          deal_id: string
          discount_percent?: number | null
          id?: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          deal_id?: string
          discount_percent?: number | null
          id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_products_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          amount: number | null
          assigned_user_id: string | null
          company_id: string | null
          competitors: string[] | null
          contact_id: string | null
          created_at: string
          currency: string | null
          custom_fields: Json | null
          deal_type: string | null
          description: string | null
          expected_close_date: string | null
          hubspot_id: string | null
          id: string
          last_sync_at: string | null
          lead_source: string | null
          name: string
          next_step: string | null
          probability: number | null
          salesforce_id: string | null
          stage: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          amount?: number | null
          assigned_user_id?: string | null
          company_id?: string | null
          competitors?: string[] | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          custom_fields?: Json | null
          deal_type?: string | null
          description?: string | null
          expected_close_date?: string | null
          hubspot_id?: string | null
          id?: string
          last_sync_at?: string | null
          lead_source?: string | null
          name: string
          next_step?: string | null
          probability?: number | null
          salesforce_id?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          amount?: number | null
          assigned_user_id?: string | null
          company_id?: string | null
          competitors?: string[] | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          custom_fields?: Json | null
          deal_type?: string | null
          description?: string | null
          expected_close_date?: string | null
          hubspot_id?: string | null
          id?: string
          last_sync_at?: string | null
          lead_source?: string | null
          name?: string
          next_step?: string | null
          probability?: number | null
          salesforce_id?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "secure_contacts_view"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content_type: string | null
          created_at: string
          file_path: string
          file_size: number | null
          id: string
          is_public: boolean | null
          name: string
          related_to_id: string | null
          related_to_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          related_to_id?: string | null
          related_to_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          related_to_id?: string | null
          related_to_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          total_clicked: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          total_clicked?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          total_clicked?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      hubspot_sync_log: {
        Row: {
          completed_at: string | null
          created_at: string
          data_payload: Json | null
          error_message: string | null
          hubspot_id: string | null
          id: string
          local_id: string | null
          object_type: string
          operation: string
          status: string
          sync_direction: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data_payload?: Json | null
          error_message?: string | null
          hubspot_id?: string | null
          id?: string
          local_id?: string | null
          object_type: string
          operation: string
          status?: string
          sync_direction: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data_payload?: Json | null
          error_message?: string | null
          hubspot_id?: string | null
          id?: string
          local_id?: string | null
          object_type?: string
          operation?: string
          status?: string
          sync_direction?: string
        }
        Relationships: []
      }
      hubspot_tokens: {
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
      leads: {
        Row: {
          assigned_user_id: string | null
          company: string | null
          converted_at: string | null
          converted_company_id: string | null
          converted_contact_id: string | null
          converted_deal_id: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          email: string
          first_name: string
          hubspot_id: string | null
          id: string
          industry: string | null
          last_name: string
          last_sync_at: string | null
          lead_source: string | null
          phone: string | null
          rating: string | null
          salesforce_id: string | null
          score: number | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          company?: string | null
          converted_at?: string | null
          converted_company_id?: string | null
          converted_contact_id?: string | null
          converted_deal_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          email: string
          first_name: string
          hubspot_id?: string | null
          id?: string
          industry?: string | null
          last_name: string
          last_sync_at?: string | null
          lead_source?: string | null
          phone?: string | null
          rating?: string | null
          salesforce_id?: string | null
          score?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          company?: string | null
          converted_at?: string | null
          converted_company_id?: string | null
          converted_contact_id?: string | null
          converted_deal_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          email?: string
          first_name?: string
          hubspot_id?: string | null
          id?: string
          industry?: string | null
          last_name?: string
          last_sync_at?: string | null
          lead_source?: string | null
          phone?: string | null
          rating?: string | null
          salesforce_id?: string | null
          score?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_company_id_fkey"
            columns: ["converted_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_contact_id_fkey"
            columns: ["converted_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_contact_id_fkey"
            columns: ["converted_contact_id"]
            isOneToOne: false
            referencedRelation: "secure_contacts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_deal_id_fkey"
            columns: ["converted_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_private: boolean | null
          related_to_id: string
          related_to_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_private?: boolean | null
          related_to_id: string
          related_to_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_private?: boolean | null
          related_to_id?: string
          related_to_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          code_verifier: string
          created_at: string
          expires_at: string
          state: string
        }
        Insert: {
          code_verifier: string
          created_at?: string
          expires_at: string
          state: string
        }
        Update: {
          code_verifier?: string
          created_at?: string
          expires_at?: string
          state?: string
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
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "secure_contacts_view"
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
      products: {
        Row: {
          category: string | null
          code: string | null
          cost: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
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
      reports: {
        Row: {
          configuration: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          report_type: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          report_type: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          report_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_stages: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          is_closed_lost: boolean | null
          is_closed_won: boolean | null
          name: string
          probability: number | null
          stage_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_closed_lost?: boolean | null
          is_closed_won?: boolean | null
          name: string
          probability?: number | null
          stage_order: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_closed_lost?: boolean | null
          is_closed_won?: boolean | null
          name?: string
          probability?: number | null
          stage_order?: number
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
      tasks: {
        Row: {
          assigned_user_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          related_to_id: string | null
          related_to_type: string | null
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      secure_contacts_view: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          owner_id: string | null
          phone: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: never
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          owner_id?: string | null
          phone?: never
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: never
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          owner_id?: string | null
          phone?: never
          title?: string | null
          updated_at?: string | null
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
    }
    Functions: {
      assign_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      encrypt_sensitive_data: {
        Args: { data: string }
        Returns: string
      }
      get_filtered_contacts: {
        Args: { user_role?: Database["public"]["Enums"]["app_role"] }
        Returns: {
          company_id: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          owner_id: string
          phone: string
          title: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mask_sensitive_data: {
        Args: { data: string; mask_type?: string }
        Returns: string
      }
      update_agent_performance: {
        Args: {
          p_agent_id: string
          p_confidence: number
          p_execution_time: number
          p_metric_date: string
          p_success: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "sales_rep" | "viewer"
      user_role:
        | "admin"
        | "sales_manager"
        | "sales_rep"
        | "marketing_manager"
        | "customer_support"
        | "viewer"
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
      app_role: ["admin", "manager", "sales_rep", "viewer"],
      user_role: [
        "admin",
        "sales_manager",
        "sales_rep",
        "marketing_manager",
        "customer_support",
        "viewer",
      ],
    },
  },
} as const
