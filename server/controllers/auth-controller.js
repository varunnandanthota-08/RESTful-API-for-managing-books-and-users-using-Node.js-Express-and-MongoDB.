const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_bookstore_jwt_key_2026_secure';

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'customer',
            phone: phone || '',
            address: address || {}
        });

        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                address: newUser.address
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration.',
            error: error.message
        });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                wishlist: user.wishlist
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login.',
            error: error.message
        });
    }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user profile.'
        });
    }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (address) updateFields.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile.',
            error: error.message
        });
    }
};

// GET /api/auth/wishlist
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.status(200).json({
            success: true,
            wishlist: user?.wishlist || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist.'
        });
    }
};

// POST /api/auth/wishlist/toggle/:bookId
const toggleWishlist = async (req, res) => {
    try {
        const { bookId } = req.params;
        const user = await User.findById(req.user._id);

        const index = user.wishlist.indexOf(bookId);
        let inWishlist = false;

        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(bookId);
            inWishlist = true;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
            inWishlist,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle wishlist item.'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getWishlist,
    toggleWishlist
};
