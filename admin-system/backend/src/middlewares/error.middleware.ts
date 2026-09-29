import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    const errorDetails = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại biểu mẫu.',
      errors: errorDetails,
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống nội bộ.';
  res.status(500).json({
    success: false,
    message,
  });
}
