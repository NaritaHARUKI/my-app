import mysql from 'mysql2/promise'
import 'dotenv/config'

console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_USER:', process.env.DB_USER)

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
})

export const getConnection = async () => {
  const connection = await pool.getConnection()
  console.log("Connecting with user:", process.env.DB_USER)
  console.log(`[DB] Connected to ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USER}`)
  return connection
}
