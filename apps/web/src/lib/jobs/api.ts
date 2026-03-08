const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
const API_URL = `${API_BASE_URL}/jobs`;

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'freelance';
export type ExperienceLevel = 'fresher' | 'junior' | 'mid-level' | 'senior' | 'lead';
export type JobStatus = 'active' | 'closed' | 'on-hold';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';

export interface Job {
  _id: string;
  companyId: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  experienceYears: {
    min: number;
    max: number;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  qualifications: string[];
  openings: number;
  status: JobStatus;
  postedBy: string;
  applicationDeadline?: string;
  totalApplications: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  _id: string;
  jobId: Job;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  companyId: {
    _id: string;
    name: string;
    email: string;
  };
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }[];
  companyNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  location?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
  isRemote?: boolean;
  search?: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  experienceYears: {
    min: number;
    max: number;
  };
  salary: {
    min: number;
    max: number;
    currency?: string;
  };
  skills: string[];
  qualifications: string[];
  openings: number;
  applicationDeadline?: string;
}

export interface ApplyJobInput {
  coverLetter?: string;
  resumeUrl?: string;
}

export async function getJobs(filters?: JobFilters): Promise<Job[]> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.location) params.append('location', filters.location);
    if (filters.jobType) params.append('jobType', filters.jobType);
    if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
    if (filters.minSalary) params.append('minSalary', filters.minSalary.toString());
    if (filters.maxSalary) params.append('maxSalary', filters.maxSalary.toString());
    if (filters.skills) params.append('skills', filters.skills.join(','));
    if (filters.isRemote !== undefined) params.append('isRemote', filters.isRemote.toString());
    if (filters.search) params.append('search', filters.search);
  }

  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  const data = await response.json();
  return data.jobs;
}

export async function getJobById(jobId: string): Promise<Job> {
  const response = await fetch(`${API_URL}/${jobId}`);
  if (!response.ok) {
    throw new Error('Job not found');
  }
  const data = await response.json();
  return data.job;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const response = await fetch(`${API_URL}/company/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create job');
  }
  const data = await response.json();
  return data.job;
}

export async function getCompanyJobs(): Promise<Job[]> {
  const response = await fetch(`${API_URL}/company/my-jobs`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  const data = await response.json();
  return data.jobs;
}

export async function updateJob(jobId: string, input: Partial<CreateJobInput>): Promise<Job> {
  const response = await fetch(`${API_URL}/company/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update job');
  }
  const data = await response.json();
  return data.job;
}

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  const response = await fetch(`${API_URL}/company/${jobId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update job status');
  }
  const data = await response.json();
  return data.job;
}

export async function deleteJob(jobId: string): Promise<void> {
  const response = await fetch(`${API_URL}/company/${jobId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to delete job');
  }
}

export async function applyForJob(jobId: string, input: ApplyJobInput): Promise<JobApplication> {
  const response = await fetch(`${API_URL}/${jobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to apply for job');
  }
  const data = await response.json();
  return data.application;
}

export async function getStudentApplications(): Promise<JobApplication[]> {
  const response = await fetch(`${API_URL}/applications/my-applications`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  const data = await response.json();
  return data.applications;
}

export async function getCompanyApplications(): Promise<JobApplication[]> {
  const response = await fetch(`${API_URL}/company/applications/all`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  const data = await response.json();
  return data.applications;
}

export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  const response = await fetch(`${API_URL}/company/${jobId}/applications`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  const data = await response.json();
  return data.applications;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note?: string
): Promise<JobApplication> {
  const response = await fetch(`${API_URL}/company/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status, note }),
  });
  if (!response.ok) {
    throw new Error('Failed to update application status');
  }
  const data = await response.json();
  return data.application;
}
