import { Router } from 'express';
import authRoutes from './auth';
import gamesRoutes from './games';
import studentsRoutes from './students';
import facultyRoutes from './faculty';
import parentsRoutes from './parents';
import adminRoutes from './admin';
import schoolsRoutes from './schools';
import rivalRoutes from './rival';
import storyRoutes from './story';

const router = Router();

router.use('/auth', authRoutes);
router.use('/games', gamesRoutes);
router.use('/students', studentsRoutes);
router.use('/faculty', facultyRoutes);
router.use('/parents', parentsRoutes);
router.use('/admin', adminRoutes);
router.use('/schools', schoolsRoutes);
router.use('/rival', rivalRoutes);
router.use('/story', storyRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
