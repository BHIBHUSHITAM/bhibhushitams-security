import { Types } from 'mongoose';
import { JobModel, IJob, JobType, ExperienceLevel, JobStatus } from './job.model';
import { JobApplicationModel, IJobApplication, ApplicationStatus } from './job-application.model';
import { UserModel } from '../users/user.model';

export interface CreateJobInput {
  companyId: string;
  postedBy: string;
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
  applicationDeadline?: Date;
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

export interface ApplyJobInput {
  jobId: string;
  studentId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export class JobService {
  /**
   * Create a new job posting
   */
  async createJob(input: CreateJobInput): Promise<IJob> {
    // Validate company user
    const company = await UserModel.findById(input.companyId);
    if (!company || company.role !== 'company') {
      throw new Error('Company not found');
    }

    const job = await JobModel.create({
      companyId: new Types.ObjectId(input.companyId),
      postedBy: new Types.ObjectId(input.postedBy),
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      responsibilities: input.responsibilities,
      location: input.location,
      isRemote: input.isRemote,
      jobType: input.jobType,
      experienceLevel: input.experienceLevel,
      experienceYears: input.experienceYears,
      salary: {
        ...input.salary,
        currency: input.salary.currency || 'INR',
      },
      skills: input.skills,
      qualifications: input.qualifications,
      openings: input.openings,
      applicationDeadline: input.applicationDeadline,
      status: 'active',
      totalApplications: 0,
    });

    return job;
  }

  /**
   * Get all jobs with filtering
   */
  async getJobs(filters: JobFilters = {}): Promise<IJob[]> {
    const query: any = { status: 'active' };

    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }

    if (filters.jobType) {
      query.jobType = filters.jobType;
    }

    if (filters.experienceLevel) {
      query.experienceLevel = filters.experienceLevel;
    }

    if (filters.minSalary !== undefined) {
      query['salary.max'] = { $gte: filters.minSalary };
    }

    if (filters.maxSalary !== undefined) {
      query['salary.min'] = { $lte: filters.maxSalary };
    }

    if (filters.isRemote !== undefined) {
      query.isRemote = filters.isRemote;
    }

    if (filters.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const jobs = await JobModel.find(query)
      .populate('companyId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return jobs;
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<IJob | null> {
    const job = await JobModel.findById(jobId)
      .populate('companyId', 'name email')
      .populate('postedBy', 'name');

    return job;
  }

  /**
   * Get jobs posted by a company
   */
  async getCompanyJobs(companyId: string): Promise<IJob[]> {
    const jobs = await JobModel.find({ companyId })
      .sort({ createdAt: -1 });

    return jobs;
  }

  /**
   * Update job
   */
  async updateJob(jobId: string, companyId: string, updates: Partial<CreateJobInput>): Promise<IJob> {
    const job = await JobModel.findOne({ _id: jobId, companyId });
    
    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    Object.assign(job, updates);
    await job.save();

    return job;
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, companyId: string, status: JobStatus): Promise<IJob> {
    const job = await JobModel.findOne({ _id: jobId, companyId });
    
    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    job.status = status;
    await job.save();

    return job;
  }

  /**
   * Delete job
   */
  async deleteJob(jobId: string, companyId: string): Promise<void> {
    const job = await JobModel.findOne({ _id: jobId, companyId });
    
    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    await JobModel.deleteOne({ _id: jobId });
  }

  /**
   * Apply for a job
   */
  async applyForJob(input: ApplyJobInput): Promise<IJobApplication> {
    // Validate job exists and is active
    const job = await JobModel.findById(input.jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'active') {
      throw new Error('Job is not accepting applications');
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      throw new Error('Application deadline has passed');
    }

    // Validate student
    const student = await UserModel.findById(input.studentId);
    if (!student || student.role !== 'student') {
      throw new Error('Student not found');
    }

    // Check if already applied
    const existingApplication = await JobApplicationModel.findOne({
      jobId: input.jobId,
      studentId: input.studentId,
    });

    if (existingApplication) {
      throw new Error('Already applied to this job');
    }

    // Create application
    const application = await JobApplicationModel.create({
      jobId: new Types.ObjectId(input.jobId),
      studentId: new Types.ObjectId(input.studentId),
      companyId: job.companyId,
      coverLetter: input.coverLetter,
      resumeUrl: input.resumeUrl,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
        },
      ],
    });

    // Increment application count
    job.totalApplications += 1;
    await job.save();

    return application;
  }

  /**
   * Get student's job applications
   */
  async getStudentApplications(studentId: string): Promise<IJobApplication[]> {
    const applications = await JobApplicationModel.find({ studentId })
      .populate('jobId')
      .populate('companyId', 'name email')
      .sort({ createdAt: -1 });

    return applications;
  }

  /**
   * Get applications for a job (company view)
   */
  async getJobApplications(jobId: string, companyId: string): Promise<IJobApplication[]> {
    // Verify company owns this job
    const job = await JobModel.findOne({ _id: jobId, companyId });
    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    const applications = await JobApplicationModel.find({ jobId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    return applications;
  }

  /**
   * Get all applications for a company
   */
  async getCompanyApplications(companyId: string): Promise<IJobApplication[]> {
    const applications = await JobApplicationModel.find({ companyId })
      .populate('jobId', 'title')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    return applications;
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    companyId: string,
    status: ApplicationStatus,
    note?: string
  ): Promise<IJobApplication> {
    const application = await JobApplicationModel.findOne({ _id: applicationId, companyId });
    
    if (!application) {
      throw new Error('Application not found or unauthorized');
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      note,
    } as any);

    await application.save();

    return application;
  }

  /**
   * Add company notes to application
   */
  async addApplicationNotes(
    applicationId: string,
    companyId: string,
    notes: string
  ): Promise<IJobApplication> {
    const application = await JobApplicationModel.findOne({ _id: applicationId, companyId });
    
    if (!application) {
      throw new Error('Application not found or unauthorized');
    }

    application.companyNotes = notes;
    await application.save();

    return application;
  }
}

export const jobService = new JobService();
