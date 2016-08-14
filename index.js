"use strict";

const fs = require("fs");
const http = require("http");

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

    res.end("Resource not found: " + resource);
}).listen(port, () => {
    console.log("Listening on http://localhost:" + port)
});
