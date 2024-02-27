// Import required modules
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "signup"
});

// Salt for password hashing
const saltRounds = 10;

// Handle POST request to '/signup'
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error hashing password" });
        }

        // Insert user data into the database
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

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Fetch user data from the database based on email
    const sql = "SELECT * FROM login WHERE email=?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ error: "Failed to fetch user" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Retrieve the hashed password from the query result
        const hashedPassword = result[0].password;

        // Log values for debugging
        console.log("Password from request:", password);
        console.log("Hashed password from database:", hashedPassword);

        // Compare hashed password with the provided password
        bcrypt.compare(password, hashedPassword, (compareErr, isMatch) => {
            if (compareErr) {
                console.error("Error comparing passwords:", compareErr);
                return res.status(500).json({ error: "Error comparing passwords" });
            }
        
            // Log comparison result for debugging
            console.log("Password comparison result:", isMatch);

            if (!isMatch) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Passwords match, login successful
            return res.status(200).json({ message: "Login successful!", user: { email } });
        });
    });
});



// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
