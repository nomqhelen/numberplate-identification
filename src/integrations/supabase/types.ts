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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          license_plate: string
          location: string | null
          message: string
          priority: string
          resolved_at: string | null
          status: string
          toll_station_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          license_plate: string
          location?: string | null
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          toll_station_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          license_plate?: string
          location?: string | null
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          toll_station_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_toll_station_id_fkey"
            columns: ["toll_station_id"]
            isOneToOne: false
            referencedRelation: "toll_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rfid_readers: {
        Row: {
          created_at: string
          firmware_version: string | null
          id: string
          last_heartbeat: string | null
          reader_code: string
          reader_type: string
          status: string
          toll_station_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_heartbeat?: string | null
          reader_code: string
          reader_type: string
          status?: string
          toll_station_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_heartbeat?: string | null
          reader_code?: string
          reader_type?: string
          status?: string
          toll_station_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfid_readers_toll_station_id_fkey"
            columns: ["toll_station_id"]
            isOneToOne: false
            referencedRelation: "toll_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      toll_stations: {
        Row: {
          created_at: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          station_code: string
          station_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          station_code: string
          station_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          station_code?: string
          station_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      toll_transactions: {
        Row: {
          balance_after: number
          balance_before: number
          created_at: string
          id: string
          payment_method: string
          rfid_tag: string
          toll_amount: number
          toll_station_id: string
          transaction_status: string
          transaction_time: string
          transaction_type: string | null
          vehicle_id: string
        }
        Insert: {
          balance_after: number
          balance_before: number
          created_at?: string
          id?: string
          payment_method?: string
          rfid_tag: string
          toll_amount: number
          toll_station_id: string
          transaction_status?: string
          transaction_time?: string
          transaction_type?: string | null
          vehicle_id: string
        }
        Update: {
          balance_after?: number
          balance_before?: number
          created_at?: string
          id?: string
          payment_method?: string
          rfid_tag?: string
          toll_amount?: number
          toll_station_id?: string
          transaction_status?: string
          transaction_time?: string
          transaction_type?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "toll_transactions_toll_station_id_fkey"
            columns: ["toll_station_id"]
            isOneToOne: false
            referencedRelation: "toll_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toll_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          balance: number
          created_at: string
          id: string
          license_plate: string
          owner_id: string | null
          owner_name: string
          registration_date: string
          rfid_tag: string
          status: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          license_plate: string
          owner_id?: string | null
          owner_name: string
          registration_date?: string
          rfid_tag: string
          status?: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          license_plate?: string
          owner_id?: string | null
          owner_name?: string
          registration_date?: string
          rfid_tag?: string
          status?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_transaction_view: {
        Row: {
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          id: string | null
          license_plate: string | null
          owner_id: string | null
          owner_name: string | null
          payment_method: string | null
          rfid_tag: string | null
          station_location: string | null
          station_name: string | null
          toll_amount: number | null
          toll_station_id: string | null
          transaction_status: string | null
          transaction_time: string | null
          transaction_type: string | null
          vehicle_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toll_transactions_toll_station_id_fkey"
            columns: ["toll_station_id"]
            isOneToOne: false
            referencedRelation: "toll_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toll_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "owner"
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
      app_role: ["admin", "owner"],
    },
  },
} as const
