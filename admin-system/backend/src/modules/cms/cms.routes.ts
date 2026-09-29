import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../database/store.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { CMSContent } from '../../types/index.js';

const router = Router();

// GET /api/cms - List all CMS content
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.cmsContents,
  });
});

const CreateCMSchema = z.object({
  title: z.string().min(3, 'Tiêu đề bài viết không hợp lệ'),
  contentType: z.enum(['BANNER', 'NEWS', 'FAQ', 'POLICY']),
  summary: z.string().optional(),
  body: z.string().optional(),
  locale: z.enum(['vi', 'en']).default('vi'),
});

// POST /api/cms - Create CMS content
router.post('/', authenticateToken, (req: Request, res: Response) => {
  const body = CreateCMSchema.parse(req.body);

  const slug = body.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newContent: CMSContent = {
    id: store.cmsContents.length + 1,
    slug: `${slug}-${Date.now().toString().slice(-4)}`,
    title: body.title,
    contentType: body.contentType,
    summary: body.summary,
    body: body.body,
    locale: body.locale,
    positionOrder: store.cmsContents.length + 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.cmsContents.unshift(newContent);

  store.recordAuditLog(
    req.user?.id,
    req.user?.fullName || 'Admin',
    'CREATE_CMS',
    'cms_content',
    newContent.slug,
    `Tạo mới bài viết CMS [${newContent.contentType}]: ${newContent.title}`
  );

  res.status(201).json({
    success: true,
    message: 'Đăng tải nội dung CMS thành công.',
    data: newContent,
  });
});

export const cmsRoutes = router;
