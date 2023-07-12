# https://notiz.dev/blog/dockerizing-nestjs-with-prisma-and-postgresql

FROM node:18.14-buster as builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build

FROM node:18.14-buster as prod
EXPOSE 3001
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R node /app
USER node
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]