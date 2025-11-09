export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          loved_one_id: string
          metadata: Json | null
          occurred_at: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          loved_one_id: string
          metadata?: Json | null
          occurred_at?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          loved_one_id?: string
          metadata?: Json | null
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string
          caregiver_id: string
          created_at: string
          id: string
          is_acknowledged: boolean
          is_read: boolean
          loved_one_id: string
          message: string
          metadata: Json | null
          severity: string
          title: string
          triggered_at: string
        }
        Insert: {
          alert_type: string
          caregiver_id: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          is_read?: boolean
          loved_one_id: string
          message: string
          metadata?: Json | null
          severity: string
          title: string
          triggered_at?: string
        }
        Update: {
          alert_type?: string
          caregiver_id?: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          is_read?: boolean
          loved_one_id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_preferences: {
        Row: {
          alert_threshold_heart_rate_high: number
          alert_threshold_heart_rate_low: number
          alert_threshold_low_battery: number
          caregiver_id: string
          created_at: string
          id: string
          language: string
          notification_email: boolean
          notification_push: boolean
          notification_sms: boolean
          timezone: string
          updated_at: string
        }
        Insert: {
          alert_threshold_heart_rate_high?: number
          alert_threshold_heart_rate_low?: number
          alert_threshold_low_battery?: number
          caregiver_id: string
          created_at?: string
          id?: string
          language?: string
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          timezone?: string
          updated_at?: string
        }
        Update: {
          alert_threshold_heart_rate_high?: number
          alert_threshold_heart_rate_low?: number
          alert_threshold_low_battery?: number
          caregiver_id?: string
          created_at?: string
          id?: string
          language?: string
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_preferences_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: true
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          caregiver_id: string
          created_at: string
          id: string
          is_read: boolean
          loved_one_id: string
          message_text: string
          sender_type: string
          sent_at: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          loved_one_id: string
          message_text: string
          sender_type: string
          sent_at?: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          loved_one_id?: string
          message_text?: string
          sender_type?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          caregiver_id: string
          contact_name: string
          created_at: string
          id: string
          phone_number: string
          priority: number
          relationship: string | null
          updated_at: string
        }
        Insert: {
          caregiver_id: string
          contact_name: string
          created_at?: string
          id?: string
          phone_number: string
          priority?: number
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          caregiver_id?: string
          contact_name?: string
          created_at?: string
          id?: string
          phone_number?: string
          priority?: number
          relationship?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_locations: {
        Row: {
          accuracy: number | null
          altitude: number | null
          battery_level: number | null
          created_at: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          loved_one_id: string
          recorded_at: string
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          loved_one_id: string
          recorded_at?: string
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          loved_one_id?: string
          recorded_at?: string
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gps_locations_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      health_metrics: {
        Row: {
          calories_burned: number | null
          created_at: string
          heart_rate: number | null
          id: string
          loved_one_id: string
          recorded_at: string
          sleep_hours: number | null
          steps: number | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          loved_one_id: string
          recorded_at?: string
          sleep_hours?: number | null
          steps?: number | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          heart_rate?: number | null
          id?: string
          loved_one_id?: string
          recorded_at?: string
          sleep_hours?: number | null
          steps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      location_shares: {
        Row: {
          caregiver_id: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          loved_one_id: string
          recipient_name: string | null
          recipient_phone: string | null
          share_token: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          loved_one_id: string
          recipient_name?: string | null
          recipient_phone?: string | null
          share_token: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          loved_one_id?: string
          recipient_name?: string | null
          recipient_phone?: string | null
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_shares_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_shares_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
      }
      loved_ones: {
        Row: {
          caregiver_id: string
          created_at: string
          date_of_birth: string | null
          device_id: string
          emergency_notes: string | null
          full_name: string
          id: string
          medical_conditions: string | null
          profile_picture_url: string | null
          updated_at: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          date_of_birth?: string | null
          device_id: string
          emergency_notes?: string | null
          full_name: string
          id?: string
          medical_conditions?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          date_of_birth?: string | null
          device_id?: string
          emergency_notes?: string | null
          full_name?: string
          id?: string
          medical_conditions?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loved_ones_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_zones: {
        Row: {
          caregiver_id: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          loved_one_id: string
          name: string
          radius: number
          updated_at: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          loved_one_id: string
          name: string
          radius: number
          updated_at?: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          loved_one_id?: string
          name?: string
          radius?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safe_zones_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safe_zones_loved_one_id_fkey"
            columns: ["loved_one_id"]
            isOneToOne: false
            referencedRelation: "loved_ones"
            referencedColumns: ["id"]
          },
        ]
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
