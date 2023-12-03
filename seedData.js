// seedData.js
const mongoose = require('mongoose');
const fs = require('fs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://shivamt2023:ft12shivam12@cluster0.zkwpng6.mongodb.net/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the User model schema
// Define User schema
const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    gender: String,
    avatar: String,
    domain: String,
    available: Boolean,
  });
  
  const User = mongoose.model('User', userSchema);
  
  // Define Team schema
  const teamSchema = new mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  });
  
  const Team = mongoose.model('Team', teamSchema);
  

// Read data from the JSON file
const jsonData = fs.readFileSync('./heliverse_mock_data.json', 'utf8');
const usersData = JSON.parse(jsonData);

// Seed data into the User collection
User.insertMany(usersData)
  .then(() => {
    console.log('Data seeded successfully.');
    mongoose.connection.close();
  })
  .catch(error => {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  });
