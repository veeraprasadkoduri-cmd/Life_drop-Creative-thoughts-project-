const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/export-csv
// @desc    Export all donors as CSV
// @access  Private/Admin
router.get('/export-csv', protect, adminOnly, async (req, res) => {
  try {
    const { bloodGroup, city, area } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (area) filter.area = { $regex: area, $options: 'i' };

    const donors = await Donor.find(filter).sort({ createdAt: -1 });

    if (donors.length === 0) {
      return res.status(404).json({ success: false, message: 'No donors found to export.' });
    }

    // Build CSV manually
    const headers = [
      'Full Name', 'Blood Group', 'Mobile', 'Email', 'Address',
      'Area', 'City', 'Age', 'Gender', 'Last Donation Date',
      'Availability', 'Registered On'
    ];

    const rows = donors.map(d => [
      `"${(d.fullName || '').replace(/"/g, '""')}"`,
      d.bloodGroup || '',
      `"${(d.mobile || '').replace(/"/g, '""')}"`,
      d.email || '',
      `"${(d.address || '').replace(/"/g, '""')}"`,
      `"${(d.area || '').replace(/"/g, '""')}"`,
      `"${(d.city || '').replace(/"/g, '""')}"`,
      d.age || '',
      d.gender || '',
      d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'N/A',
      d.availability || '',
      d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="lifedrop_donors_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ success: false, message: 'Error generating CSV export.' });
  }
});

module.exports = router;
