import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../models/store.js';
import { config } from '../config/index.js';
import { extractUserIdFromAuth } from '../middleware/authMiddleware.js';

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

  // Check bcrypt hash, with fallback to plaintext string comparison for demo seed accounts
  let isMatch = false;
  if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
    isMatch = await bcrypt.compare(password, user.passwordHash);
  } else {
    isMatch = (user.passwordHash === password);
  }

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
