import { Types } from 'mongoose';
import { AmbassadorApplicationModel, IAmbassadorApplication, AmbassadorModel, IAmbassador, AmbassadorTier } from './ambassador.model';

interface ApplyForAmbassadorInput {
  studentId: string;
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
}

interface ReviewApplicationInput {
  applicationId: string;
  approved: boolean;
  tier?: AmbassadorTier;
  adminNotes?: string;
  rejectionReason?: string;
}

interface UpdateAmbassadorMetricsInput {
  ambassadorId: string;
  eventsOrganized?: number;
  studentsRecruited?: number;
  totalReach?: number;
}

// Tier requirements based on metrics
interface TierRequirements {
  bronze: { minEvents: number; minRecruited: number };
  silver: { minEvents: number; minRecruited: number };
  gold: { minEvents: number; minRecruited: number };
  platinum: { minEvents: number; minRecruited: number };
}

const TIER_REQUIREMENTS: TierRequirements = {
  bronze: { minEvents: 0, minRecruited: 0 },
  silver: { minEvents: 2, minRecruited: 10 },
  gold: { minEvents: 5, minRecruited: 25 },
  platinum: { minEvents: 10, minRecruited: 50 },
};

class AmbassadorService {
  // Apply for ambassador program
  async applyForAmbassador(input: ApplyForAmbassadorInput): Promise<IAmbassadorApplication> {
    // Check if already applied
    const existingApplication = await AmbassadorApplicationModel.findOne({
      studentId: input.studentId,
      status: { $in: ['pending', 'approved', 'active'] },
    });

    if (existingApplication) {
      throw new Error('You already have an active ambassador application');
    }

    const application = new AmbassadorApplicationModel({
      ...input,
      appliedDate: new Date(),
    });

    return application.save();
  }

  // Get pending applications (Admin only)
  async getPendingApplications(): Promise<IAmbassadorApplication[]> {
    return AmbassadorApplicationModel.find({ status: 'pending' })
      .populate('studentId', 'name email')
      .sort({ appliedDate: -1 })
      .exec();
  }

  // Get application by ID
  async getApplicationById(applicationId: string): Promise<IAmbassadorApplication | null> {
    if (!Types.ObjectId.isValid(applicationId)) {
      return null;
    }

    return AmbassadorApplicationModel.findById(applicationId)
      .populate('studentId', 'name email')
      .exec();
  }

  // Review application (Admin only)
  async reviewApplication(input: ReviewApplicationInput, adminId: string): Promise<IAmbassadorApplication | null> {
    if (!Types.ObjectId.isValid(input.applicationId)) {
      return null;
    }

    const application = await AmbassadorApplicationModel.findById(input.applicationId);
    if (!application) {
      return null;
    }

    if (input.approved) {
      // Approve and create ambassador profile
      const tier = input.tier || 'bronze';

      // Create ambassador profile
      const ambassador = new AmbassadorModel({
        studentId: application.studentId,
        tier,
        college: application.college,
        department: application.department,
        bio: application.whyAmbassador,
        email: application.email,
        socialLinks: application.socialLinks,
        approvalDate: new Date(),
        engagementScore: 50, // Initial engagement score
      });

      await ambassador.save();

      // Update application
      application.status = 'approved';
      application.assignedTier = tier;
      application.reviewedDate = new Date();
      application.reviewedBy = new Types.ObjectId(adminId);
      application.adminNotes = input.adminNotes;
    } else {
      // Reject application
      application.status = 'rejected';
      application.reviewedDate = new Date();
      application.reviewedBy = new Types.ObjectId(adminId);
      application.rejectionReason = input.rejectionReason;
    }

    return application.save();
  }

  // Get ambassador profile
  async getAmbassadorProfile(studentId: string): Promise<IAmbassador | null> {
    if (!Types.ObjectId.isValid(studentId)) {
      return null;
    }

    return AmbassadorModel.findOne({ studentId })
      .populate('studentId', 'name email')
      .exec();
  }

  // Get all active ambassadors with filtering
  async getActiveAmbassadors(filters?: {
    tier?: AmbassadorTier;
    college?: string;
    department?: string;
  }): Promise<IAmbassador[]> {
    const query: any = { isActive: true };

    if (filters?.tier) {
      query.tier = filters.tier;
    }
    if (filters?.college) {
      query.college = filters.college;
    }
    if (filters?.department) {
      query.department = filters.department;
    }

    return AmbassadorModel.find(query)
      .populate('studentId', 'name email')
      .sort({ engagementScore: -1 })
      .exec();
  }

  // Get ambassador leaderboard
  async getAmbassadorLeaderboard(limit: number = 10): Promise<IAmbassador[]> {
    return AmbassadorModel.find({ isActive: true })
      .populate('studentId', 'name email')
      .sort({ engagementScore: -1 })
      .limit(limit)
      .exec();
  }

  // Update ambassador metrics
  async updateAmbassadorMetrics(input: UpdateAmbassadorMetricsInput): Promise<IAmbassador | null> {
    if (!Types.ObjectId.isValid(input.ambassadorId)) {
      return null;
    }

    const ambassador = await AmbassadorModel.findById(input.ambassadorId);
    if (!ambassador) {
      return null;
    }

    // Update metrics
    if (input.eventsOrganized !== undefined) {
      ambassador.eventsOrganized += input.eventsOrganized;
    }
    if (input.studentsRecruited !== undefined) {
      ambassador.studentsRecruited += input.studentsRecruited;
    }
    if (input.totalReach !== undefined) {
      ambassador.totalReach += input.totalReach;
    }

    // Calculate new engagement score (0-100)
    // Formula: (events * 10) + (recruited * 2) + base score
    const newScore = Math.min(
      100,
      50 + (ambassador.eventsOrganized * 10) + (ambassador.studentsRecruited * 2)
    );
    ambassador.engagementScore = newScore;

    // Check for tier upgrade
    const currentTier = ambassador.tier;
    ambassador.tier = this.calculateTier(
      ambassador.eventsOrganized,
      ambassador.studentsRecruited
    );

    // Update last activity date
    ambassador.lastActivityDate = new Date();

    return ambassador.save();
  }

  // Calculate tier based on metrics
  private calculateTier(eventsOrganized: number, studentsRecruited: number): AmbassadorTier {
    if (
      eventsOrganized >= TIER_REQUIREMENTS.platinum.minEvents &&
      studentsRecruited >= TIER_REQUIREMENTS.platinum.minRecruited
    ) {
      return 'platinum';
    }
    if (
      eventsOrganized >= TIER_REQUIREMENTS.gold.minEvents &&
      studentsRecruited >= TIER_REQUIREMENTS.gold.minRecruited
    ) {
      return 'gold';
    }
    if (
      eventsOrganized >= TIER_REQUIREMENTS.silver.minEvents &&
      studentsRecruited >= TIER_REQUIREMENTS.silver.minRecruited
    ) {
      return 'silver';
    }
    return 'bronze';
  }

  // Deactivate ambassador
  async deactivateAmbassador(ambassadorId: string): Promise<IAmbassador | null> {
    if (!Types.ObjectId.isValid(ambassadorId)) {
      return null;
    }

    return AmbassadorModel.findByIdAndUpdate(
      ambassadorId,
      { isActive: false },
      { new: true }
    ).exec();
  }

  // Reactivate ambassador
  async reactivateAmbassador(ambassadorId: string): Promise<IAmbassador | null> {
    if (!Types.ObjectId.isValid(ambassadorId)) {
      return null;
    }

    return AmbassadorModel.findByIdAndUpdate(
      ambassadorId,
      { isActive: true },
      { new: true }
    ).exec();
  }

  // Get ambassador statistics
  async getAmbassadorStats(): Promise<{
    totalAmbassadors: number;
    activeAmbassadors: number;
    pendingApplications: number;
    totalReach: number;
    averageEngagementScore: number;
    byTier: Record<AmbassadorTier, number>;
  }> {
    const [
      totalAmbassadors,
      activeAmbassadors,
      pendingApplications,
      ambassadorsByTier,
      stats,
    ] = await Promise.all([
      AmbassadorModel.countDocuments(),
      AmbassadorModel.countDocuments({ isActive: true }),
      AmbassadorApplicationModel.countDocuments({ status: 'pending' }),
      AmbassadorModel.collection.aggregate([
        { $group: { _id: '$tier', count: { $sum: 1 } } },
      ]).toArray(),
      AmbassadorModel.aggregate([
        {
          $group: {
            _id: null,
            totalReach: { $sum: '$totalReach' },
            avgEngagement: { $avg: '$engagementScore' },
          },
        },
      ]),
    ]);

    const byTier: Record<AmbassadorTier, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    ambassadorsByTier.forEach((item: any) => {
      if (['bronze', 'silver', 'gold', 'platinum'].includes(item._id)) {
        byTier[item._id as AmbassadorTier] = item.count;
      }
    });

    return {
      totalAmbassadors,
      activeAmbassadors,
      pendingApplications,
      totalReach: stats[0]?.totalReach || 0,
      averageEngagementScore: stats[0]?.avgEngagement || 0,
      byTier,
    };
  }

  // Get student's application
  async getStudentApplication(studentId: string): Promise<IAmbassadorApplication | null> {
    if (!Types.ObjectId.isValid(studentId)) {
      return null;
    }

    return AmbassadorApplicationModel.findOne({ studentId }).exec();
  }
}

export const ambassadorService = new AmbassadorService();
