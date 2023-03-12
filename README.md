# IusR – Server

Backend for the IusR open source code learning platform.

Project structure is oriented on this tutorial: https://www.youtube.com/watch?v=GHTA143_b-s

## Project Setup

### Development Environment

1. run `npm install` from root directory
2. run `npx prisma migrate dev` to setup SQLite DB
3. run `npm run start:dev` to run development server

### Production Environment

TODO

## Useful Commands During Development

`npx prisma migrate dev` applies changes made in the prisma schema to the database  
`nest generate module/controller/service NAME --no-spec` creates module or controller oder service without test file
`npx prisma studio --browser=none` launch GUI for the DB

## Techstack

**Framework:** Nest.js, https://docs.nestjs.com/  
**ORM:** Prisma, https://www.prisma.io/docs  
**Database:** SQLite, DB will be created inside the /prisma folder
