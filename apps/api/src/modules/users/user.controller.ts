import type { Request, Response } from 'express';
import { userService } from './user.service';
import type { UserRole } from '../../types/auth.types';

class UserController {
  /**
   * Test student protected route
   */
  async testStudentRoute(_req: Request, res: Response) {
    try {
      res.status(200).json({ message: 'Student protected route accessible' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Test company protected route
   */
  async testCompanyRoute(_req: Request, res: Response) {
    try {
      res.status(200).json({ message: 'Company protected route accessible' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Test admin protected route
   */
  async testAdminRoute(_req: Request, res: Response) {
    try {
      res.status(200).json({ message: 'Admin protected route accessible' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const { role, isActive } = req.query;
      
      const filters: { role?: UserRole; isActive?: boolean } = {};
      
      if (role && typeof role === 'string') {
        filters.role = role as UserRole;
      }
      
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const users = await userService.getAllUsers(filters);
      
      res.json({ users });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req: Request, res: Response) {
    try {
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;

      const user = await userService.getUserById(userId);
      
      res.json({ user });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get current user profile
   */
  async getMyProfile(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await userService.getUserById(req.user.id);
      
      res.json({ user });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update current user profile
   */
  async updateMyProfile(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, phone, college, bio, profileImage } = req.body;

      const user = await userService.updateUserProfile(req.user.id, {
        name,
        phone,
        college,
        bio,
        profileImage,
      });

      res.json({ 
        message: 'Profile updated successfully',
        user 
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(req: Request, res: Response) {
    try {
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;
      const { role } = req.body;

      if (!role || !['student', 'company', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const user = await userService.updateUserRole(userId, role as UserRole);

      res.json({ 
        message: 'User role updated successfully',
        user 
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(req: Request, res: Response) {
    try {
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;

      const user = await userService.deactivateUser(userId);

      res.json({ 
        message: 'User deactivated successfully',
        user 
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(req: Request, res: Response) {
    try {
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;

      const user = await userService.activateUser(userId);

      res.json({ 
        message: 'User activated successfully',
        user 
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;

      await userService.deleteUser(userId);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStatistics(_req: Request, res: Response) {
    try {
      const statistics = await userService.getUserStatistics();

      res.json({ statistics });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const userController = new UserController();
