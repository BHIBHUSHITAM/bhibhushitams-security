export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface CourseModule {
  title: string;
  duration: string;
  topics: string[];
  videoUrl?: string;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  level: CourseLevel;
  duration: string;
  thumbnail?: string;
  price: number;
  modules: CourseModule[];
  description: string;
  isPublished: boolean;
  createdAt: string;
}

export interface CourseEnrollment {
  _id: string;
  courseId:
    | string
    | {
        _id: string;
        title: string;
        slug: string;
        level: CourseLevel;
        duration: string;
        thumbnail?: string;
      };
  studentId: string;
  progressPercent: number;
  completedModules: number[];
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}
