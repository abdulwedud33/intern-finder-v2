import { useState, useEffect, useCallback } from 'react';
import { jobService } from '@/services/api';

export const useJobById = (jobId: string) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await jobService.getJobById(jobId);
      setJob(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job';
      setError(errorMessage);
      console.error('Error fetching job:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const refetch = () => {
    fetchJob();
  };

  return { job, loading, error, refetch };
};

export default useJobById;
