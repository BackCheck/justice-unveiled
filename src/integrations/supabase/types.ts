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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          session_id: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          session_id?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          case_number: string
          category: string | null
          cover_image_url: string | null
          created_at: string
          date_closed: string | null
          date_opened: string | null
          description: string | null
          id: string
          lead_investigator: string | null
          location: string | null
          severity: string | null
          status: string
          title: string
          total_entities: number | null
          total_events: number | null
          total_sources: number | null
          updated_at: string
        }
        Insert: {
          case_number: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          id?: string
          lead_investigator?: string | null
          location?: string | null
          severity?: string | null
          status?: string
          title: string
          total_entities?: number | null
          total_events?: number | null
          total_sources?: number | null
          updated_at?: string
        }
        Update: {
          case_number?: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_closed?: string | null
          date_opened?: string | null
          description?: string | null
          id?: string
          lead_investigator?: string | null
          location?: string | null
          severity?: string | null
          status?: string
          title?: string
          total_entities?: number | null
          total_events?: number | null
          total_sources?: number | null
          updated_at?: string
        }
        Relationships: []
      }
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
      entity_aliases: {
        Row: {
          alias_type: string
          alias_value: string
          created_at: string | null
          entity_id: string
          id: string
          is_primary: boolean | null
          source: string | null
          verified: boolean | null
        }
        Insert: {
          alias_type: string
          alias_value: string
          created_at?: string | null
          entity_id: string
          id?: string
          is_primary?: boolean | null
          source?: string | null
          verified?: boolean | null
        }
        Update: {
          alias_type?: string
          alias_value?: string
          created_at?: string | null
          entity_id?: string
          id?: string
          is_primary?: boolean | null
          source?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      entity_relationships: {
        Row: {
          case_id: string | null
          created_at: string | null
          description: string | null
          evidence_sources: string[] | null
          id: string
          influence_direction: string | null
          influence_weight: number | null
          is_verified: boolean | null
          relationship_end_date: string | null
          relationship_start_date: string | null
          relationship_type: string
          source_entity_id: string
          target_entity_id: string
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          evidence_sources?: string[] | null
          id?: string
          influence_direction?: string | null
          influence_weight?: number | null
          is_verified?: boolean | null
          relationship_end_date?: string | null
          relationship_start_date?: string | null
          relationship_type: string
          source_entity_id: string
          target_entity_id: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          evidence_sources?: string[] | null
          id?: string
          influence_direction?: string | null
          influence_weight?: number | null
          is_verified?: boolean | null
          relationship_end_date?: string | null
          relationship_start_date?: string | null
          relationship_type?: string
          source_entity_id?: string
          target_entity_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_relationships_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_uploads: {
        Row: {
          case_id: string | null
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
          case_id?: string | null
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
          case_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "evidence_uploads_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_discrepancies: {
        Row: {
          case_id: string | null
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
          case_id?: string | null
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
          case_id?: string | null
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
            foreignKeyName: "extracted_discrepancies_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
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
          aliases: Json | null
          case_id: string | null
          category: string | null
          contact_info: Json | null
          created_at: string
          description: string | null
          entity_type: string
          first_seen_date: string | null
          id: string
          influence_score: number | null
          last_seen_date: string | null
          name: string
          organization_affiliation: string | null
          position_title: string | null
          profile_image_url: string | null
          related_event_ids: string[] | null
          role: string | null
          role_tags: string[] | null
          source_upload_id: string | null
        }
        Insert: {
          aliases?: Json | null
          case_id?: string | null
          category?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          entity_type: string
          first_seen_date?: string | null
          id?: string
          influence_score?: number | null
          last_seen_date?: string | null
          name: string
          organization_affiliation?: string | null
          position_title?: string | null
          profile_image_url?: string | null
          related_event_ids?: string[] | null
          role?: string | null
          role_tags?: string[] | null
          source_upload_id?: string | null
        }
        Update: {
          aliases?: Json | null
          case_id?: string | null
          category?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          entity_type?: string
          first_seen_date?: string | null
          id?: string
          influence_score?: number | null
          last_seen_date?: string | null
          name?: string
          organization_affiliation?: string | null
          position_title?: string | null
          profile_image_url?: string | null
          related_event_ids?: string[] | null
          role?: string | null
          role_tags?: string[] | null
          source_upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_entities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
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
          case_id: string | null
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
          case_id?: string | null
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
          case_id?: string | null
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
            foreignKeyName: "extracted_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
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
      watchlist: {
        Row: {
          created_at: string
          id: string
          item_description: string | null
          item_id: string
          item_title: string
          item_type: string
          notes: string | null
          priority: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_description?: string | null
          item_id: string
          item_title: string
          item_type: string
          notes?: string | null
          priority?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_description?: string | null
          item_id?: string
          item_title?: string
          item_type?: string
          notes?: string | null
          priority?: string | null
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
