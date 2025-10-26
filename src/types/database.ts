export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          plan: 'free' | 'premium' | 'enterprise'
          usage_count: number
          max_usage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          plan?: 'free' | 'premium' | 'enterprise'
          usage_count?: number
          max_usage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          plan?: 'free' | 'premium' | 'enterprise'
          usage_count?: number
          max_usage?: number
          created_at?: string
          updated_at?: string
        }
      }
      detections: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          total_ai_rate: number
          risk_level: 'low' | 'medium' | 'high' | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          result_data: any | null
          error_message: string | null
          processing_time: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          total_ai_rate?: number
          risk_level?: 'low' | 'medium' | 'high' | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          result_data?: any | null
          error_message?: string | null
          processing_time?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          total_ai_rate?: number
          risk_level?: 'low' | 'medium' | 'high' | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          result_data?: any | null
          error_message?: string | null
          processing_time?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
      segments: {
        Row: {
          id: string
          detection_id: string
          segment_text: string
          ai_probability: number
          position: number
          is_suspicious: boolean
          adjustment_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          detection_id: string
          segment_text: string
          ai_probability: number
          position: number
          is_suspicious?: boolean
          adjustment_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          detection_id?: string
          segment_text?: string
          ai_probability?: number
          position?: number
          is_suspicious?: boolean
          adjustment_reason?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          detection_id: string
          user_id: string
          report_path: string
          template_type: string
          download_count: number
          generated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          detection_id: string
          user_id: string
          report_path: string
          template_type?: string
          download_count?: number
          generated_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          detection_id?: string
          user_id?: string
          report_path?: string
          template_type?: string
          download_count?: number
          generated_at?: string
          expires_at?: string
        }
      }
    }
  }
}