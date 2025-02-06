const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Import routes
const userRoutes = require("./routes/userRoutes");
const playerRoutes = require("./routes/playerRoutes");
const teamRoutes = require("./routes/teamRoutes");
const matchRoutes = require("./routes/matchRoutes");
// const matchRoutes = require("./routes/matchRoutes");
// const tournamentRoutes = require("./routes/tournamentRoutes");
// const seriesRoutes = require("./routes/seriesRoutes");

// Use routes
app.use("/api/user", userRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/match", matchRoutes);
// app.use("/api/matches", matchRoutes);
// app.use("/api/tournaments", tournamentRoutes);
  
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
