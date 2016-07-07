'use strict';

const express = require('express');
const os = require('os');
const humanize = require('humanize');
const app = express();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send(`Served by ${os.hostname()} at ${new Date().toUTCString()}.`);
});

app.get('/details', (req, res) => {
  res.json({
    hostname: os.hostname(),
    arch: os.arch(),
    platfoirm: os.platform(),
    cpus: os.cpus().length,
    totalmem: humanize.filesize(os.totalmem()),
    networkInterfaces: os.networkInterfaces()
  });
});

app.get('/status/:code(\\d+)', (req, res) => {
  const statusCode = parseInt(req.params.code);
  res.status(statusCode).json({
    status: statusCode,
    message: `Forced status ${statusCode}`
  });
});

app.listen(port, () => {
	console.log(`Listening on port ${port}.`);
});
