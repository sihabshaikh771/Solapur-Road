const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// GET leaderboard
router.get('/', async (req, res) => {
  try {
    const { period = 'all_time', limit = 50 } = req.query;
    const col = period === 'weekly' ? 'weekly_points' : period === 'monthly' ? 'monthly_points' : 'all_time_points';

    const { data, error } = await supabase
      .from('leaderboard_cache')
      .select(`${col}, users(id, name, avatar_url, reports_count)`)
      .order(col, { ascending: false })
      .limit(limit);

    if (error) throw error;

    const ranked = data.map((row, i) => ({
      rank: i + 1,
      ...row.users,
      points: row[col],
      badge: row[col] >= 500 ? 'diamond' : row[col] >= 200 ? 'gold' : row[col] >= 100 ? 'silver' : 'bronze'
    }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
