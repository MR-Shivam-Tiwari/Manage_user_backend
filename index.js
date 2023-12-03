const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
mongoose.connect(
  "mongodb+srv://shivamt2023:ft12shivam12@cluster0.zkwpng6.mongodb.net/your-database-name",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use(cors());
app.use(bodyParser.json());

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  avatar: String,
  domain: String,
  available: Boolean,
});

const User = mongoose.model("User", userSchema);
const teamSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Team = mongoose.model("Team", {
  name: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

app.get("/api/users", async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    domain,
    gender,
    availability,
  } = req.query;
  const skip = (page - 1) * limit;

  const query = {};

  if (domain) query.domain = domain;
  if (gender) query.gender = gender;
  if (availability !== undefined) query.available = availability === "true";
  if (search) {
    query.$or = [
      { first_name: { $regex: new RegExp(search, "i") } },
      { last_name: { $regex: new RegExp(search, "i") } },
      { email: { $regex: new RegExp(search, "i") } },
    ];
  }

  try {
    const users = await User.find(query).skip(skip).limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({ users, totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  const user = new User(req.body);

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/api/team", async (req, res) => {
  try {
    const teams = await Team.find().populate(
      "users",
      "first_name last_name email"
    );
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post("/api/team", async (req, res) => {
  const { teamName, selectedUsers } = req.body;

  console.log("Received data for creating team:", teamName, selectedUsers);

  if (!teamName) {
    return res.status(400).json({ message: "Team name is required." });
  }

  try {
    const uniqueDomains = new Set();
    const users = await User.find({ _id: { $in: selectedUsers } });

    for (const user of users) {
      if (uniqueDomains.has(user.domain)) {
        return res
          .status(400)
          .json({ message: "Each user must have a unique domain." });
      }
      uniqueDomains.add(user.domain);

      Example: if (!user.available) {
        return res
          .status(400)
          .json({ message: "All users must be available." });
      }
    }

    const team = await Team.create({ name: teamName, users: selectedUsers });
    console.log("Team created:", team);

    const populatedTeam = await Team.findById(team._id).populate(
      "users",
      "first_name last_name email"
    );

    res.status(201).json(populatedTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/team/:id", async (req, res) => {
  try {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);
    if (deletedTeam) {
      res.json({ message: "Team deleted successfully", deletedTeam });
    } else {
      res.status(404).json({ message: "Team not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/api/team/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      "users",
      "first_name last_name email"
    );
    if (team) {
      res.json(team);
    } else {
      res.status(404).json({ message: "Team not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
