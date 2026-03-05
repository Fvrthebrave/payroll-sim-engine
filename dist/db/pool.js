"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL
});
exports.pool.on("connect", () => {
    console.log('Connected to Postgres');
});
exports.pool.on("error", err => {
    console.error("Unexpected Postgres error", err);
});
//# sourceMappingURL=pool.js.map