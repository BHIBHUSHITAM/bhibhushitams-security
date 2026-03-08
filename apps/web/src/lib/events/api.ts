const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_URL = `${API_BASE_URL}/events`;

// Types
export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: 'workshop' | 'hackathon' | 'bootcamp' | 'webinar';
  mode: 'online' | 'offline' | 'hybrid';
  startDate: string;
  endDate: string;
  duration: string;
  venue?: string;
  meetingLink?: string;
  maxParticipants: number;
  registrationStartDate: string;
  registrationEndDate: string;
  registrationFee: number;
  agenda: string[];
  topics: string[];
  prerequisites: string[];
  benefits: string[];
  instructors: {
    name: string;
    designation: string;
    bio?: string;
  }[];
  bannerUrl?: string;
  isPublished: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: any;
  totalRegistrations: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  _id: string;
  eventId: Event | string;
  studentId: any;
  registrationDate: string;
  status: 'registered' | 'attended' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentAmount: number;
  paymentId?: string;
  notes?: string;
  attendanceMarked: boolean;
  attendanceDate?: string;
  certificateIssued: boolean;
  certificateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  type?: 'workshop' | 'hackathon' | 'bootcamp' | 'webinar';
  mode?: 'online' | 'offline' | 'hybrid';
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDateFrom?: string;
  startDateTo?: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  type: 'workshop' | 'hackathon' | 'bootcamp' | 'webinar';
  mode: 'online' | 'offline' | 'hybrid';
  startDate: string;
  endDate: string;
  duration: string;
  venue?: string;
  meetingLink?: string;
  maxParticipants: number;
  registrationStartDate: string;
  registrationEndDate: string;
  registrationFee?: number;
  agenda: string[];
  topics: string[];
  prerequisites: string[];
  benefits: string[];
  instructors: {
    name: string;
    designation: string;
    bio?: string;
  }[];
  bannerUrl?: string;
}

// Public API
export const getEvents = async (filters?: EventFilters) => {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.mode) params.append('mode', filters.mode);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
  if (filters?.startDateTo) params.append('startDateTo', filters.startDateTo);

  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export const getEventById = async (eventId: string) => {
  const response = await fetch(`${API_URL}/${eventId}`);
  if (!response.ok) {
    throw new Error('Event not found');
  }
  return response.json();
};

export const getEventBySlug = async (slug: string) => {
  const response = await fetch(`${API_URL}/slug/${slug}`);
  if (!response.ok) {
    throw new Error('Event not found');
  }
  return response.json();
};

// Student API
export const registerForEvent = async (eventId: string, notes?: string) => {
  const response = await fetch(
    `${API_URL}/${eventId}/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ notes }),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to register');
  }
  return response.json();
};

export const cancelRegistration = async (registrationId: string) => {
  const response = await fetch(
    `${API_URL}/registrations/${registrationId}/cancel`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel registration');
  }
  return response.json();
};

export const getStudentRegistrations = async () => {
  const response = await fetch(
    `${API_URL}/registrations/my-registrations`,
    {
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch registrations');
  }
  return response.json();
};

// Admin API
export const createEvent = async (event: CreateEventInput) => {
  const response = await fetch(
    `${API_URL}/admin/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(event),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create event');
  }
  return response.json();
};

export const updateEvent = async (eventId: string, updates: Partial<CreateEventInput>) => {
  const response = await fetch(
    `${API_URL}/admin/${eventId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event');
  }
  return response.json();
};

export const deleteEvent = async (eventId: string) => {
  const response = await fetch(
    `${API_URL}/admin/${eventId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete event');
  }
  return response.json();
};

export const getAdminEvents = async () => {
  const response = await fetch(
    `${API_URL}/admin/my-events`,
    {
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export const getEventRegistrations = async (eventId: string) => {
  const response = await fetch(
    `${API_URL}/admin/${eventId}/registrations`,
    {
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch registrations');
  }
  return response.json();
};

export const markAttendance = async (registrationId: string, attended: boolean) => {
  const response = await fetch(
    `${API_URL}/admin/registrations/${registrationId}/attendance`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ attended }),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark attendance');
  }
  return response.json();
};
