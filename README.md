# IusR – Server

Backend for an open source code learning platform.

Project structure based on this tutorial: https://www.youtube.com/watch?v=GHTA143_b-s

## Project Setup

### Development Environment

#### Setup Git and clone project

At the moment, there exist two repositories for this project, one on GitHub and one on GitLab. The GitHub repository is the official one, the GitLab repo is only used for deployment. We always push to both repos but only pull from the GitHub repo.

1. run `git clone git@github.com:lehrstuhl-boente/iusr-server.git`, this sets the pull remote to GitHub
2. run `git remote set-url origin --push --add git@gitlab.com:rwf-dev/lstboente/iusr-server.git`
3. run `git remote set-url origin --push --add git@github.com:lehrstuhl-boente/iusr-server.git`

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

#### Docker

Build Docker container: `docker-compose build`  
Run Docker container: `docker-compose up`

## Useful Commands During Development

- `npx prisma migrate dev` applies changes made in the prisma schema to the database
- `nest generate module/controller/service NAME --no-spec` creates module or controller or service without test file
- `npx prisma studio --browser=none` launch database GUI

## Techstack

**Node Version:** 18.14  
**Framework:** Nest.js, https://docs.nestjs.com/  
**ORM:** Prisma, https://www.prisma.io/docs  
**Database:** SQLite, DB will be created inside the /prisma folder
