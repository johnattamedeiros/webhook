
const express = require('express');
const dotenv = require('dotenv');
const { exec } = require('child_process');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.get('/webhook', (req, res) => {
    res.status(200).send({ status: 'Responding' });
});

app.post('/webhook/app', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = req.body;

    if (!signature || signature !== `sha256=${GITHUB_TOKEN}`) {
        return res.status(401).send('Invalid token');
    }

    if (payload.ref === 'refs/heads/main') {
        exec('./run_script_back.sh', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing script: ${stderr}`);
                return res.status(500).send('Error executing script');
            }
            console.log(`Script output: ${stdout}`);
            res.status(200).send('Script executed successfully');
        });
    } else {
        res.status(200).send('Not the main branch');
    }
});
app.post('/webhook/front', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = req.body;

    if (!signature || signature !== `sha256=${GITHUB_TOKEN}`) {
        return res.status(401).send('Invalid token');
    }

    if (payload.ref === 'refs/heads/main') {
        exec('./run_script_front.sh', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing script: ${stderr}`);
                return res.status(500).send('Error executing script');
            }
            console.log(`Script output: ${stdout}`);
            res.status(200).send('Script executed successfully');
        });
    } else {
        res.status(200).send('Not the main branch');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
