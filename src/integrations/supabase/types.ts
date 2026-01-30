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
      document_analysis_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          discrepancies_extracted: number | null
          entities_extracted: number | null
          error_message: string | null
          events_extracted: number | null
          id: string
          started_at: string | null
          status: string
          upload_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          discrepancies_extracted?: number | null
          entities_extracted?: number | null
          error_message?: string | null
          events_extracted?: number | null
          id?: string
          started_at?: string | null
          status?: string
          upload_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          discrepancies_extracted?: number | null
          entities_extracted?: number | null
          error_message?: string | null
          events_extracted?: number | null
          id?: string
          started_at?: string | null
          status?: string
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_analysis_jobs_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_uploads: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          public_url: string
          related_event_ids: number[] | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          public_url: string
          related_event_ids?: number[] | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          public_url?: string
          related_event_ids?: number[] | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      extracted_discrepancies: {
        Row: {
          created_at: string
          description: string
          discrepancy_type: string
          id: string
          legal_reference: string | null
          related_dates: string[] | null
          severity: string
          source_upload_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          discrepancy_type: string
          id?: string
          legal_reference?: string | null
          related_dates?: string[] | null
          severity: string
          source_upload_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          discrepancy_type?: string
          id?: string
          legal_reference?: string | null
          related_dates?: string[] | null
          severity?: string
          source_upload_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "extracted_discrepancies_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_entities: {
        Row: {
          created_at: string
          description: string | null
          entity_type: string
          id: string
          name: string
          related_event_ids: string[] | null
          role: string | null
          source_upload_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_type: string
          id?: string
          name: string
          related_event_ids?: string[] | null
          role?: string | null
          source_upload_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_type?: string
          id?: string
          name?: string
          related_event_ids?: string[] | null
          role?: string | null
          source_upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_entities_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_events: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string
          date: string
          description: string
          evidence_discrepancy: string
          extraction_method: string | null
          id: string
          individuals: string
          is_approved: boolean | null
          legal_action: string
          outcome: string
          source_upload_id: string | null
          sources: string
          updated_at: string
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string
          date: string
          description: string
          evidence_discrepancy: string
          extraction_method?: string | null
          id?: string
          individuals: string
          is_approved?: boolean | null
          legal_action: string
          outcome: string
          source_upload_id?: string | null
          sources: string
          updated_at?: string
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string
          date?: string
          description?: string
          evidence_discrepancy?: string
          extraction_method?: string | null
          id?: string
          individuals?: string
          is_approved?: boolean | null
          legal_action?: string
          outcome?: string
          source_upload_id?: string | null
          sources?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extracted_events_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "analyst"
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
      app_role: ["admin", "editor", "analyst"],
    },
  },
} as const
