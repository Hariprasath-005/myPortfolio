const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, "submissions.json");
const ADMIN_ACCESS_KEY = "admin123"; // Simple secure pin for dashboard authentication

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from workspace root
app.use(express.static(path.join(__dirname)));

// Helper: Read database file
const readSubmissions = () => {
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(DB_FILE, "utf8");
        return JSON.parse(data || "[]");
    } catch (err) {
        console.error("Error reading submissions database:", err);
        return [];
    }
};

// Helper: Write database file
const writeSubmissions = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        console.error("Error writing submissions database:", err);
    }
};

// API: POST Contact Form Ingestion
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name field is required." });
    }
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message body cannot be empty." });
    }

    const submissions = readSubmissions();
    
    const newSubmission = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString()
    };

    submissions.push(newSubmission);
    writeSubmissions(submissions);

    return res.status(200).json({ success: true, message: "Message submitted successfully." });
});

// API: GET admin messages log (Authorized via custom header)
app.get("/api/admin/messages", (req, res) => {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader || authHeader !== `Bearer ${ADMIN_ACCESS_KEY}`) {
        return res.status(401).json({ error: "Unauthorized access. Invalid or missing key." });
    }

    const submissions = readSubmissions();
    // Return newest messages first
    const sortedSubmissions = [...submissions].reverse();
    return res.status(200).json(sortedSubmissions);
});

// API: DELETE admin message by ID
app.delete("/api/admin/messages/:id", (req, res) => {
    const authHeader = req.headers["authorization"];
    const messageId = req.params.id;

    if (!authHeader || authHeader !== `Bearer ${ADMIN_ACCESS_KEY}`) {
        return res.status(401).json({ error: "Unauthorized access. Invalid or missing key." });
    }

    let submissions = readSubmissions();
    const initialLength = submissions.length;
    submissions = submissions.filter(item => item.id !== messageId);
    
    if (submissions.length === initialLength) {
        return res.status(404).json({ error: "Message not found." });
    }

    writeSubmissions(submissions);
    return res.status(200).json({ success: true, message: "Message deleted successfully." });
});

// Fallback: Route index.html for unknown routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`PORTFOLIO SERVER LAUNCHED`);
    console.log(`Serving frontend & APIs at: http://localhost:${PORT}`);
    console.log(`Database storage located at: ${DB_FILE}`);
    console.log(`Admin Password configured as: ${ADMIN_ACCESS_KEY}`);
    console.log(`=================================================`);
});
