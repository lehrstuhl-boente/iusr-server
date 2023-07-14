# IusR – Server

Backend for an open source code learning platform.

Project structure based on this tutorial: https://www.youtube.com/watch?v=GHTA143_b-s

## Project Setup / Development Environment

### Setup Git and clone project

At the moment, there exist two repositories for this project, one on GitHub and one on GitLab. The GitHub repository is the official one, the GitLab repo is only used for deployment. We always push to both repos but only pull from the GitHub repo.

1. run `git clone git@github.com:lehrstuhl-boente/iusr-server.git`, this sets the pull remote to GitHub
2. run `git remote set-url origin --push --add git@gitlab.com:rwf-dev/lstboente/iusr-server.git`
3. run `git remote set-url origin --push --add git@github.com:lehrstuhl-boente/iusr-server.git`

### Setup MariaDB

A development database is required so that Prisma can create the necessary migration files.

1. install MariaDB with Homebrew (macOS: run `brew install mariadb`)
2. start MySQL server, usually runs on port 3306 (run `mysql.server start`)
3. access database as root user (run `sudo mysql -u root`)
4. create new user for the application (use needs to have privilege to create new databases, see [here](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#shadow-database-user-permissions) why)
   - run `CREATE USER 'iusr'@localhost IDENTIFIED BY '123456';` to create user with username iusr and password 123456
   - run `GRANT ALL PRIVILEGES ON *.* TO 'iusr'@localhost IDENTIFIED BY '123456';` to grant all privileges to all databases, user can also create new databases

### Setup judge0

**Note: at the moment (July 2023), judge0 doesn't work properly on Apple Silicon and needs Ubuntu 20.04**

1. follow the deployment procedure: https://github.com/judge0/judge0/blob/master/CHANGELOG.md#deployment-procedure
2. adjust the judge0 URL in the .env file

### Setup Nest.js Application

1. run `npm install` from root directory
2. copy .env.example, save it as .env and change the values if needed (especially change DATABASE_URL to match the local username, password and database name)
3. run `npx prisma migrate dev` to apply the Prisma ORM schema to the DB
4. run `npm run start:dev` to run development server

## Deployment

### 1st Step: Deploy Database Changes (if necessary)

1. make sure you have run `npx prisma migrate dev` on the development database so that all necessary migration files exist
2. make a backup of the production database
   1. login on https://mariadb.uzh.ch/
   2. navigate to the tab "Exportieren"
   3. select SQL as format and click OK
3. change the database URL in the .env file temporarily to the production URL
4. run `npx prisma migrate deploy` (it's likely that some changes need to be applied by hand, check out https://www.prisma.io/docs/guides/migrate/production-troubleshooting when running into problems)
5. change the database URL in the .env file back to the development URL

### 2nd Step: Deploy Code Changes

1. make a change to the repository code
2. push the change (make sure it is properly pushed to the master branch of the GitLab repository)
3. build and push the docker image via GitLab pipeline **(option1, preferred)**
   1. go to https://gitlab.com/rwf-dev/lstboente/iusr-server/-/pipelines
   2. click "Run Pipeline"
   3. make sure the master branch is selected and click "Run Pipeline" again
4. build and push the docker image locally **(option2, may not work on all machines, e.g. Mac)**
   1. run `docker-compose build`
   2. run `docker-compose push`
5. from this point, the [RWI Informatik](https://rwi.app/team) team takes over

## Useful Commands During Development

- `npx prisma migrate dev` applies changes made in the prisma schema to the database
- `nest generate module/controller/service NAME --no-spec` creates module or controller or service without test file
- `npx prisma studio --browser=none` launch database GUI

## Techstack

**Node Version:** 18.14  
**Framework:** Nest.js, https://docs.nestjs.com/  
**ORM:** Prisma, https://www.prisma.io/  
**Database:** MariaDB, https://mariadb.org/
