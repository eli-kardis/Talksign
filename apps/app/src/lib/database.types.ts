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
      access_tokens: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contract_activities: {
        Row: {
          activity_type: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          actor_type: string | null
          contract_id: string
          created_at: string | null
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          activity_type: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          contract_id: string
          created_at?: string | null
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          activity_type?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          contract_id?: string
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contract_items: {
        Row: {
          amount: number
          contract_id: string
          created_at: string | null
          description: string
          id: string
          quantity: number
          sort_order: number | null
          unit_price: number
        }
        Insert: {
          amount?: number
          contract_id: string
          created_at?: string | null
          description: string
          id?: string
          quantity?: number
          sort_order?: number | null
          unit_price?: number
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string | null
          description?: string
          id?: string
          quantity?: number
          sort_order?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          contract_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          signature_data: string
          signed_at: string | null
          signer_email: string | null
          signer_name: string
          signer_type: string
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          signature_data: string
          signed_at?: string | null
          signer_email?: string | null
          signer_name: string
          signer_type: string
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          signature_data?: string
          signed_at?: string | null
          signer_email?: string | null
          signer_name?: string
          signer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_terms: {
        Row: {
          contract_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          sort_order: number | null
          term_text: string
          term_type: string | null
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          sort_order?: number | null
          term_text: string
          term_type?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          sort_order?: number | null
          term_text?: string
          term_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_address: string | null
          client_business_number: string | null
          client_company: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          content: string | null
          contract_number: string | null
          contract_url: string | null
          created_at: string | null
          customer_id: string | null
          end_date: string | null
          id: string
          issue_date: string
          items: Json
          notes: string | null
          payment_method: string | null
          payment_terms: string | null
          project_description: string | null
          project_end_date: string | null
          project_start_date: string | null
          quote_id: string | null
          signed_at: string | null
          start_date: string
          status: string | null
          subtotal: number | null
          supplier_info: Json | null
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_business_number?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          content?: string | null
          contract_number?: string | null
          contract_url?: string | null
          created_at?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          issue_date: string
          items?: Json
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          project_description?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          quote_id?: string | null
          signed_at?: string | null
          start_date: string
          status?: string | null
          subtotal?: number | null
          supplier_info?: Json | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_business_number?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          content?: string | null
          contract_number?: string | null
          contract_url?: string | null
          created_at?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          project_description?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          quote_id?: string | null
          signed_at?: string | null
          start_date?: string
          status?: string | null
          subtotal?: number | null
          supplier_info?: Json | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          business_registration_number: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          business_registration_number?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          business_registration_number?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_e83d4894: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channels: Json | null
          contract_id: string | null
          created_at: string | null
          id: string
          kakao_message_id: string | null
          kakao_template_id: string | null
          message: string
          payment_id: string | null
          quote_id: string | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channels?: Json | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          kakao_message_id?: string | null
          kakao_template_id?: string | null
          message: string
          payment_id?: string | null
          quote_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          channels?: Json | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          kakao_message_id?: string | null
          kakao_template_id?: string | null
          message?: string
          payment_id?: string | null
          quote_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          pg_provider: string | null
          pg_transaction_id: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          tax_invoice_url: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          pg_provider?: string | null
          pg_transaction_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tax_invoice_url?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          pg_provider?: string | null
          pg_transaction_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tax_invoice_url?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          quantity: number
          quote_id: string
          sort_order: number | null
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          description: string
          id?: string
          quantity?: number
          quote_id: string
          sort_order?: number | null
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          quantity?: number
          quote_id?: string
          sort_order?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_address: string | null
          client_business_number: string | null
          client_company: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          customer_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          items: Json
          notes: string | null
          quote_number: string | null
          status: string | null
          subtotal: number | null
          supplier_info: Json | null
          tax: number | null
          title: string
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_business_number?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          customer_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          items?: Json
          notes?: string | null
          quote_number?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_info?: Json | null
          tax?: number | null
          title: string
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_business_number?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          customer_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          quote_number?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_info?: Json | null
          tax?: number | null
          title?: string
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_payments: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          interval_count: number | null
          interval_type: string
          is_active: boolean | null
          next_payment_date: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          interval_count?: number | null
          interval_type: string
          is_active?: boolean | null
          next_payment_date?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          interval_count?: number | null
          interval_type?: string
          is_active?: boolean | null
          next_payment_date?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          completed_at: string | null
          contract_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string
          is_all_day: boolean | null
          is_completed: boolean | null
          is_recurring: boolean | null
          priority: Database["public"]["Enums"]["schedule_priority"] | null
          quote_id: string | null
          recurrence_rule: Json | null
          reminder_minutes: number[] | null
          start_date: string
          start_time: string | null
          title: string
          type: Database["public"]["Enums"]["schedule_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          is_completed?: boolean | null
          is_recurring?: boolean | null
          priority?: Database["public"]["Enums"]["schedule_priority"] | null
          quote_id?: string | null
          recurrence_rule?: Json | null
          reminder_minutes?: number[] | null
          start_date: string
          start_time?: string | null
          title: string
          type?: Database["public"]["Enums"]["schedule_type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_all_day?: boolean | null
          is_completed?: boolean | null
          is_recurring?: boolean | null
          priority?: Database["public"]["Enums"]["schedule_priority"] | null
          quote_id?: string | null
          recurrence_rule?: Json | null
          reminder_minutes?: number[] | null
          start_date?: string
          start_time?: string | null
          title?: string
          type?: Database["public"]["Enums"]["schedule_type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_invoices: {
        Row: {
          buyer_address: string | null
          buyer_business_number: string | null
          buyer_email: string | null
          buyer_name: string
          buyer_phone: string | null
          confirmed_at: string | null
          created_at: string | null
          id: string
          invoice_number: string
          issue_date: string
          items: Json
          payment_id: string | null
          pdf_url: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["tax_invoice_status"] | null
          supplier_address: string
          supplier_business_number: string
          supplier_email: string | null
          supplier_name: string
          supplier_phone: string | null
          supply_amount: number
          supply_date: string
          tax_amount: number
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          buyer_address?: string | null
          buyer_business_number?: string | null
          buyer_email?: string | null
          buyer_name: string
          buyer_phone?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          invoice_number: string
          issue_date: string
          items?: Json
          payment_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["tax_invoice_status"] | null
          supplier_address: string
          supplier_business_number: string
          supplier_email?: string | null
          supplier_name: string
          supplier_phone?: string | null
          supply_amount?: number
          supply_date: string
          tax_amount?: number
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          buyer_address?: string | null
          buyer_business_number?: string | null
          buyer_email?: string | null
          buyer_name?: string
          buyer_phone?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          items?: Json
          payment_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["tax_invoice_status"] | null
          supplier_address?: string
          supplier_business_number?: string
          supplier_email?: string | null
          supplier_name?: string
          supplier_phone?: string | null
          supply_amount?: number
          supply_date?: string
          tax_amount?: number
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          business_name: string | null
          business_registration_number: string | null
          company_name: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          business_registration_number?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          business_registration_number?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      rls_policies_status: {
        Row: {
          cmd: string | null
          policyname: unknown | null
          qual: string | null
          roles: unknown[] | null
          schemaname: unknown | null
          tablename: unknown | null
          with_check: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_contract_totals: {
        Args: { contract_id: string }
        Returns: undefined
      }
      generate_access_token: {
        Args: { entity_id: string; entity_type: string }
        Returns: string
      }
      log_contract_activity: {
        Args: {
          p_activity_type: string
          p_actor_id?: string
          p_contract_id: string
          p_description: string
          p_metadata?: Json
        }
        Returns: string
      }
      validate_access_token: {
        Args: { entity_id: string; entity_type: string; token: string }
        Returns: boolean
      }
    }
    Enums: {
      contract_status: "draft" | "sent" | "completed"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      quote_status: "draft" | "saved" | "sent" | "approved" | "rejected" | "expired"
      schedule_priority: "low" | "medium" | "high"
      schedule_type: "task" | "meeting" | "deadline" | "presentation" | "launch"
      tax_invoice_status:
        | "draft"
        | "issued"
        | "sent"
        | "confirmed"
        | "cancelled"
      user_role: "freelancer" | "client" | "admin"
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
      contract_status: ["draft", "sent", "completed"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      quote_status: ["draft", "saved", "sent", "approved", "rejected", "expired"],
      schedule_priority: ["low", "medium", "high"],
      schedule_type: ["task", "meeting", "deadline", "presentation", "launch"],
      tax_invoice_status: ["draft", "issued", "sent", "confirmed", "cancelled"],
      user_role: ["freelancer", "client", "admin"],
    },
  },
} as const
