const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Replace with the origin of your React app
    credentials: true
  }));
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "signup"
});

const saltRounds = 10;

app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error hashing password" });
        }

        const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
        const values = [name, email, hashedPassword];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: "Failed to create user" });
            }
            console.log("User created:", result);
            return res.status(201).json({ message: "User created successfully", user: { name, email } });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const sql = "SELECT * FROM login WHERE email=?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ error: "Failed to fetch user" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const hashedPassword = result[0].password;

        bcrypt.compare(password, hashedPassword, (compareErr, isMatch) => {
            if (compareErr) {
                console.error("Error comparing passwords:", compareErr);
                return res.status(500).json({ error: "Error comparing passwords" });
            }
            return res.status(200).json({ message: "Login successful!", user: { email } });
        });
    });
});

// New endpoint to handle form submissions
app.post('/forms', (req, res) => {
    const { name, email, phoneNumber, tableNumber, preferredMealTime } = req.body;
  
    // Insert the form data into your MySQL database
    const sql = "INSERT INTO forms (name, email, phoneNumber, tableNumber, preferredMealTime) VALUES (?, ?, ?, ?, ?)";
    const values = [name, email, phoneNumber, tableNumber, preferredMealTime];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting form data:", err);
        return res.status(500).json({ error: "Failed to submit form" });
      }
  
      console.log("Form data submitted:", result);
      return res.status(200).json({ message: "Form submitted successfully" });
    });
});


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
