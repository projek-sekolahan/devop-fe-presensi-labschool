const express = require("express");
const path = require("path");
const helmet = require("helmet");

const app = express();

// Middleware keamanan (Helmet)
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    })
);

// Middleware untuk file statis
app.use(express.static(path.join(__dirname, "build")));

// Middleware untuk memblokir folder sensitif
app.use((req, res, next) => {
    const forbiddenPaths = ["src", "node_modules", "config", "env", "logs", "private"];
    const requestedPath = req.url.split("/")[1];
    if (forbiddenPaths.includes(requestedPath)) {
        return res.status(403).send("Forbidden");
    }
    next();
});

// Middleware untuk memblokir file sensitif
app.use((req, res, next) => {
    const forbiddenExtensions = [".env", ".json", ".lock", ".log", ".bak", ".old", ".config", ".xml", ".sh"];
    if (forbiddenExtensions.some((ext) => req.url.endsWith(ext))) {
        return res.status(403).send("Forbidden");
    }
    next();
});

// Middleware untuk caching
app.use((req, res, next) => {
    const cacheControl = {
        "/index.html": "no-cache, no-store, must-revalidate",
        default: "public, max-age=31536000",
    };
    const cacheHeader = cacheControl[req.url] || cacheControl.default;
    res.setHeader("Cache-Control", cacheHeader);
    next();
});

// Middleware untuk membatasi ukuran request
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Arahkan semua permintaan ke index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
