import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'leettrack-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '24h'; // Access token expires in 24 hours

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'student';
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
}
