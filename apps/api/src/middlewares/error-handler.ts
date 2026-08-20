import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.path} -> ${statusCode}:`, err);

  res.status(statusCode).json({
    status: 'error',
    message:
      statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
