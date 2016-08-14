"use strict";
// A small HTTP server to run the show

const Canvas = require("canvas");
const fs = require("fs");
const GIFEncoder = require("gifencoder");
const http = require("http");

const createPainter = require("./painter.js");

const port = process.env["PORT"] || 3000;

const staticAssets = new Set([
    "index.html",
    "script.js",
    "style.css",
    "painter.js",
]);

http.createServer((req, res) => {
    let resource = req.url.slice(1);
    if (resource === "") {
        resource = "index.html";
    }

    if (staticAssets.has(resource)) {
        return fs.createReadStream(resource).pipe(res);
    }

    if (/^gif\//.test(resource)) {
        return sendGif(resource, res);
    }

    res.end("Resource not found: " + resource);
}).listen(port, () => {
    console.log("Listening on http://localhost:" + port)
});

function sendGif(path, res) {
    // Get rid of the gif/
    const b64 = path.slice(4);

    // Parse the base64-encoded grid
    const grid = JSON.parse(new Buffer(b64, "base64").toString("ascii"));

    // Build the canvas and gifencoder context
    const width = 800;
    const height = 800;

    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext("2d");
    const encoder = new GIFEncoder(width, height);

    encoder.createReadStream().pipe(res);

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(100);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // Initialize a painter
    const painter = createPainter(grid, ctx);

    for (let i = 0; i < painter.NUM_FRAMES; i++) {
        console.log(`Adding frame ${i+1}...`);
        painter.drawGrid(i, width, height);
        encoder.addFrame(ctx);
    }

    encoder.finish();
    console.log("GIF sent! :)\n");
}
