const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
require('dotenv').config()
 const sendgridMail = require('@sendgrid/mail');
 sendgridMail.setApiKey(process.env.SENDGRID_APIKEY);



app.use(cors({
    origin: 'http://localhost:3000', 
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
app.get('/login', (req, res) => {
    const sql = "SELECT * FROM login"; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching order2 data:", err);
            return res.status(500).json({ error: "Failed to fetch order2 data" });
        }
        res.status(200).json(result); 
    });
});
app.post('/admin', (req, res) => {
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
            return res.status(200).json({ message: "Admin login successful!", user: { email } });
        });
    });
});
app.post('/order1', (req, res) => {
    const { name, email, phoneNumber, address } = req.body;
  
    
    const sql = "INSERT INTO order1 (name, email, phoneNumber,  address, origin) VALUES (?, ?, ?, ?, 'home')";
    const values = [name, email, phoneNumber, address];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting form data:", err);
        return res.status(500).json({ error: "Failed to submit form" });
      }
  
      console.log("Form data submitted:", result);
      return res.status(200).json({ message: "Form submitted successfully" });
    });
});
app.get('/order1', (req, res) => {
    const sql = "SELECT * FROM order1"; // Query to select all data from order1 table
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching order2 data:", err);
            return res.status(500).json({ error: "Failed to fetch order2 data" });
        }
        res.status(200).json(result); // Send the fetched data as JSON response
    });
});


app.post('/send-email', async (req, res) => {
    const { email, name,tableNumber, } = req.body;

    const msg = {
      to: email,
      from: 'oumabarack1047@gmail.com',
      subject: 'Order Confirmation',
      text: `Dear ${name}, your order for table number ${tableNumber} has been received, you are number 10 in line and your waiting time is 7 minutes `
    };

    try {
      await sendgridMail.send(msg);
      console.log('Email sent successfully');
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, error: error.toString() });
    }
  });

  app.post('/order-update', async (req, res) => {
    const { email,message } = req.body;

    const msg = {
      to: email,
      from: 'oumabarack1047@gmail.com',
      subject: 'Order Update',
      text:message,
    };

    try {
      await sendgridMail.send(msg);
      console.log('Email sent successfully');
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, error: error.toString() });
    }
  });
  app.post('/send-notification', async (req, res) => {
    const { email, name,address,waitingtime } = req.body;

    const msg = {
      to: email,
      from: 'oumabarack1047@gmail.com',
      subject: 'Order Confirmation',
      text: `Dear ${name}, your order for address ${address} has been received, you order is number 10 among active orders and will be delivered in 20 minutes  `
    };

    try {
      await sendgridMail.send(msg);
      console.log('Email sent successfully');
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, error: error.toString() });
    }
  });
 
app.post('/order2', (req, res) => {
    const { name, email, phoneNumber, tableNumber } = req.body;
  
    
    const sql = "INSERT INTO order2 (name, email, phoneNumber,  tableNumber,origin) VALUES (?, ?, ?, ?,'munch')";
    const values = [name, email, phoneNumber, tableNumber];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting form data:", err);
        return res.status(500).json({ error: "Failed to submit form" });
      }
  
      console.log("Form data submitted:", result);
      return res.status(200).json({ message: "Form submitted successfully" });
    });
});
app.get('/order2', (req, res) => {
    const sql = "SELECT * FROM order2";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching order2 data:", err);
            return res.status(500).json({ error: "Failed to fetch order2 data" });
        }
        res.status(200).json(result); 
    });
});


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});