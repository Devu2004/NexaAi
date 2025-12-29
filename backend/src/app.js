const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); 

// --- ROUTES IMPORT ---
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// --- MIDDLEWARES ---
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- ROUTES MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes); 

// Basic Health Check
app.get('/', (req, res) => {
    res.status(200).json({ message: "Nova AI Backend is Running..." });
});

module.exports = app;