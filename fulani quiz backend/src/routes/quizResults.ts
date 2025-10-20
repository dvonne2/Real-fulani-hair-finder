import { Router, Request, Response } from 'express';
import { QuizResult } from '../models/index.js';

const router = Router();

// List recent quiz results
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 100);
    const offset = parseInt(String(req.query.offset ?? '0'), 10) || 0;
    const results = await QuizResult.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return res.json({ items: results, limit, offset });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list quiz results' });
  }
});

// Create a quiz result
router.post('/', async (req: Request, res: Response) => {
  try {
    const { answers, recommendation, name, email, phone, state } = req.body;
    if (!answers) {
      return res.status(400).json({ error: 'answers is required' });
    }
    const created = await QuizResult.create({
      answers,
      recommendation: recommendation ?? null,
      name: name ?? null,
      email: email ?? null,
      phone: phone ?? null,
      state: state ?? null,
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error('DB create failed, returning accepted fallback:', err);
    return res.status(202).json({
      id: null,
      answers: req.body?.answers ?? null,
      recommendation: req.body?.recommendation ?? null,
      note: 'Accepted without persistence (DB unavailable)'
    });
  }
});

// Get a quiz result by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await QuizResult.findByPk(id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch quiz result' });
  }
});

export default router;
