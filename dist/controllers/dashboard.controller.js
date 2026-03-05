"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = getSummary;
const pool_1 = require("../db/pool");
const dashboard_repo_1 = require("../repositories/dashboard.repo");
async function getSummary(req, res) {
    const client = await pool_1.pool.connect();
    try {
        const summary = await (0, dashboard_repo_1.getDashboardSummary)(client);
        res.json(summary);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=dashboard.controller.js.map