require("dotenv").config();
const fs=require("fs"),path=require("path");
const {Pool}=require("pg");
if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DB_SSL==="true"?{rejectUnauthorized:false}:false});
(async()=>{const sql=fs.readFileSync(path.join(__dirname,"..","db","schema.sql"),"utf8");await pool.query(sql);console.log("Base schema ready");await pool.end()})().catch(async e=>{console.error(e);try{await pool.end()}catch{}process.exit(1)});
