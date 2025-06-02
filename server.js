
// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// const helmet = require("helmet");
// const morgan = require("morgan");

// dotenv.config();
// const app = express();
// const server = http.createServer(app); // HTTP server for Socket.IO
// const corsOptions = {
//   origin: process.env.NODE_ENV == 'production'
//     ? process.env.CLIENT_URL // Production Frontend URL (set in Vercel)
//     : 'http://localhost:5173', // Local Frontend URL (for development)
//   credentials: true, // Allow cookies and authorization headers
// };
// // Middleware
// app.use(express.json());
// app.use(cors(corsOptions)); // Use the configured CORS options
// app.use(helmet()); // Security middleware
// app.use(morgan("dev")); // Logging middleware


// // Import routes
// const userRoutes = require("./routes/userRoutes");
// const playerRoutes = require("./routes/playerRoutes");
// const teamRoutes = require("./routes/teamRoutes");
// const matchRoutes = require("./routes/matchRoutes");
// const unlistedMatchRoutes = require("./routes/unlistedMatchesRoutes");
// const clientSideRoute = require("./routes/cilentSideRoutes");
// const tournamentAndSeriesRoutes = require("./routes/seriesAndTournamentRoute");

// // Use routes
// app.use("/api/user", userRoutes);
// app.use("/api/player", playerRoutes);
// app.use("/api/team", teamRoutes);
// app.use("/api/match", matchRoutes);
// app.use("/api/unlisted-match", unlistedMatchRoutes);
// app.use("/api/client-side", clientSideRoute);
// app.use("/api/tournaments-series", tournamentAndSeriesRoutes);

// // MongoDB Connection
// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("✅ MongoDB Connected");
//     } catch (error) {
//         console.error("❌ MongoDB Connection Error:", error.message);
//         process.exit(1); // Exit if connection fails
//     }
// };
// connectDB();

// // Initialize Socket.IO (✅ FIXED)
// const io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });
// app.locals.io = io; // ✅ Attach Socket.io to app.locals

// io.on("connection", (socket) => {
//     console.log(`🔗 User Connected: ${socket.id}`);

//     socket.on("disconnect", () => {
//         console.log(`❌ User Disconnected: ${socket.id}`);
//     });
// });

// // Server Start
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




// // {
// //   "name": "server",
// //   "version": "1.0.0",
// //   "description": "",
// //   "main": "index.js",
// //   "scripts": {
// //     "test": "echo \"Error: no test specified\" && exit 1",
// //     "start": "nodemon server.js"
// //   },
// //   "keywords": [],
// //   "author": "",
// //   "license": "ISC",
// //   "dependencies": {
// //     "apollo-server-express": "^3.13.0",
// //     "bcrypt": "^5.1.1",
// //     "bcryptjs": "^2.4.3",
// //     "body-parser": "^1.20.3",
// //     "cors": "^2.8.5",
// //     "crypto": "^1.0.1",
// //     "dotenv": "^16.4.7",
// //     "express": "^4.21.2",
// //     "express-session": "^1.18.1",
// //     "graphql": "^16.10.0",
// //     "helmet": "^8.1.0",
// //     "json-web-token": "^3.2.0",
// //     "mongoose": "^8.9.6",
// //     "nodemailer": "^6.10.0",
// //     "nodemon": "^3.1.9",
// //     "otp-generator": "^4.0.1",
// //     "socket.io": "^4.8.1"
// //   }
// // }
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app); // Needed for Socket.IO

// CORS Options
const isProduction = process.env.NODE_ENV === 'production';
const corsOptions = {
  origin: isProduction ? process.env.CLIENT_URL : "http://localhost:5173",
  credentials: true,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));

// Import and Use Routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/player", require("./routes/playerRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/match", require("./routes/matchRoutes"));
app.use("/api/unlisted-match", require("./routes/unlistedMatchesRoutes"));
app.use("/api/client-side", require("./routes/cilentSideRoutes"));
app.use("/api/tournaments-series", require("./routes/seriesAndTournamentRoute"));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
connectDB();

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: isProduction ? process.env.CLIENT_URL : "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Make io available throughout app if needed
app.locals.io = io;

io.on("connection", (socket) => {
  console.log(`🔗 Socket connected: ${socket.id} from ${socket.handshake.headers.origin}`);

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Server Listener
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
