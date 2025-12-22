import { Request, Response } from 'express';
import User from '../models/User';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { citizenId, password } = req.body;

    if (!citizenId || !password) {
      res.status(400).json({ success: false, message: 'Citizen ID and password are required' });
      return;
    }

    // Find user by citizenId
    const user = await User.findOne({ where: { citizenId } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password (plain text comparison for this demo)
    if (user.password !== password) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      success: true,
      data: userWithoutPassword,
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
