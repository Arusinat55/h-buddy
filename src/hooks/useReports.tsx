import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GrievanceReport {
  id: string;
  user_id: string;
  title: string;
  complaint_category: string;
  subcategory: string | null;
  description: string;
  location: string;
  evidence_files: string[] | null;
  priority_level: string | null;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SuspiciousReport {
  id: string;
  user_id: string;
  entity_type: string;
  entity_value: string;
  description: string;
  evidence_files: string[] | null;
  threat_level: string | null;
  status: 'reported' | 'investigating' | 'verified' | 'false_positive';
  created_at: string;
  updated_at: string;
}

export const useReports = () => {
  const [grievanceReports, setGrievanceReports] = useState<GrievanceReport[]>([]);
  const [suspiciousReports, setSuspiciousReports] = useState<SuspiciousReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGrievanceReports = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('grievance_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setGrievanceReports((data || []) as GrievanceReport[]);
        }
      } catch (err) {
        setError('Failed to fetch grievance reports');
      } finally {
        setLoading(false);
      }
    };

    const fetchSuspiciousReports = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('suspicious_entities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setSuspiciousReports((data || []) as SuspiciousReport[]);
        }
      } catch (err) {
        setError('Failed to fetch suspicious reports');
      }
    };

    fetchGrievanceReports();
    fetchSuspiciousReports();
    // Set up realtime subscription
    const grievanceChannel = supabase
      .channel('grievance-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grievance_reports',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGrievanceReports(prev => [payload.new as GrievanceReport, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGrievanceReports(prev => prev.map(report => 
              report.id === payload.new.id ? payload.new as GrievanceReport : report
            ));
          } else if (payload.eventType === 'DELETE') {
            setGrievanceReports(prev => prev.filter(report => report.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const suspiciousChannel = supabase
      .channel('suspicious-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suspicious_entities',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSuspiciousReports(prev => [payload.new as SuspiciousReport, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSuspiciousReports(prev => prev.map(report => 
              report.id === payload.new.id ? payload.new as SuspiciousReport : report
            ));
          } else if (payload.eventType === 'DELETE') {
            setSuspiciousReports(prev => prev.filter(report => report.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(grievanceChannel);
      supabase.removeChannel(suspiciousChannel);
    };
  }, [user]);

  const createGrievanceReport = async (reportData: Omit<GrievanceReport, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('grievance_reports')
        .insert({
          ...reportData,
          user_id: user.id,
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const createSuspiciousReport = async (reportData: Omit<SuspiciousReport, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('suspicious_entities')
        .insert({
          ...reportData,
          user_id: user.id,
        })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const uploadFile = async (file: File, reportId: string) => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${reportId}/${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('evidence-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('evidence-files')
        .getPublicUrl(fileName);

      return { data: publicUrl, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  return {
    grievanceReports,
    suspiciousReports,
    loading,
    error,
    createGrievanceReport,
    createSuspiciousReport,
    uploadFile
  };
};