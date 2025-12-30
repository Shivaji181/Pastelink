const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Paste = require('./models/Paste');
const { getNow } = require('./utils/time');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
// Database connection
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return;
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI is undefined");
        console.log(`Connecting to MongoDB... (URI length: ${uri.length})`);
        
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Throw error so request fails fast instead of timing out
        throw err;
    }
};

// Ensure DB connected for every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
});

// Routes

// 1. Health check
app.get('/api/healthz', (req, res) => {
    // Check if DB is connected
    const dbState = mongoose.connection.readyState;
    // readyState 1 is connected, 2 is connecting.
    // If we want to strictly reflect persistence access:
    // Simple response as requested:
    res.json({ ok: true, dbState: dbState === 1 ? 'connected' : 'disconnected' });
});

// 2. Create a paste
app.post('/api/pastes', async (req, res) => {
    try {
        const { content, ttl_seconds, max_views } = req.body;

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
        }

        const data = {
            content,
            created_at: new Date() // Use system time for creation always? Or test time? 
            // prompt said "x-test-now-ms ... must be treated as the current time for expiry logic only".
            // So creation time is likely real time, or we can use test time if we want to simulate creating in past?
            // "expiry logic only" suggests creation uses real time.
        };

        if (ttl_seconds !== undefined) {
             const ttl = parseInt(ttl_seconds);
             if (isNaN(ttl) || ttl < 1) {
                 return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
             }
             data.ttl_seconds = ttl;
             data.expires_at = new Date(Date.now() + ttl * 1000);
        }

        if (max_views !== undefined) {
            const mv = parseInt(max_views);
            if (isNaN(mv) || mv < 1) {
                return res.status(400).json({ error: 'max_views must be an integer >= 1' });
            }
            data.max_views = mv;
        }

        const paste = new Paste(data);
        await paste.save();

        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
        
        const url = `${baseUrl}/p/${paste._id}`;

        res.json({
            id: paste._id,
            url: url
        });

    } catch (err) {
        console.error('Create error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Fetch a paste (API)
app.get('/api/pastes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const now = getNow(req);

        // Atomic check and update
        // We find a paste that:
        // 1. Matches ID
        // 2. Not expired (expires_at is null OR expires_at > now)
        // 3. Not view limited (max_views is null OR current_views < max_views)
        
        // Note: For max_views, if max_views=1, current_views=0. 0 < 1 is true. increment to 1. return.
        // Next time, current_views=1. 1 < 1 is false. Match fails. Returns null. -> 404. Correct.

        const paste = await Paste.findOneAndUpdate({
            _id: id,
            $and: [
                { $or: [{ expires_at: null }, { expires_at: { $gt: new Date(now) } }] },
                { $or: [{ max_views: null }, { $expr: { $lt: ["$current_views", "$max_views"] } }] }
            ]
        }, { 
            $inc: { current_views: 1 } 
        }, { 
            new: true 
        });

        if (!paste) {
            return res.status(404).json({ error: 'Paste not found or unavailable' });
        }

        const remaining_views = paste.max_views !== null ? paste.max_views - paste.current_views : null;

        res.json({
            content: paste.content,
            remaining_views,
            expires_at: paste.expires_at
        });

    } catch (err) {
        // If ID format is wrong (CastError), return 404
        if (err.name === 'CastError') {
             return res.status(404).json({ error: 'Paste not found' });
        }
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export app for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
