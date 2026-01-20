# Backend API – Node.js + TypeScript + Prisma

This is a backend service built using **Node.js**, **TypeScript**, **Prisma ORM**, **MySQL**, and **Nodemailer** for email services.  
It provides a clean, scalable foundation for modern backend applications.

---

## 🛠 Tech Stack

- Node.js
- TypeScript
- Prisma ORM
- MySQL
- Nodemailer
- dotenv

---

## 📦 Installation & Setup
Install dependencies using one of the following commands:

npm install or npm install --legacy-peer-deps

## Environment Variables

Create a .env file in the root directory.

.env
DATABASE_URL="mysql://root:root@localhost:3306/database_name"

| Field    | Value         |
| -------- | ------------- |
| Username | root          |
| Password | root          |
| Host     | localhost     |
| Port     | 3306          |
| Database | database_name |

## Prisma Setup
npx prisma generate

## Run Database Migrations
npx prisma migrate dev --name migration_name

## Running the Server
npm run dev