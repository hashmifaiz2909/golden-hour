import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../models/store.js';
import { config } from '../config/index.js';
import { extractUserIdFromAuth } from '../middleware/authMiddleware.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists.' });
  }

  // Hash password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    passwordHash,
    role: role === 'responder' ? 'responder' : 'rider'
  });

  // Auto-create initial medical profile for riders
  if (newUser.role === 'rider') {
    db.createOrUpdateProfile(newUser.id, {
      name: newUser.name,
      bloodGroup: 'Unknown',
      allergies: [],
      medicalConditions: [],
      emergencyContacts: []
    });
  }

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({
    message: 'User registered successfully',
    user: safeUser,
    token
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  return res.status(200).json({
    message: 'Login successful',
    user: safeUser,
    token
  });
};

export const getMe = (req: Request, res: Response) => {
  const userId = extractUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Missing or invalid token.' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.status(200).json({ user: safeUser });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const genericSuccessMessage = 'If an account exists with this email, a password reset link has been sent.';

  try {
    const user = db.getUserByEmail(email);
    if (!user) {
      // Do not leak account existence
      return res.status(200).json({ message: genericSuccessMessage });
    }

    // Generate cryptographically secure random token
    const token = crypto.randomBytes(32).toString('hex');
    db.createPasswordResetToken(user.id, token, 60);

    const resetLink = `${config.appBaseUrl}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetLink
    });

    return res.status(200).json({
      message: genericSuccessMessage
    });
  } catch (err: any) {
    console.error('[authController] forgotPassword error:', err);
    return res.status(200).json({ message: genericSuccessMessage });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Reset token is required.' });
  }

  const record = db.getPasswordResetToken(token);
  if (!record || record.usedAt || new Date(record.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ valid: false, error: 'This password reset link is invalid or has expired.' });
  }

  return res.status(200).json({ valid: true });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const record = db.getPasswordResetToken(token);
  if (!record || record.usedAt || new Date(record.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: 'This password reset link is invalid or has expired. Please request a new one.' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const updated = db.updateUserPassword(record.userId, passwordHash);
  if (!updated) {
    return res.status(500).json({ error: 'Failed to update user password.' });
  }

  db.markPasswordResetTokenUsed(record.id);

  return res.status(200).json({
    message: 'Password has been reset successfully. You can now sign in with your new password.'
  });
};
