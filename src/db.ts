import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
})

export const getConnection = async () => {
  const connection = await pool.getConnection()
  console.log(`[DB] Connected to ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USER}`)
  return connection
}
