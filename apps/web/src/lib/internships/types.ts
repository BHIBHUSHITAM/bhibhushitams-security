export type InternshipMode = "remote" | "hybrid" | "onsite";
export type InternshipStatus = "open" | "closed";
export type ApplicationStatus =
  | "applied"
  | "under-review"
  | "shortlisted"
  | "rejected"
  | "selected";

export interface Internship {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  mode: InternshipMode;
  stipend: string;
  durationWeeks: number;
  skills: string[];
  description: string;
  status: InternshipStatus;
  createdAt: string;
}

export interface InternshipApplication {
  _id: string;
  internshipId:
    | string
    | {
        _id: string;
        title: string;
        companyName: string;
        location: string;
        mode: InternshipMode;
        stipend: string;
        durationWeeks: number;
      };
  studentId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  resumeUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  createdAt: string;
}
