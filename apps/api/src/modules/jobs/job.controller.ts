import { Request, Response } from 'express';
import { z } from 'zod';
import { jobService } from './job.service';

// Validation schemas
const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  location: z.string().min(1),
  isRemote: z.boolean().default(false),
  jobType: z.enum(['full-time', 'part-time', 'internship', 'contract', 'freelance']),
  experienceLevel: z.enum(['fresher', 'junior', 'mid-level', 'senior', 'lead']),
  experienceYears: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().optional(),
  }),
  skills: z.array(z.string()),
  qualifications: z.array(z.string()),
  openings: z.number().min(1).default(1),
  applicationDeadline: z.string().optional(),
});

const applyJobSchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted']),
  note: z.string().optional(),
});

export class JobController {
  /**
   * Create a new job (Company only)
   */
  async createJob(req: Request, res: Response) {
    try {
      const validatedData = createJobSchema.parse(req.body);
      const companyId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const job = await jobService.createJob({
        ...validatedData,
        companyId,
        postedBy: companyId,
        applicationDeadline: validatedData.applicationDeadline
          ? new Date(validatedData.applicationDeadline)
          : undefined,
      });

      res.status(201).json({
        message: 'Job created successfully',
        job,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.issues });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all jobs with filters (Public)
   */
  async getJobs(req: Request, res: Response) {
    try {
      const filters = {
        location: req.query.location as string | undefined,
        jobType: req.query.jobType as any,
        experienceLevel: req.query.experienceLevel as any,
        minSalary: req.query.minSalary ? parseFloat(req.query.minSalary as string) : undefined,
        maxSalary: req.query.maxSalary ? parseFloat(req.query.maxSalary as string) : undefined,
        skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
        isRemote: req.query.isRemote === 'true' ? true : req.query.isRemote === 'false' ? false : undefined,
        search: req.query.search as string | undefined,
      };

      const jobs = await jobService.getJobs(filters);

      res.json({
        message: 'Jobs fetched successfully',
        jobs,
        count: jobs.length,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get job by ID (Public)
   */
  async getJobById(req: Request, res: Response) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const job = await jobService.getJobById(jobId);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json({
        message: 'Job fetched successfully',
        job,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get company's jobs (Company only)
   */
  async getCompanyJobs(req: Request, res: Response) {
    try {
      const companyId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const jobs = await jobService.getCompanyJobs(companyId);

      res.json({
        message: 'Jobs fetched successfully',
        jobs,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update job (Company only)
   */
  async updateJob(req: Request, res: Response) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const companyId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = createJobSchema.partial().parse(req.body);
      const job = await jobService.updateJob(jobId, companyId, {
        ...validatedData,
        applicationDeadline: validatedData.applicationDeadline
          ? new Date(validatedData.applicationDeadline)
          : undefined,
      } as any);

      res.json({
        message: 'Job updated successfully',
        job,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.issues });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update job status (Company only)
   */
  async updateJobStatus(req: Request, res: Response) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const companyId = req.user?.id;
      const { status } = req.body;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const job = await jobService.updateJobStatus(jobId, companyId, status);

      res.json({
        message: 'Job status updated successfully',
        job,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete job (Company only)
   */
  async deleteJob(req: Request, res: Response) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const companyId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await jobService.deleteJob(jobId, companyId);

      res.json({
        message: 'Job deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Apply for a job (Student only)
   */
  async applyForJob(req: Request, res: Response) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const studentId = req.user?.id;

      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = applyJobSchema.parse(req.body);
      const application = await jobService.applyForJob({
        jobId,
        studentId,
        ...validatedData,
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.issues });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get student's applications (Student only)
   */
  async getStudentApplications(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;

      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const applications = await jobService.getStudentApplications(studentId);

      res.json({
        message: 'Applications fetched successfully',
        applications,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get applications for a job (Company only)
   */
  async getJobApplications(req: Request, res: Response) {
    try {
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const companyId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const applications = await jobService.getJobApplications(jobId, companyId);

      res.json({
        message: 'Applications fetched successfully',
        applications,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all company applications (Company only)
   */
  async getCompanyApplications(req: Request, res: Response) {
    try {
      const companyId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const applications = await jobService.getCompanyApplications(companyId);

      res.json({
        message: 'Applications fetched successfully',
        applications,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update application status (Company only)
   */
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const applicationId = Array.isArray(req.params.applicationId)
        ? req.params.applicationId[0]
        : req.params.applicationId;
      const companyId = req.user?.id;

      if (!companyId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = updateApplicationStatusSchema.parse(req.body);
      const application = await jobService.updateApplicationStatus(
        applicationId,
        companyId,
        validatedData.status,
        validatedData.note
      );

      res.json({
        message: 'Application status updated successfully',
        application,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.issues });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const jobController = new JobController();
