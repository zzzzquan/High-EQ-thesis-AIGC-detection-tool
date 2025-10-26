/**
 * Vercel deploy entry handler, for serverless deployment, please don't modify this file
 */
import app from './app.ts';

export default function handler(req: any, res: any) {
  return app(req, res);
}