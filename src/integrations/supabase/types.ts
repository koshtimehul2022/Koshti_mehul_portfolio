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
      portfolio_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          media_type: string | null
          media_url: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          poster_url: string | null
          project_type: string
          project_url: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          poster_url?: string | null
          project_type?: string
          project_url?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          poster_url?: string | null
          project_type?: string
          project_url?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      resume_entries: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          entry_type: string
          id: string
          institution: string
          location: string | null
          period: string
          start_date: string | null
          end_date: string | null
          title: string
          sort_order: number | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          entry_type: string
          id?: string
          institution?: string
          location?: string | null
          period?: string
          start_date?: string | null
          end_date?: string | null
          title: string
          sort_order?: number | null
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          institution?: string
          location?: string | null
          period?: string
          start_date?: string | null
          end_date?: string | null
          title?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      resume_pdf: {
        Row: {
          file_name: string | null
          file_url: string
          id: string
          uploaded_at: string
        }
        Insert: {
          file_name?: string | null
          file_url: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          email: string | null
          facebook: string | null
          github: string | null
          happy_clients: number
          id: string
          instagram: string | null
          linkedin: string | null
          location: string | null
          owner_name: string
          phone: string | null
          projects_delivered: number
          site_name: string
          updated_at: string
          whatsapp: string | null
          years_accounting: number
          years_development: number
          youtube: string | null
        }
        Insert: {
          email?: string | null
          facebook?: string | null
          github?: string | null
          happy_clients?: number
          id?: string
          instagram?: string | null
          linkedin?: string | null
          location?: string | null
          owner_name?: string
          phone?: string | null
          projects_delivered?: number
          site_name?: string
          updated_at?: string
          whatsapp?: string | null
          years_accounting?: number
          years_development?: number
          youtube?: string | null
        }
        Update: {
          email?: string | null
          facebook?: string | null
          github?: string | null
          happy_clients?: number
          id?: string
          instagram?: string | null
          linkedin?: string | null
          location?: string | null
          owner_name?: string
          phone?: string | null
          projects_delivered?: number
          site_name?: string
          updated_at?: string
          whatsapp?: string | null
          years_accounting?: number
          years_development?: number
          youtube?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          level: number | null
          name: string
          sort_order: number | null
          tags: string[] | null
          title: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level?: number | null
          name: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level?: number | null
          name?: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_site_settings: {
        Row: {
          facebook: string | null
          github: string | null
          happy_clients: number | null
          id: string | null
          instagram: string | null
          linkedin: string | null
          owner_name: string | null
          projects_delivered: number | null
          site_name: string | null
          years_accounting: number | null
          years_development: number | null
          youtube: string | null
        }
        Insert: {
          facebook?: string | null
          github?: string | null
          happy_clients?: number | null
          id?: string | null
          instagram?: string | null
          linkedin?: string | null
          owner_name?: string | null
          projects_delivered?: number | null
          site_name?: string | null
          years_accounting?: number | null
          years_development?: number | null
          youtube?: string | null
        }
        Update: {
          facebook?: string | null
          github?: string | null
          happy_clients?: number | null
          id?: string | null
          instagram?: string | null
          linkedin?: string | null
          owner_name?: string | null
          projects_delivered?: number | null
          site_name?: string | null
          years_accounting?: number | null
          years_development?: number | null
          youtube?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_main_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "main_admin" | "sub_admin"
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
      admin_role: ["main_admin", "sub_admin"],
    },
  },
} as const
