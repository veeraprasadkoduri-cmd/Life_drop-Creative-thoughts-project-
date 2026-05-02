const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Donor = require('../models/Donor');
const { protect, adminOnly } = require('../middleware/auth');

const donorValidation = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('bloodGroup').isIn(['A+','A-','B+','B-','AB+','AB-','O+','O-']).withMessage('Invalid blood group'),
  body('mobile').matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Invalid mobile number'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('age').isInt({ min: 18, max: 65 }).withMessage('Age must be between 18 and 65'),
  body('gender').isIn(['Male','Female','Other']).withMessage('Invalid gender'),
  body('availability').isIn(['Available','Unavailable','Recently Donated']).withMessage('Invalid availability status')
];

// @route   POST /api/donor/create
// @desc    Create donor profile
// @access  Private
router.post('/create', protect, donorValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    // Check if user already has a donor profile
    const existing = await Donor.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a donor profile. Please update it instead.' });
    }

    const donor = await Donor.create({ ...req.body, userId: req.user._id });

    res.status(201).json({ success: true, message: 'Donor profile created successfully', donor });
  } catch (err) {
    console.error('Create donor error:', err);
    res.status(500).json({ success: false, message: 'Error creating donor profile.' });
  }
});

// @route   GET /api/donor/all
// @desc    Get all donors (admin) or own donor (user)
// @access  Private
router.get('/all', protect, async (req, res) => {
  try {
    let donors;

    if (req.user.role === 'admin') {
      const { bloodGroup, city, area, search } = req.query;
      const filter = {};

      if (bloodGroup) filter.bloodGroup = bloodGroup;
      if (city) filter.city = { $regex: city, $options: 'i' };
      if (area) filter.area = { $regex: area, $options: 'i' };
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { bloodGroup: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { area: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ];
      }

      donors = await Donor.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
    } else {
      donors = await Donor.find({ userId: req.user._id });
    }

    res.json({ success: true, count: donors.length, donors });
  } catch (err) {
    console.error('Get donors error:', err);
    res.status(500).json({ success: false, message: 'Error fetching donors.' });
  }
});

// @route   GET /api/donor/my
// @desc    Get current user's donor profile
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user._id });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'No donor profile found.' });
    }
    res.json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching donor profile.' });
  }
});

// @route   PUT /api/donor/:id
// @desc    Update donor
// @access  Private
router.put('/:id', protect, donorValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    // Users can only update their own profile; admins can update any
    if (req.user.role !== 'admin' && donor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile.' });
    }

    const updated = await Donor.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Donor profile updated successfully', donor: updated });
  } catch (err) {
    console.error('Update donor error:', err);
    res.status(500).json({ success: false, message: 'Error updating donor profile.' });
  }
});

// @route   DELETE /api/donor/:id
// @desc    Delete donor (admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }
    res.json({ success: true, message: 'Donor deleted successfully.' });
  } catch (err) {
    console.error('Delete donor error:', err);
    res.status(500).json({ success: false, message: 'Error deleting donor.' });
  }
});

module.exports = router;
