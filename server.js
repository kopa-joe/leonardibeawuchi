const ADMIN_PASSWORD = "Admin123";

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const dataFilePath = path.join(__dirname, 'data', 'data.json');
const imgFolder = path.join(__dirname, 'img');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);

const clearFiles = (paths) => {
    paths.forEach(p => {
        if (p && typeof p === 'string' && !p.includes('default.png')) {
            const fullPath = path.resolve(__dirname, p);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log("Cleanup: Deleted file", fullPath);
                } catch (err) {
                    console.error("Cleanup Error:", err);
                }
            }
        }
    });
};

app.post('/login', (req, res) => {
    const {
        password
    } = req.body;
    if (password === ADMIN_PASSWORD) res.json({
        success: true
    });
    else res.status(401).json({
        success: false
    });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'img/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({
    storage: storage
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file.');
    res.send({
        filePath: `img/${req.file.filename}`
    });
});

app.post('/save', (req, res) => {
    const s = req.body;
    const spaceRegex = /\s/;

    if (!s.fName || !s.lName || !s.oName || !s.fName.trim() || !s.lName.trim() || !s.oName.trim() || spaceRegex.test(s.fName.trim()) || spaceRegex.test(s.lName.trim())) {
        return res.status(400).send("Validation Error: Invalid names.");
    }

    let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8') || "[]");
    const existingIndex = data.findIndex(item => item.id === s.id);

    if (existingIndex !== -1) {
        // UPDATE MODE: RETAIN ORIGINAL PHOTO
        const oldRecord = data[existingIndex];
        s.photo = oldRecord.photo; // Force original photo back into the data

        // Only delete celebration photo if a new one was uploaded
        if (s.celebration_photo && s.celebration_photo !== oldRecord.celebration_photo) {
            clearFiles([oldRecord.celebration_photo]);
        }

        data[existingIndex] = s;
    } else {
        // NEW RECORD MODE
        if (!s.photo || s.photo.includes('default.png')) {
            return res.status(400).send("Validation Error: Passport photo required.");
        }
        data.push(s);
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.send("Saved");
});

app.post('/delete', (req, res) => {
    let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8') || "[]");
    const student = data.find(item => item.id === req.body.id);
    if (student) {
        clearFiles([student.photo, student.celebration_photo]);
        data = data.filter(item => item.id !== req.body.id);
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        res.send("Deleted");
    } else res.status(404).send("Not found");
});

app.listen(3000, () => {
    console.log("SERVER RUNNING ON PORT 3000");
});