import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import "./envConfig";
import * as schema from "./schema";

export const db = drizzle(sql, { schema });
