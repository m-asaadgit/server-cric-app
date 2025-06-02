
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();
const app = express();
const server = http.createServer(app); // HTTP server for Socket.IO
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL // Production Frontend URL (set in Vercel)
    : 'http://localhost:5173', // Local Frontend URL (for development)
  credentials: true, // Allow cookies and authorization headers
};
// Middleware
app.use(express.json());
app.use(cors(corsOptions)); // Use the configured CORS options
app.use(helmet()); // Security middleware
app.use(morgan("dev")); // Logging middleware


// Import routes
const userRoutes = require("./routes/userRoutes");
const playerRoutes = require("./routes/playerRoutes");
const teamRoutes = require("./routes/teamRoutes");
const matchRoutes = require("./routes/matchRoutes");
const unlistedMatchRoutes = require("./routes/unlistedMatchesRoutes");
const clientSideRoute = require("./routes/cilentSideRoutes");
const tournamentAndSeriesRoutes = require("./routes/seriesAndTournamentRoute");

// Use routes
app.use("/api/user", userRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/unlisted-match", unlistedMatchRoutes);
app.use("/api/client-side", clientSideRoute);
app.use("/api/tournaments-series", tournamentAndSeriesRoutes);

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Exit if connection fails
    }
};
connectDB();

// Initialize Socket.IO (✅ FIXED)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.locals.io = io; // ✅ Attach Socket.io to app.locals

io.on("connection", (socket) => {
    console.log(`🔗 User Connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`❌ User Disconnected: ${socket.id}`);
    });
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
