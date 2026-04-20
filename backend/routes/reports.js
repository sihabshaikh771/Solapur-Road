const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// GET all reports (for heatmap)
router.get('/', async (req, res) => {
  try {
    const { condition, limit = 500, offset = 0 } = req.query;
    let query = supabase.from('reports').select('id, lat, lng, area_name, condition, description, media_url, media_type, upvotes, created_at, users(name, avatar_url)').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (condition) query = query.eq('condition', condition);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single report
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reports').select('*, users(name, avatar_url, total_points)').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Report not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create report
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    const { lat, lng, area_name, condition, description } = req.body;
    if (!lat || !lng || !condition) return res.status(400).json({ error: 'lat, lng, and condition are required' });

    const validConditions = ['good', 'medium', 'poor', 'dangerous'];
    if (!validConditions.includes(condition)) return res.status(400).json({ error: 'Invalid condition value' });

    let media_url = null;
    let media_type = null;

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${req.user.id}/${uuidv4()}.${fileExt}`;
      media_type = req.file.mimetype.startsWith('video') ? 'video' : 'image';

      const { error: uploadError } = await supabase.storage.from('road-reports').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('road-reports').getPublicUrl(fileName);
      media_url = urlData.publicUrl;
    }

    const reportId = uuidv4();
    const { data: report, error } = await supabase.from('reports').insert([{
      id: reportId,
      user_id: req.user.id,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      area_name: area_name || 'Solapur',
      condition,
      description: description || null,
      media_url,
      media_type,
      upvotes: 0
    }]).select().single();

    if (error) throw error;

    // Award points
    const points = 10;
    await supabase.from('users').update({
      total_points: supabase.rpc('increment', { row_id: req.user.id, col: 'total_points', amount: points }),
      reports_count: supabase.rpc('increment', { row_id: req.user.id, col: 'reports_count', amount: 1 })
    }).eq('id', req.user.id);

    await supabase.rpc('add_points', { p_user_id: req.user.id, p_points: points });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upvote
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('upvote_report', { report_id: req.params.id });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE report (owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { data: report } = await supabase.from('reports').select('user_id, media_url').eq('id', req.params.id).single();
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    if (report.media_url) {
      const path = report.media_url.split('/road-reports/')[1];
      await supabase.storage.from('road-reports').remove([path]);
    }

    await supabase.from('reports').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
