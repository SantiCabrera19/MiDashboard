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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          last_synced_at: string | null
          reminder_minutes: number | null
          source: string | null
          start_time: string
          synced_with_google: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          reminder_minutes?: number | null
          source?: string | null
          start_time: string
          synced_with_google?: boolean | null
          title: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          reminder_minutes?: number | null
          source?: string | null
          start_time?: string
          synced_with_google?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          google_event_id: string | null
          id: string
          is_synced: boolean | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_event_id?: string | null
          id?: string
          is_synced?: boolean | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_event_id?: string | null
          id?: string
          is_synced?: boolean | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      debts: {
        Row: {
          created_at: string | null
          id: string
          installments_paid: number | null
          installments_total: number | null
          monthly_payment: number | null
          next_due_date: string | null
          notes: string | null
          paid_amount: number | null
          remaining_amount: number | null
          status: string | null
          title: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          installments_paid?: number | null
          installments_total?: number | null
          monthly_payment?: number | null
          next_due_date?: string | null
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string | null
          title: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          installments_paid?: number | null
          installments_total?: number | null
          monthly_payment?: number | null
          next_due_date?: string | null
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_config: {
        Row: {
          account_balance: number | null
          available_credit: number | null
          credit_limit: number | null
          currency: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_balance?: number | null
          available_credit?: number | null
          credit_limit?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_balance?: number | null
          available_credit?: number | null
          credit_limit?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_markdown: boolean | null
          pinned: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_markdown?: boolean | null
          pinned?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_markdown?: boolean | null
          pinned?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      purchase_calculations: {
        Row: {
          calculated_at: string | null
          id: string
          installments: number | null
          interest_rate: number | null
          item_name: string | null
          monthly_payment: number | null
          payment_type: string
          total_price: number
          total_with_interest: number | null
          user_id: string | null
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          installments?: number | null
          interest_rate?: number | null
          item_name?: string | null
          monthly_payment?: number | null
          payment_type: string
          total_price: number
          total_with_interest?: number | null
          user_id?: string | null
        }
        Update: {
          calculated_at?: string | null
          id?: string
          installments?: number | null
          interest_rate?: number | null
          item_name?: string | null
          monthly_payment?: number | null
          payment_type?: string
          total_price?: number
          total_with_interest?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      statement_calculations: {
        Row: {
          calculated_at: string | null
          due_date: string | null
          id: string
          minimum_payment: number
          payment_amount: number
          remaining_balance: number | null
          statement_total: number
          user_id: string | null
        }
        Insert: {
          calculated_at?: string | null
          due_date?: string | null
          id?: string
          minimum_payment: number
          payment_amount: number
          remaining_balance?: number | null
          statement_total: number
          user_id?: string | null
        }
        Update: {
          calculated_at?: string | null
          due_date?: string | null
          id?: string
          minimum_payment?: number
          payment_amount?: number
          remaining_balance?: number | null
          statement_total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string | null
          exchange_rate: number | null
          id: string
          installment_data: Json | null
          is_installment: boolean | null
          original_amount: number | null
          original_currency: string | null
          payment_method: string | null
          tags: string[] | null
          transaction_date: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          exchange_rate?: number | null
          id?: string
          installment_data?: Json | null
          is_installment?: boolean | null
          original_amount?: number | null
          original_currency?: string | null
          payment_method?: string | null
          tags?: string[] | null
          transaction_date?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          exchange_rate?: number | null
          id?: string
          installment_data?: Json | null
          is_installment?: boolean | null
          original_amount?: number | null
          original_currency?: string | null
          payment_method?: string | null
          tags?: string[] | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          notification_prefs: Json | null
          updated_at: string | null
          visible_sections: Json | null
          visible_stat_cards: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          notification_prefs?: Json | null
          updated_at?: string | null
          visible_sections?: Json | null
          visible_stat_cards?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_prefs?: Json | null
          updated_at?: string | null
          visible_sections?: Json | null
          visible_stat_cards?: Json | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      youtube_channels: {
        Row: {
          channel_id: string
          channel_name: string
          channel_thumbnail: string | null
          id: string
          is_hidden: boolean | null
          last_checked_at: string | null
          notify_new: boolean | null
          subscribed_at: string | null
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          channel_id: string
          channel_name: string
          channel_thumbnail?: string | null
          id?: string
          is_hidden?: boolean | null
          last_checked_at?: string | null
          notify_new?: boolean | null
          subscribed_at?: string | null
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string
          channel_name?: string
          channel_thumbnail?: string | null
          id?: string
          is_hidden?: boolean | null
          last_checked_at?: string | null
          notify_new?: boolean | null
          subscribed_at?: string | null
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_id: string | null
          created_at: string | null
          id: string
          is_notified: boolean | null
          is_pinned: boolean | null
          is_watched: boolean | null
          published_at: string
          thumbnail: string | null
          title: string
          video_id: string
          watched_at: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          is_notified?: boolean | null
          is_pinned?: boolean | null
          is_watched?: boolean | null
          published_at: string
          thumbnail?: string | null
          title: string
          video_id: string
          watched_at?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          is_notified?: boolean | null
          is_pinned?: boolean | null
          is_watched?: boolean | null
          published_at?: string
          thumbnail?: string | null
          title?: string
          video_id?: string
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      monthly_summary: {
        Row: {
          month: string | null
          net_balance: number | null
          total_expenses: number | null
          total_income: number | null
          user_id: string | null
        }
        Relationships: []
      }
      upcoming_payments: {
        Row: {
          amount: number | null
          id: string | null
          next_due_date: string | null
          remaining_installments: number | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          id?: string | null
          next_due_date?: string | null
          remaining_installments?: never
          title?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          id?: string | null
          next_due_date?: string | null
          remaining_installments?: never
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
