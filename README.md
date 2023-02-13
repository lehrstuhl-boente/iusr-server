# IusR – Server

Backend for the IusR open source code learning platform.

## Project Setup

### Development Environment

1. run `npm install` from root directory
2. run `npx prisma migrate dev` to setup SQLite DB
3. run `npm run start:dev` to run development server
4. optional: run `npx prisma studio` to launch GUI for the DB

### Production Environment

TODO

## Techstack

**Framework:** Nest.js, https://docs.nestjs.com/  
**ORM:** Prisma, https://www.prisma.io/docs  
**Database:** SQLite, DB will be created inside the /prisma folder
