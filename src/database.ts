import { Database } from "bun:sqlite";

export const DATABASE_PATH = process.env["HOME"] + "/.local/share/tin/data.db";
export const db_ = new Database(DATABASE_PATH);
