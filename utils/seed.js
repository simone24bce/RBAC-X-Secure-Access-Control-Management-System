require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});

  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedUser = await bcrypt.hash("user123", 10);

  await User.create([
    { username: "admin_vit", password: hashedAdmin, role: "Admin" },
    { username: "employee_test", password: hashedUser, role: "Employee" }
  ]);

  console.log("✅ Seeded: admin_vit/admin123 & employee_test/user123");
  process.exit();
};
seed();