const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// GET user profile + their reports
router.get('/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, total_points, reports_count, created_at')
      .eq('id', req.params.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    const { data: reports } = await supabase
      .from('reports')
      .select('id, lat, lng, area_name, condition, media_url, media_type, created_at')
      .eq('user_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({ ...user, reports: reports || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
