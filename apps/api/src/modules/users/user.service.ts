import { UserModel } from './user.model';
import type { UserRole } from '../../types/auth.types';

class UserService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters?: { role?: UserRole; isActive?: boolean }) {
    const query: Record<string, unknown> = {};
    
    if (filters?.role) {
      query.role = filters.role;
    }
    
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const users = await UserModel.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });
    
    return users;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const user = await UserModel.findOne({ email }).select('-password -refreshToken');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: {
    name?: string;
    phone?: string;
    college?: string;
    bio?: string;
    profileImage?: string;
  }) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role: newRole } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(userId: string) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(userId: string) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { isActive: true } },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string) {
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStatistics() {
    const [totalUsers, usersByRole, activeUsers] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]),
      UserModel.countDocuments({ isActive: true }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.reduce<Record<string, number>>((acc, curr: { _id: string; count: number }) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}

export const userService = new UserService();
