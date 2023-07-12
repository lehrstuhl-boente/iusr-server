# IusR – Server

Backend for an open source code learning platform.

Project structure based on this tutorial: https://www.youtube.com/watch?v=GHTA143_b-s

## Project Setup

### Development Environment

#### Setup MariaDB

1. install MariaDB with Homebrew (macOS: run `brew install mariadb`)
2. start MySQL server, usually runs on port 3306 (run `mysql.server start`)
3. access database as root user (run `sudo mysql -u root`)
4. create new user for the application (use needs to have privilege to create new databases, see [here](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#shadow-database-user-permissions) why)
   - run `CREATE USER 'iusr'@localhost IDENTIFIED BY '123456';` to create user with username iusr and password 123456
   - run `GRANT ALL PRIVILEGES ON *.* TO 'iusr'@localhost IDENTIFIED BY '123456';` to grant all privileges to all databases, user can also create new databases

#### Setup judge0

TODO

#### Setup Nest.js Application

1. run `npm install` from root directory
2. copy .env.example, save it as .env and change the values if needed (especially change DATABASE_URL to match the local username, password and database name)
3. run `npx prisma migrate dev` to apply the Prisma ORM schema to the DB
4. run `npm run start:dev` to run development server

### Production Environment

Node.js Version 18.14

#### Docker

Build Docker image: `docker build -t iusr-server .`  
Run Docker container: `docker run -p 3001:3001 -e DATABASE_URL='' -e JWT_SECRET='...' -e JUDGE0_URL='...' iusr-server`

## Useful Commands During Development

- `npx prisma migrate dev` applies changes made in the prisma schema to the database
- `nest generate module/controller/service NAME --no-spec` creates module or controller or service without test file
- `npx prisma studio --browser=none` launch database GUI

## Techstack

**Framework:** Nest.js, https://docs.nestjs.com/  
**ORM:** Prisma, https://www.prisma.io/docs  
**Database:** SQLite, DB will be created inside the /prisma folder
