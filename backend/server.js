const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "signup"
});

// Handle POST request to '/signup'
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Insert user data into the database
    const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
    const values = [name, email, password];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ error: "Failed to create user" });
        }
        console.log("User created:", result);
        return res.status(201).json({ message: "User created successfully", user: { name, email } });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if ( !email || !password) {
        return res.status(400).json({ error: " email, and password are required" });
    }

    // Insert user data into the database
    const sql = "SELECT * FROM login WHERE 'email'=? AND 'password' = ? ";
    db.query(sql,[email,password],(err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ error: "Failed to create user" });
        }
        console.log("Log in successfull:", result);
        return res.status(201).json({ message: "User created successfully", user: {email } });
    });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
