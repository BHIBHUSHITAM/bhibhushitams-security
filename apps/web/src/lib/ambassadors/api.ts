const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_URL = `${API_BASE_URL}/ambassadors`;

// Types
export interface StudentInfo {
  _id: string;
  name: string;
  email: string;
}

export interface AmbassadorApplication {
  _id: string;
  studentId: string | StudentInfo;
  email: string;
  college: string;
  department: string;
  batch: string;
  whyAmbassador: string;
  experience: string;
  goals: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  assignedTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ambassador {
  _id: string;
  studentId: any;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  college: string;
  department: string;
  bio: string;
  eventsOrganized: number;
  studentsRecruited: number;
  totalReach: number;
  engagementScore: number;
  approvalDate: string;
  lastActivityDate: string;
  isActive: boolean;
  email: string;
  phone?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };
  certificateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyForAmbassadorInput {
  college: string;
  department: string;
  batch: string;
  whyAmbassador: string;
  experience: string;
  goals: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface AmbassadorStats {
  totalAmbassadors: number;
  activeAmbassadors: number;
  pendingApplications: number;
  totalReach: number;
  averageEngagementScore: number;
  byTier: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

// Public API
export const getActiveAmbassadors = async (filters?: {
  tier?: string;
  college?: string;
  department?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.tier) params.append('tier', filters.tier);
  if (filters?.college) params.append('college', filters.college);
  if (filters?.department) params.append('department', filters.department);

  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ambassadors');
  }
  return response.json();
};

export const getAmbassadorLeaderboard = async (limit: number = 10) => {
  const response = await fetch(
    `${API_URL}/leaderboard?limit=${limit}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
};

export const getAmbassadorProfile = async (studentId: string) => {
  const response = await fetch(`${API_URL}/${studentId}`);
  if (!response.ok) {
    throw new Error('Ambassador not found');
  }
  return response.json();
};

// Student API
export const applyForAmbassador = async (data: ApplyForAmbassadorInput) => {
  const response = await fetch(`${API_URL}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to apply');
  }
  return response.json();
};

export const getMyApplication = async () => {
  const response = await fetch(`${API_URL}/my/application`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch application');
  }
  return response.json();
};

export const getMyProfile = async () => {
  const response = await fetch(`${API_URL}/my/profile`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }
  return response.json();
};

// Admin API
export const getPendingApplications = async () => {
  const response = await fetch(`${API_URL}/admin/applications/pending`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  return response.json();
};

export const reviewApplication = async (
  applicationId: string,
  approved: boolean,
  tier?: string,
  adminNotes?: string,
  rejectionReason?: string
) => {
  const response = await fetch(
    `${API_URL}/admin/applications/${applicationId}/review`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        approved,
        tier,
        adminNotes,
        rejectionReason,
      }),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to review application');
  }
  return response.json();
};

export const updateMetrics = async (
  ambassadorId: string,
  eventsOrganized?: number,
  studentsRecruited?: number,
  totalReach?: number
) => {
  const response = await fetch(
    `${API_URL}/admin/${ambassadorId}/metrics`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        eventsOrganized,
        studentsRecruited,
        totalReach,
      }),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update metrics');
  }
  return response.json();
};

export const deactivateAmbassador = async (ambassadorId: string) => {
  const response = await fetch(
    `${API_URL}/admin/${ambassadorId}/deactivate`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to deactivate ambassador');
  }
  return response.json();
};

export const getAmbassadorStats = async () => {
  const response = await fetch(`${API_URL}/admin/statistics`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return response.json();
};
