import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Note from '../models/Note.js';
import Report from '../models/Report.js';
import Incident from '../models/Incident.js';
import AgentExecution from '../models/AgentExecution.js';
import Log from '../models/Log.js';
import memoryStore from '../config/memoryStore.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../config/mailer.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_soc_jwt_key_12345', {
    expiresIn: '30d',
  });
};

const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
};

const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Register User
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All registration credentials are required.' });
  }

  if (!validateEmailFormat(email)) {
    return res.status(400).json({ message: 'Invalid secure email address format.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  if (!validatePasswordStrength(password)) {
    return res.status(400).json({ 
      message: 'Password must have minimum 8 characters, including 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.' 
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  console.log('[Auth] User creation in progress:', cleanEmail);

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const otp = generateOTP();
    console.log('[Auth] OTP generation:', otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (isDbConnected) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: 'Email address already registered.' });
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        passwordHash: password,
        role: role || 'analyst',
        isVerified: false,
        otp: otp,
        otpExpiry: otpExpiry
      });
      console.log('[Auth] MongoDB save success for:', cleanEmail);

      try {
        await sendOTPEmail(cleanEmail, otp, 'VERIFICATION');
      } catch (mailErr) {
        console.error('Failed to send OTP email:', mailErr);
      }

      return res.status(201).json({
        message: 'Account created. OTP sent.',
        email: user.email,
        isVerified: false
      });
    } else {
      const userExists = memoryStore.users.find(u => u.email === cleanEmail);
      if (userExists) {
        return res.status(400).json({ message: 'Email address already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email: cleanEmail,
        passwordHash: hashedPassword,
        role: role || 'analyst',
        isVerified: false,
        otp: otp,
        otpExpiry: otpExpiry,
        createdAt: new Date(),
        status: 'Active',
        lastLogin: null
      };

      memoryStore.users.push(user);
      console.log('[Auth] Memory save success for:', cleanEmail);

      try {
        await sendOTPEmail(cleanEmail, otp, 'VERIFICATION');
      } catch (mailErr) {
        console.error('Failed to send OTP email:', mailErr);
      }

      return res.status(201).json({
        message: 'Account created. OTP sent.',
        email: user.email,
        isVerified: false
      });
    }
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    return res.status(500).json({ message: error.message || 'Server registration failed.' });
  }
};

/**
 * Verify OTP Verification Code
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and verification OTP.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        console.log('[Auth] OTP verification result for', cleanEmail, ': failure (user not found)');
        return res.status(404).json({ message: 'Analyst profile not found.' });
      }

      if (user.otp !== otp) {
        console.log('[Auth] OTP verification result for', cleanEmail, ': failure (invalid code)');
        return res.status(400).json({ message: 'Invalid verification OTP.' });
      }

      if (new Date() > user.otpExpiry) {
        console.log('[Auth] OTP verification result for', cleanEmail, ': failure (expired code)');
        return res.status(400).json({ message: 'Verification OTP has expired. Request a new code.' });
      }

      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      
      console.log('[Auth] OTP verification result for', cleanEmail, ': success');

      return res.status(200).json({
        message: 'Email verified. Session authorized.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        isVerified: true
      });
    } else {
      const userIdx = memoryStore.users.findIndex(u => u.email === cleanEmail);
      if (userIdx === -1) {
        console.log('[Auth] OTP verification result for', cleanEmail, ': failure (user not found in memory)');
        return res.status(404).json({ message: 'Analyst profile not found.' });
      }

      const user = memoryStore.users[userIdx];
      if (user.otp !== otp) {
        console.log('[Auth] OTP verification result for', cleanEmail, ': failure (invalid code in memory)');
        return res.status(400).json({ message: 'Invalid verification OTP.' });
      }

      if (new Date() > new Date(user.otpExpiry)) {
        console.log('[Auth] OTP verification result for', cleanEmail, ': failure (expired code in memory)');
        return res.status(400).json({ message: 'Verification OTP has expired.' });
      }

      memoryStore.users[userIdx].isVerified = true;
      memoryStore.users[userIdx].otp = null;
      memoryStore.users[userIdx].otpExpiry = null;
      
      console.log('[Auth] OTP verification result for', cleanEmail, ': success (memory)');

      return res.status(200).json({
        message: 'Email verified. Session authorized.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        isVerified: true
      });
    }
  } catch (error) {
    console.error(`Verify OTP Error: ${error.message}`);
    return res.status(500).json({ message: 'Verification error.' });
  }
};

/**
 * Resend OTP Code
 * POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide email.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const otp = generateOTP();
    console.log('[Auth] OTP generation (Resend):', otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
      console.log('[Auth] MongoDB save success (Resend OTP) for:', cleanEmail);

      try {
        await sendOTPEmail(user.email, otp, 'VERIFICATION');
      } catch (mailError) {
        console.error('[Mailer] Resend OTP email send failure:', mailError.message);
        return res.status(500).json({ message: `Failed to dispatch verification email: ${mailError.message}` });
      }

      return res.json({ message: 'New verification OTP dispatched to email.' });
    } else {
      const idx = memoryStore.users.findIndex(u => u.email === cleanEmail);
      if (idx === -1) {
        return res.status(404).json({ message: 'User not found.' });
      }

      memoryStore.users[idx].otp = otp;
      memoryStore.users[idx].otpExpiry = otpExpiry;

      try {
        await sendOTPEmail(cleanEmail, otp, 'VERIFICATION');
      } catch (mailError) {
        console.error('[Mailer] Resend OTP email send failure (Memory):', mailError.message);
        return res.status(500).json({ message: `Failed to dispatch verification email: ${mailError.message}` });
      }

      return res.json({ message: 'New verification OTP dispatched to email.' });
    }
  } catch (error) {
    console.error(`Resend OTP Error: ${error.message}`);
    return res.status(500).json({ message: error.message || 'Failed to resend OTP.' });
  }
};

/**
 * Request Password Reset (Forgot Password)
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide email.' });
  }

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const cleanEmail = email.toLowerCase().trim();
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ message: 'No registered user matches this email.' });
      }

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      await sendOTPEmail(user.email, otp, 'PASSWORD_RESET');
      return res.json({ message: 'Password recovery OTP sent to email.' });
    } else {
      const idx = memoryStore.users.findIndex(u => u.email === cleanEmail);
      if (idx === -1) {
        return res.status(404).json({ message: 'No registered user matches this email.' });
      }

      memoryStore.users[idx].otp = otp;
      memoryStore.users[idx].otpExpiry = otpExpiry;

      await sendOTPEmail(cleanEmail, otp, 'PASSWORD_RESET');
      return res.json({ message: 'Password recovery OTP sent to email.' });
    }
  } catch (error) {
    console.error(`Forgot Password Error: ${error.message}`);
    return res.status(500).json({ message: error.message || 'Failed to process forgot password request.' });
  }
};

/**
 * Verify OTP & Reset Password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All credentials are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  if (!validatePasswordStrength(newPassword)) {
    return res.status(400).json({ 
      message: 'New password must have minimum 8 characters, including 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.' 
    });
  }

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const cleanEmail = email.toLowerCase().trim();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid verification OTP.' });
      }

      if (new Date() > user.otpExpiry) {
        return res.status(400).json({ message: 'Verification OTP has expired.' });
      }

      user.passwordHash = newPassword;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      // Log PASSWORD_CHANGE Audit Event
      await AuditLog.create({
        action: 'PASSWORD_CHANGE',
        user: user.name,
        ipAddress: clientIp,
        result: 'success'
      });

      return res.json({ message: 'Password successfully updated. Secure session ready.' });
    } else {
      const idx = memoryStore.users.findIndex(u => u.email === cleanEmail);
      if (idx === -1) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const user = memoryStore.users[idx];
      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid verification OTP.' });
      }

      if (new Date() > new Date(user.otpExpiry)) {
        return res.status(400).json({ message: 'Verification OTP has expired.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      memoryStore.users[idx].passwordHash = hashedPassword;
      memoryStore.users[idx].otp = null;
      memoryStore.users[idx].otpExpiry = null;

      // Memory audit trace
      memoryStore.auditLogs.push({
        timestamp: new Date(),
        action: 'PASSWORD_CHANGE',
        user: user.name,
        ipAddress: clientIp,
        result: 'success'
      });

      return res.json({ message: 'Password successfully updated. Secure session ready.' });
    }
  } catch (error) {
    console.error(`Reset Password Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        await AuditLog.create({
          action: 'LOGIN_FAILED',
          user: email,
          ipAddress: clientIp,
          result: 'failure'
        });
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      if (user.status !== 'Active') {
        return res.status(403).json({ message: 'Account suspended. Contact administration.' });
      }

      if (!user.isVerified) {
        // Send a new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        
        try {
          await sendOTPEmail(cleanEmail, otp, 'VERIFICATION');
        } catch (mailErr) {
          console.error('Failed to send OTP email:', mailErr);
        }

        return res.status(403).json({ 
          message: 'Email not verified. A new OTP has been sent to your email.', 
          isVerified: false, 
          email: user.email 
        });
      }

      if (await user.matchPassword(password)) {
        // Record last login and save
        user.lastLogin = new Date();
        await user.save();

        // Create LOGIN_SUCCESS Audit event
        await AuditLog.create({
          action: 'LOGIN_SUCCESS',
          user: user.name,
          ipAddress: clientIp,
          result: 'success'
        });

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          token: generateToken(user._id),
          isVerified: true
        });
      } else {
        await AuditLog.create({
          action: 'LOGIN_FAILED',
          user: user.name,
          ipAddress: clientIp,
          result: 'failure'
        });
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
    } else {
      const userIdx = memoryStore.users.findIndex((u) => u.email === cleanEmail);
      if (userIdx === -1) {
        memoryStore.auditLogs.push({
          timestamp: new Date(),
          action: 'LOGIN_FAILED',
          user: email,
          ipAddress: clientIp,
          result: 'failure'
        });
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const user = memoryStore.users[userIdx];
      if (user.status !== 'Active') {
        return res.status(403).json({ message: 'Account suspended.' });
      }

      if (!user.isVerified) {
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        memoryStore.users[userIdx].otp = otp;
        memoryStore.users[userIdx].otpExpiry = otpExpiry;
        
        try {
          await sendOTPEmail(cleanEmail, otp, 'VERIFICATION');
        } catch (mailErr) {
          console.error('Failed to send OTP email:', mailErr);
        }

        return res.status(403).json({ 
          message: 'Email not verified. A new OTP has been sent to your email.', 
          isVerified: false, 
          email: user.email 
        });
      }

      const passMatches = await bcrypt.compare(password, user.passwordHash);
      if (passMatches) {
        memoryStore.users[userIdx].lastLogin = new Date();
        
        memoryStore.auditLogs.push({
          timestamp: new Date(),
          action: 'LOGIN_SUCCESS',
          user: user.name,
          ipAddress: clientIp,
          result: 'success'
        });

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          lastLogin: memoryStore.users[userIdx].lastLogin,
          createdAt: user.createdAt,
          token: generateToken(user._id),
          isVerified: true
        });
      } else {
        memoryStore.auditLogs.push({
          timestamp: new Date(),
          action: 'LOGIN_FAILED',
          user: user.name,
          ipAddress: clientIp,
          result: 'failure'
        });
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
    }
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    return res.status(500).json({ message: 'Server login error.' });
  }
};

/**
 * Logout User
 * POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const auditorName = req.user ? req.user.name : 'Analyst';

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      await AuditLog.create({
        action: 'LOGOUT',
        user: auditorName,
        ipAddress: clientIp,
        result: 'success'
      });
    } else {
      memoryStore.auditLogs.push({
        timestamp: new Date(),
        action: 'LOGOUT',
        user: auditorName,
        ipAddress: clientIp,
        result: 'success'
      });
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout processing failed.' });
  }
};

/**
 * Delete User Account (Danger Zone Cascade Delete)
 * DELETE /api/auth/delete-account
 */
export const deleteAccount = async (req, res) => {
  const { password } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  if (!password) {
    return res.status(400).json({ message: 'Please provide password confirmation.' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Session unauthenticated.' });
  }

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const userId = req.user._id;
    const userName = req.user.name;

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Account profile not found.' });
      }

      const match = await user.matchPassword(password);
      if (!match) {
        return res.status(400).json({ message: 'Password confirmation failed.' });
      }

      // Cascade Delete
      await User.findByIdAndDelete(userId);
      await Note.deleteMany({ author: userName });
      await Report.deleteMany({}); // Purge general compiled reports
      await Incident.deleteMany({}); // Wipe incidents to clear telemetry
      await AgentExecution.deleteMany({}); // Clear executions metrics
      await Log.deleteMany({}); // Empty log references

      // Log final AuditLog event
      await AuditLog.create({
        action: 'ACCOUNT_DELETED',
        user: userName,
        ipAddress: clientIp,
        result: 'success'
      });

      return res.json({ success: true, message: 'Account and associated database structures successfully deleted.' });
    } else {
      const idx = memoryStore.users.findIndex(u => u._id.toString() === userId.toString());
      if (idx === -1) {
        return res.status(404).json({ message: 'Account profile not found.' });
      }

      const matched = await bcrypt.compare(password, memoryStore.users[idx].passwordHash);
      if (!matched) {
        return res.status(400).json({ message: 'Password confirmation failed.' });
      }

      // Cascade memory clear
      memoryStore.users.splice(idx, 1);
      memoryStore.clear();

      memoryStore.auditLogs.push({
        timestamp: new Date(),
        action: 'ACCOUNT_DELETED',
        user: userName,
        ipAddress: clientIp,
        result: 'success'
      });

      return res.json({ success: true, message: 'Memory credentials successfully deleted.' });
    }
  } catch (error) {
    console.error(`Delete Account Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to process account deletion.' });
  }
};

/**
 * Get All Users (Admin Only)
 * GET /api/auth/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      return res.json(users);
    } else {
      const users = memoryStore.users.map(({ passwordHash, ...u }) => u);
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(users);
    }
  } catch (error) {
    console.error(`Get Users Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch user list.' });
  }
};

/**
 * Protect middleware
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'Unauthorized session, token not provided.' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_soc_jwt_key_12345');

      const isDbConnected = mongoose.connection.readyState === 1;

      if (isDbConnected) {
        req.user = await User.findById(decoded.id).select('-passwordHash');
      } else {
        const memoryUser = memoryStore.users.find(u => u._id.toString() === decoded.id.toString());
        if (memoryUser) {
          const { passwordHash, ...userWithoutPass } = memoryUser;
          req.user = userWithoutPass;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Authorized session user not found.' });
      }

      next();
    } catch (error) {
      console.error(`Auth Middleware Error: ${error.message}`);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Authorized session expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Unauthorized session, token verification failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized session, no bearer token supplied.' });
  }
};
