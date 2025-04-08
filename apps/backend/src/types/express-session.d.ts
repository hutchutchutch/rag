import 'express-session';

declare module 'express-session' {
  interface SessionData {
    googleTokens?: any;
    userEmail?: string;
  }
}