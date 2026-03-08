import type {
  ApplicationStatus,
  Internship,
  InternshipApplication,
  InternshipMode,
  InternshipStatus,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(body.message ?? "Request failed");
  }
  return body;
}

export async function getInternships() {
  const response = await fetch(`${API_BASE_URL}/internships`, {
    method: "GET",
    credentials: "include",
  });

  return parseJson<{ internships: Internship[] }>(response);
}

export async function applyToInternship(payload: {
  internshipId: string;
  resumeUrl: string;
  coverLetter?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/internships/${payload.internshipId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      resumeUrl: payload.resumeUrl,
      coverLetter: payload.coverLetter,
    }),
  });

  return parseJson<{ application: InternshipApplication }>(response);
}

export async function getStudentInternshipApplications() {
  const response = await fetch(`${API_BASE_URL}/internships/student/applications`, {
    method: "GET",
    credentials: "include",
  });

  return parseJson<{ applications: InternshipApplication[] }>(response);
}

export async function createInternship(payload: {
  title: string;
  companyName: string;
  location: string;
  mode: InternshipMode;
  stipend: string;
  durationWeeks: number;
  skills: string[];
  description: string;
  status?: InternshipStatus;
}) {
  const response = await fetch(`${API_BASE_URL}/internships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseJson<{ internship: Internship }>(response);
}

export async function getAdminInternships() {
  const response = await fetch(`${API_BASE_URL}/internships/admin/listings`, {
    method: "GET",
    credentials: "include",
  });

  return parseJson<{ internships: Internship[] }>(response);
}

export async function getInternshipApplicants(internshipId: string) {
  const response = await fetch(`${API_BASE_URL}/internships/${internshipId}/applicants`, {
    method: "GET",
    credentials: "include",
  });

  return parseJson<{ applicants: InternshipApplication[] }>(response);
}

export async function updateInternshipApplicationStatus(payload: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const response = await fetch(
    `${API_BASE_URL}/internships/applications/${payload.applicationId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: payload.status }),
    }
  );

  return parseJson<{ application: InternshipApplication }>(response);
}
