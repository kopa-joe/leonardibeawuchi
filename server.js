const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const ADMIN_PASSWORD = "Admin123";
const dataFilePath = path.join(__dirname, 'data', 'data.json');
const imgFolder = path.join(__dirname, 'img');

// Initialization: Ensure folders exist
['data', 'img'].forEach(dir => !fs.existsSync(path.join(__dirname, dir)) && fs.mkdirSync(path.join(__dirname, dir)));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper: Delete files from disk
const clearFiles = (paths) => {
    paths.forEach(p => {
        if (p && typeof p === 'string' && !p.includes('default.png')) {
            const fullPath = path.resolve(__dirname, p);
            if (fs.existsSync(fullPath)) {
                try { fs.unlinkSync(fullPath); } catch (e) { console.error("Cleanup Error:", e); }
            }
        }
    });
};

// Helper: Read/Write JSON data
const getDB = () => JSON.parse(fs.readFileSync(dataFilePath, 'utf8') || "[]");
const saveDB = (data) => fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

app.post('/login', (req, res) => {
    const success = req.body.password === ADMIN_PASSWORD;
    res.status(success ? 200 : 401).json({ success });
});

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'img/'),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
    })
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file.');
    res.send({ filePath: `img/${req.file.filename}` });
});

app.post('/save', (req, res) => {
    const s = req.body;
    const isInvalid = (val) => !val || !val.trim() || /\s/.test(val.trim());

    if (isInvalid(s.fName) || isInvalid(s.lName) || !s.oName?.trim()) {
        return res.status(400).send("Validation Error: Invalid names.");
    }

    const data = getDB();
    const idx = data.findIndex(item => item.id === s.id);

    if (idx !== -1) {
        const old = data[idx];
        s.photo = old.photo; // Retain original photo
        if (s.celebration_photo && s.celebration_photo !== old.celebration_photo) {
            clearFiles([old.celebration_photo]);
        }
        data[idx] = s;
    } else {
        if (!s.photo || s.photo.includes('default.png')) return res.status(400).send("Validation Error: Passport photo required.");
        data.push(s);
    }

    saveDB(data);
    res.send("Saved");
});

app.post('/delete', (req, res) => {
    let data = getDB();
    const student = data.find(item => item.id === req.body.id);
    if (!student) return res.status(404).send("Not found");

    clearFiles([student.photo, student.celebration_photo]);
    saveDB(data.filter(item => item.id !== req.body.id));
    res.send("Deleted");
});

app.listen(3000, () => console.log("SERVER RUNNING ON PORT 3000"));