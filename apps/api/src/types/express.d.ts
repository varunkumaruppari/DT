// Express Request namespace type extension
// Establishes typed authenticated request identity req.auth.userId

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
      };
    }
  }
}

export {};
