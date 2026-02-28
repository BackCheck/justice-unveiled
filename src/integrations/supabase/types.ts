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
      appeal_summaries: {
        Row: {
          ai_generated: boolean | null
          case_id: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_finalized: boolean | null
          reviewed_by: string | null
          sources_json: Json | null
          summary_type: string
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          case_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_finalized?: boolean | null
          reviewed_by?: string | null
          sources_json?: Json | null
          summary_type: string
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          case_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_finalized?: boolean | null
          reviewed_by?: string | null
          sources_json?: Json | null
          summary_type?: string
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appeal_summaries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      artifact_forensics: {
        Row: {
          analyst_findings: string | null
          analyzed_by: string | null
          camera_model: string | null
          case_id: string | null
          created_at: string
          creation_date: string | null
          evidence_upload_id: string | null
          exif_data: Json | null
          file_hash_md5: string | null
          file_hash_sha1: string | null
          file_hash_sha256: string | null
          forensic_notes: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          metadata_raw: Json | null
          modification_date: string | null
          software_used: string | null
          timezone_anomaly: boolean | null
        }
        Insert: {
          analyst_findings?: string | null
          analyzed_by?: string | null
          camera_model?: string | null
          case_id?: string | null
          created_at?: string
          creation_date?: string | null
          evidence_upload_id?: string | null
          exif_data?: Json | null
          file_hash_md5?: string | null
          file_hash_sha1?: string | null
          file_hash_sha256?: string | null
          forensic_notes?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          metadata_raw?: Json | null
          modification_date?: string | null
          software_used?: string | null
          timezone_anomaly?: boolean | null
        }
        Update: {
          analyst_findings?: string | null
          analyzed_by?: string | null
          camera_model?: string | null
          case_id?: string | null
          created_at?: string
          creation_date?: string | null
          evidence_upload_id?: string | null
          exif_data?: Json | null
          file_hash_md5?: string | null
          file_hash_sha1?: string | null
          file_hash_sha256?: string | null
          forensic_notes?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          metadata_raw?: Json | null
          modification_date?: string | null
          software_used?: string | null
          timezone_anomaly?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "artifact_forensics_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_forensics_evidence_upload_id_fkey"
            columns: ["evidence_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
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
      blog_posts: {
        Row: {
          ai_scheduled_at: string | null
          author_avatar_url: string | null
          author_name: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_ai_generated: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          post_type: string
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          ai_scheduled_at?: string | null
          author_avatar_url?: string | null
          author_name?: string | null
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          post_type?: string
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          ai_scheduled_at?: string | null
          author_avatar_url?: string | null
          author_name?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          post_type?: string
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      case_doctrine_links: {
        Row: {
          application_notes: string | null
          case_id: string | null
          created_at: string
          doctrine_id: string | null
          id: string
          linked_by: string | null
          supporting_evidence: string[] | null
        }
        Insert: {
          application_notes?: string | null
          case_id?: string | null
          created_at?: string
          doctrine_id?: string | null
          id?: string
          linked_by?: string | null
          supporting_evidence?: string[] | null
        }
        Update: {
          application_notes?: string | null
          case_id?: string | null
          created_at?: string
          doctrine_id?: string | null
          id?: string
          linked_by?: string | null
          supporting_evidence?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "case_doctrine_links_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_doctrine_links_doctrine_id_fkey"
            columns: ["doctrine_id"]
            isOneToOne: false
            referencedRelation: "legal_doctrines"
            referencedColumns: ["id"]
          },
        ]
      }
      case_law_precedents: {
        Row: {
          case_name: string
          citation: string
          court: string
          created_at: string
          id: string
          is_landmark: boolean | null
          jurisdiction: string
          key_principles: string[] | null
          notes: string | null
          related_statutes: string[] | null
          source_url: string | null
          summary: string | null
          updated_at: string | null
          updated_by: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          year: number | null
        }
        Insert: {
          case_name: string
          citation: string
          court: string
          created_at?: string
          id?: string
          is_landmark?: boolean | null
          jurisdiction: string
          key_principles?: string[] | null
          notes?: string | null
          related_statutes?: string[] | null
          source_url?: string | null
          summary?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          year?: number | null
        }
        Update: {
          case_name?: string
          citation?: string
          court?: string
          created_at?: string
          id?: string
          is_landmark?: boolean | null
          jurisdiction?: string
          key_principles?: string[] | null
          notes?: string | null
          related_statutes?: string[] | null
          source_url?: string | null
          summary?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          year?: number | null
        }
        Relationships: []
      }
      case_precedent_links: {
        Row: {
          application_notes: string | null
          case_id: string | null
          created_at: string
          id: string
          linked_by: string | null
          precedent_id: string | null
        }
        Insert: {
          application_notes?: string | null
          case_id?: string | null
          created_at?: string
          id?: string
          linked_by?: string | null
          precedent_id?: string | null
        }
        Update: {
          application_notes?: string | null
          case_id?: string | null
          created_at?: string
          id?: string
          linked_by?: string | null
          precedent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_precedent_links_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_precedent_links_precedent_id_fkey"
            columns: ["precedent_id"]
            isOneToOne: false
            referencedRelation: "case_law_precedents"
            referencedColumns: ["id"]
          },
        ]
      }
      case_statute_links: {
        Row: {
          case_id: string | null
          created_at: string
          id: string
          linked_by: string | null
          relevance_notes: string | null
          statute_id: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: string
          linked_by?: string | null
          relevance_notes?: string | null
          statute_id?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: string
          linked_by?: string | null
          relevance_notes?: string | null
          statute_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_statute_links_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_statute_links_statute_id_fkey"
            columns: ["statute_id"]
            isOneToOne: false
            referencedRelation: "legal_statutes"
            referencedColumns: ["id"]
          },
        ]
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
          is_featured: boolean | null
          lead_investigator: string | null
          location: string | null
          report_downloads: number
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
          is_featured?: boolean | null
          lead_investigator?: string | null
          location?: string | null
          report_downloads?: number
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
          is_featured?: boolean | null
          lead_investigator?: string | null
          location?: string | null
          report_downloads?: number
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
      changelog_entries: {
        Row: {
          category: string
          changes: Json
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          release_date: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          category?: string
          changes?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          release_date?: string
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          category?: string
          changes?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          release_date?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      claim_evidence_links: {
        Row: {
          claim_id: string
          created_at: string
          evidence_upload_id: string | null
          exhibit_number: string | null
          extracted_event_id: string | null
          id: string
          link_type: string
          linked_by: string | null
          notes: string | null
          relevance_score: number | null
        }
        Insert: {
          claim_id: string
          created_at?: string
          evidence_upload_id?: string | null
          exhibit_number?: string | null
          extracted_event_id?: string | null
          id?: string
          link_type: string
          linked_by?: string | null
          notes?: string | null
          relevance_score?: number | null
        }
        Update: {
          claim_id?: string
          created_at?: string
          evidence_upload_id?: string | null
          exhibit_number?: string | null
          extracted_event_id?: string | null
          id?: string
          link_type?: string
          linked_by?: string | null
          notes?: string | null
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_evidence_links_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "legal_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_links_evidence_upload_id_fkey"
            columns: ["evidence_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_links_extracted_event_id_fkey"
            columns: ["extracted_event_id"]
            isOneToOne: false
            referencedRelation: "extracted_events"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          actual_action: string | null
          ai_confidence: number | null
          ai_detected: boolean | null
          case_id: string | null
          checked_at: string | null
          checked_by: string | null
          created_at: string
          expected_action: string | null
          id: string
          manual_override: boolean | null
          notes: string | null
          requirement_id: string
          status: string
          supporting_event_id: string | null
          supporting_evidence_id: string | null
          updated_at: string
          violation_details: string | null
        }
        Insert: {
          actual_action?: string | null
          ai_confidence?: number | null
          ai_detected?: boolean | null
          case_id?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          expected_action?: string | null
          id?: string
          manual_override?: boolean | null
          notes?: string | null
          requirement_id: string
          status?: string
          supporting_event_id?: string | null
          supporting_evidence_id?: string | null
          updated_at?: string
          violation_details?: string | null
        }
        Update: {
          actual_action?: string | null
          ai_confidence?: number | null
          ai_detected?: boolean | null
          case_id?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          expected_action?: string | null
          id?: string
          manual_override?: boolean | null
          notes?: string | null
          requirement_id?: string
          status?: string
          supporting_event_id?: string | null
          supporting_evidence_id?: string | null
          updated_at?: string
          violation_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checks_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "procedural_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checks_supporting_event_id_fkey"
            columns: ["supporting_event_id"]
            isOneToOne: false
            referencedRelation: "extracted_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checks_supporting_evidence_id_fkey"
            columns: ["supporting_evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_violations: {
        Row: {
          case_id: string | null
          compliance_check_id: string | null
          description: string
          flagged_at: string
          flagged_by: string | null
          id: string
          legal_consequence: string | null
          remediation_possible: boolean | null
          resolution_notes: string | null
          resolved: boolean | null
          severity: string
          title: string
          violation_type: string
        }
        Insert: {
          case_id?: string | null
          compliance_check_id?: string | null
          description: string
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          legal_consequence?: string | null
          remediation_possible?: boolean | null
          resolution_notes?: string | null
          resolved?: boolean | null
          severity?: string
          title: string
          violation_type: string
        }
        Update: {
          case_id?: string | null
          compliance_check_id?: string | null
          description?: string
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          legal_consequence?: string | null
          remediation_possible?: boolean | null
          resolution_notes?: string | null
          resolved?: boolean | null
          severity?: string
          title?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_violations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_compliance_check_id_fkey"
            columns: ["compliance_check_id"]
            isOneToOne: false
            referencedRelation: "compliance_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      dark_web_artifacts: {
        Row: {
          ai_analysis: Json | null
          analyzed_by: string | null
          artifact_type: string
          case_id: string | null
          content_text: string | null
          created_at: string
          crypto_addresses: Json | null
          extracted_entities: Json | null
          id: string
          onion_urls: Json | null
          source_description: string | null
          threat_level: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          analyzed_by?: string | null
          artifact_type: string
          case_id?: string | null
          content_text?: string | null
          created_at?: string
          crypto_addresses?: Json | null
          extracted_entities?: Json | null
          id?: string
          onion_urls?: Json | null
          source_description?: string | null
          threat_level?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          analyzed_by?: string | null
          artifact_type?: string
          case_id?: string | null
          content_text?: string | null
          created_at?: string
          crypto_addresses?: Json | null
          extracted_entities?: Json | null
          id?: string
          onion_urls?: Json | null
          source_description?: string | null
          threat_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dark_web_artifacts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
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
      evidence_artifacts: {
        Row: {
          artifact_type: string
          artifact_value: string
          case_id: string | null
          confidence: number | null
          context_snippet: string | null
          created_at: string
          evidence_upload_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          artifact_type: string
          artifact_value: string
          case_id?: string | null
          confidence?: number | null
          context_snippet?: string | null
          created_at?: string
          evidence_upload_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          artifact_type?: string
          artifact_value?: string
          case_id?: string | null
          confidence?: number | null
          context_snippet?: string | null
          created_at?: string
          evidence_upload_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_artifacts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_artifacts_evidence_upload_id_fkey"
            columns: ["evidence_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_requirements: {
        Row: {
          created_at: string
          evidence_type: string | null
          id: string
          is_mandatory: boolean | null
          legal_framework: string
          legal_section: string
          requirement_description: string | null
          requirement_name: string
          statutory_reference: string | null
        }
        Insert: {
          created_at?: string
          evidence_type?: string | null
          id?: string
          is_mandatory?: boolean | null
          legal_framework: string
          legal_section: string
          requirement_description?: string | null
          requirement_name: string
          statutory_reference?: string | null
        }
        Update: {
          created_at?: string
          evidence_type?: string | null
          id?: string
          is_mandatory?: boolean | null
          legal_framework?: string
          legal_section?: string
          requirement_description?: string | null
          requirement_name?: string
          statutory_reference?: string | null
        }
        Relationships: []
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
          is_hidden: boolean | null
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
          is_hidden?: boolean | null
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
          is_hidden?: boolean | null
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
      financial_affidavits: {
        Row: {
          affidavit_date: string | null
          case_id: string | null
          created_at: string
          description: string | null
          document_type: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          incident_id: string | null
          loss_id: string | null
          notarized: boolean | null
          public_url: string
          storage_path: string
          sworn_before: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          affidavit_date?: string | null
          case_id?: string | null
          created_at?: string
          description?: string | null
          document_type: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          incident_id?: string | null
          loss_id?: string | null
          notarized?: boolean | null
          public_url: string
          storage_path: string
          sworn_before?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          affidavit_date?: string | null
          case_id?: string | null
          created_at?: string
          description?: string | null
          document_type?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          incident_id?: string | null
          loss_id?: string | null
          notarized?: boolean | null
          public_url?: string
          storage_path?: string
          sworn_before?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_affidavits_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_affidavits_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "regulatory_harm_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_affidavits_loss_id_fkey"
            columns: ["loss_id"]
            isOneToOne: false
            referencedRelation: "financial_losses"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_losses: {
        Row: {
          amount: number
          case_id: string | null
          created_at: string
          currency: string | null
          description: string
          end_date: string | null
          hourly_rate: number | null
          id: string
          incident_id: string
          is_documented: boolean | null
          is_estimated: boolean | null
          is_recurring: boolean | null
          loss_category: string
          loss_subcategory: string | null
          recurring_frequency: string | null
          start_date: string | null
          time_spent_hours: number | null
          updated_at: string
        }
        Insert: {
          amount?: number
          case_id?: string | null
          created_at?: string
          currency?: string | null
          description: string
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          incident_id: string
          is_documented?: boolean | null
          is_estimated?: boolean | null
          is_recurring?: boolean | null
          loss_category: string
          loss_subcategory?: string | null
          recurring_frequency?: string | null
          start_date?: string | null
          time_spent_hours?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          incident_id?: string
          is_documented?: boolean | null
          is_estimated?: boolean | null
          is_recurring?: boolean | null
          loss_category?: string
          loss_subcategory?: string | null
          recurring_frequency?: string | null
          start_date?: string | null
          time_spent_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_losses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_losses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "regulatory_harm_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          annexures_count: number | null
          case_id: string | null
          created_at: string
          description: string | null
          generated_by: string | null
          id: string
          metadata: Json | null
          report_type: string
          sections_count: number | null
          template: string | null
          title: string
        }
        Insert: {
          annexures_count?: number | null
          case_id?: string | null
          created_at?: string
          description?: string | null
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          sections_count?: number | null
          template?: string | null
          title: string
        }
        Update: {
          annexures_count?: number | null
          case_id?: string | null
          created_at?: string
          description?: string | null
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          sections_count?: number | null
          template?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      harm_time_tracking: {
        Row: {
          activity_type: string
          case_id: string | null
          created_at: string
          date: string
          description: string | null
          hourly_rate: number | null
          hours_spent: number
          id: string
          incident_id: string | null
          person_name: string | null
          person_role: string | null
          total_cost: number | null
        }
        Insert: {
          activity_type: string
          case_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          hourly_rate?: number | null
          hours_spent?: number
          id?: string
          incident_id?: string | null
          person_name?: string | null
          person_role?: string | null
          total_cost?: number | null
        }
        Update: {
          activity_type?: string
          case_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          hourly_rate?: number | null
          hours_spent?: number
          id?: string
          incident_id?: string | null
          person_name?: string | null
          person_role?: string | null
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "harm_time_tracking_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harm_time_tracking_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "regulatory_harm_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      hidden_static_events: {
        Row: {
          event_key: string
          hidden_at: string
          hidden_by: string | null
          id: string
          reason: string | null
        }
        Insert: {
          event_key: string
          hidden_at?: string
          hidden_by?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          event_key?: string
          hidden_at?: string
          hidden_by?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      legal_claims: {
        Row: {
          allegation_text: string
          alleged_against: string | null
          alleged_by: string | null
          case_id: string | null
          claim_type: string
          created_at: string
          date_alleged: string | null
          id: string
          legal_framework: string
          legal_section: string
          source_document: string | null
          source_upload_id: string | null
          status: string | null
          support_score: number | null
          updated_at: string
        }
        Insert: {
          allegation_text: string
          alleged_against?: string | null
          alleged_by?: string | null
          case_id?: string | null
          claim_type: string
          created_at?: string
          date_alleged?: string | null
          id?: string
          legal_framework: string
          legal_section: string
          source_document?: string | null
          source_upload_id?: string | null
          status?: string | null
          support_score?: number | null
          updated_at?: string
        }
        Update: {
          allegation_text?: string
          alleged_against?: string | null
          alleged_by?: string | null
          case_id?: string | null
          claim_type?: string
          created_at?: string
          date_alleged?: string | null
          id?: string
          legal_framework?: string
          legal_section?: string
          source_document?: string | null
          source_upload_id?: string | null
          status?: string | null
          support_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_claims_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_claims_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_doctrines: {
        Row: {
          application_context: string | null
          created_at: string
          description: string
          doctrine_name: string
          example_cases: string[] | null
          id: string
          latin_name: string | null
          related_statutes: string[] | null
        }
        Insert: {
          application_context?: string | null
          created_at?: string
          description: string
          doctrine_name: string
          example_cases?: string[] | null
          id?: string
          latin_name?: string | null
          related_statutes?: string[] | null
        }
        Update: {
          application_context?: string | null
          created_at?: string
          description?: string
          doctrine_name?: string
          example_cases?: string[] | null
          id?: string
          latin_name?: string | null
          related_statutes?: string[] | null
        }
        Relationships: []
      }
      legal_issues: {
        Row: {
          ai_generated: boolean | null
          case_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_resolved: boolean | null
          issue_description: string | null
          issue_title: string
          issue_type: string
          related_doctrine_ids: string[] | null
          related_precedent_ids: string[] | null
          related_statute_ids: string[] | null
          resolution_notes: string | null
          severity: string | null
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_resolved?: boolean | null
          issue_description?: string | null
          issue_title: string
          issue_type: string
          related_doctrine_ids?: string[] | null
          related_precedent_ids?: string[] | null
          related_statute_ids?: string[] | null
          resolution_notes?: string | null
          severity?: string | null
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_resolved?: boolean | null
          issue_description?: string | null
          issue_title?: string
          issue_type?: string
          related_doctrine_ids?: string[] | null
          related_precedent_ids?: string[] | null
          related_statute_ids?: string[] | null
          resolution_notes?: string | null
          severity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_issues_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_statutes: {
        Row: {
          created_at: string
          framework: string
          full_text: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          section: string | null
          statute_code: string
          statute_name: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          framework: string
          full_text?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          section?: string | null
          statute_code: string
          statute_name: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          framework?: string
          full_text?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          section?: string | null
          statute_code?: string
          statute_name?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string
          description: string | null
          external_id: string | null
          fetched_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_relevant: boolean | null
          keywords: string[] | null
          published_at: string | null
          sentiment: string | null
          source_id: string | null
          source_name: string | null
          title: string
          url: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_relevant?: boolean | null
          keywords?: string[] | null
          published_at?: string | null
          sentiment?: string | null
          source_id?: string | null
          source_name?: string | null
          title: string
          url: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_relevant?: boolean | null
          keywords?: string[] | null
          published_at?: string | null
          sentiment?: string | null
          source_id?: string | null
          source_name?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          case_id: string | null
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      osint_searches: {
        Row: {
          case_id: string | null
          created_at: string
          created_by: string | null
          entity_id: string | null
          findings_summary: string | null
          id: string
          query: string
          results: Json | null
          search_type: string
          source_platform: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          findings_summary?: string | null
          id?: string
          query: string
          results?: Json | null
          search_type: string
          source_platform?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          findings_summary?: string | null
          id?: string
          query?: string
          results?: Json | null
          search_type?: string
          source_platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "osint_searches_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      precedent_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          precedent_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          precedent_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          precedent_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "precedent_comments_precedent_id_fkey"
            columns: ["precedent_id"]
            isOneToOne: false
            referencedRelation: "case_law_precedents"
            referencedColumns: ["id"]
          },
        ]
      }
      procedural_requirements: {
        Row: {
          created_at: string
          id: string
          is_mandatory: boolean | null
          legal_framework: string
          legal_reference: string
          requirement_category: string
          requirement_description: string | null
          requirement_name: string
          severity_if_violated: string | null
          statutory_timeline: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          legal_framework: string
          legal_reference: string
          requirement_category: string
          requirement_description?: string | null
          requirement_name: string
          severity_if_violated?: string | null
          statutory_timeline?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          legal_framework?: string
          legal_reference?: string
          requirement_category?: string
          requirement_description?: string | null
          requirement_name?: string
          severity_if_violated?: string | null
          statutory_timeline?: string | null
        }
        Relationships: []
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
      regulatory_harm_incidents: {
        Row: {
          case_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          incident_date: string
          incident_subtype: string | null
          incident_type: string
          institution_name: string | null
          institution_type: string | null
          linked_event_id: string | null
          reference_number: string | null
          resolution_date: string | null
          severity: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incident_date: string
          incident_subtype?: string | null
          incident_type: string
          institution_name?: string | null
          institution_type?: string | null
          linked_event_id?: string | null
          reference_number?: string | null
          resolution_date?: string | null
          severity?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incident_date?: string
          incident_subtype?: string | null
          incident_type?: string
          institution_name?: string | null
          institution_type?: string | null
          linked_event_id?: string | null
          reference_number?: string | null
          resolution_date?: string | null
          severity?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_harm_incidents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_harm_incidents_linked_event_id_fkey"
            columns: ["linked_event_id"]
            isOneToOne: false
            referencedRelation: "extracted_events"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_fulfillment: {
        Row: {
          claim_id: string
          created_at: string
          evidence_upload_id: string | null
          fulfillment_notes: string | null
          id: string
          is_fulfilled: boolean | null
          requirement_id: string
          verified_by: string | null
        }
        Insert: {
          claim_id: string
          created_at?: string
          evidence_upload_id?: string | null
          fulfillment_notes?: string | null
          id?: string
          is_fulfilled?: boolean | null
          requirement_id: string
          verified_by?: string | null
        }
        Update: {
          claim_id?: string
          created_at?: string
          evidence_upload_id?: string | null
          fulfillment_notes?: string | null
          id?: string
          is_fulfilled?: boolean | null
          requirement_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_fulfillment_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "legal_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_fulfillment_evidence_upload_id_fkey"
            columns: ["evidence_upload_id"]
            isOneToOne: false
            referencedRelation: "evidence_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_fulfillment_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "evidence_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_precedents: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          precedent_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          precedent_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          precedent_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_precedents_precedent_id_fkey"
            columns: ["precedent_id"]
            isOneToOne: false
            referencedRelation: "case_law_precedents"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_content: {
        Row: {
          content_type: string
          created_at: string
          error_message: string | null
          generated_post_id: string | null
          id: string
          keywords: string[] | null
          processed_at: string | null
          scheduled_for: string
          status: string | null
          topic: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          error_message?: string | null
          generated_post_id?: string | null
          id?: string
          keywords?: string[] | null
          processed_at?: string | null
          scheduled_for: string
          status?: string | null
          topic?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          error_message?: string | null
          generated_post_id?: string | null
          id?: string
          keywords?: string[] | null
          processed_at?: string | null
          scheduled_for?: string
          status?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_content_generated_post_id_fkey"
            columns: ["generated_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
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
      web_archives: {
        Row: {
          archived_by: string | null
          archived_content: string | null
          archived_screenshot_url: string | null
          case_id: string | null
          content_hash: string | null
          created_at: string
          entity_id: string | null
          id: string
          is_changed: boolean | null
          scrape_method: string | null
          url: string
          wayback_url: string | null
        }
        Insert: {
          archived_by?: string | null
          archived_content?: string | null
          archived_screenshot_url?: string | null
          case_id?: string | null
          content_hash?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_changed?: boolean | null
          scrape_method?: string | null
          url: string
          wayback_url?: string | null
        }
        Update: {
          archived_by?: string | null
          archived_content?: string | null
          archived_screenshot_url?: string | null
          case_id?: string | null
          content_hash?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_changed?: boolean | null
          scrape_method?: string | null
          url?: string
          wayback_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_archives_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_analysis_history_stats: {
        Args: { p_case_id?: string }
        Returns: {
          total_discrepancies: number
          total_entities: number
          total_events: number
          total_jobs: number
        }[]
      }
      get_platform_stats: { Args: { p_case_id?: string }; Returns: Json }
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
      increment_report_downloads: {
        Args: { _case_id: string }
        Returns: number
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
