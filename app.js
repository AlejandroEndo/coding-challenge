const express = require('express');
const sqlite = require('sqlite3').verbose();
const cache = require('memory-cache');
const PORT = process.env.PORT || 3128;
const app = express();

let memCache = new cache.cache();

let cacheMiddleware = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url;
        let cacheContent = memCache.get(key);
        if (cacheContent) return res.send(cacheContent);
        else {
            res.sendResponse = res.send;
            res.send = (body) => {
                memCache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

app.get('/products', (req, res) => {
    setTimeout(() => {
        let db = new sqlite.Database('./NodeInventory.db');
        let sql = `SELECT * FROM products`;

        db.all(sql, [], (err, rows) => {
            if (err) throw err;
            db.close();
            res.send(rows);
        });
    }, 3000);
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});