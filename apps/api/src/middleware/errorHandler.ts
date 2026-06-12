import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: err.details })
    }
  });
}
