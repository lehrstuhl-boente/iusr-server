# IusR – Server

Backend for an open source code learning platform.

Project structure based on this tutorial: https://www.youtube.com/watch?v=GHTA143_b-s

## Project Setup

### Development Environment

1. run `npm install` from root directory
2. copy .env.example, save it as .env and change the values if needed
3. run `npx prisma migrate dev` to setup SQLite DB
4. run `npm run start:dev` to run development server

### Production Environment

TODO

## Useful Commands During Development

- `npx prisma migrate dev` applies changes made in the prisma schema to the database  
- `nest generate module/controller/service NAME --no-spec` creates module or controller or service without test file
- `npx prisma studio --browser=none` launch database GUI

## Techstack

**Framework:** Nest.js, https://docs.nestjs.com/  
**ORM:** Prisma, https://www.prisma.io/docs  
**Database:** SQLite, DB will be created inside the /prisma folder
