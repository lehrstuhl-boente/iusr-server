# https://notiz.dev/blog/dockerizing-nestjs-with-prisma-and-postgresql

FROM node:18.14-buster as builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm install --target_arch=x64 --target_platform=linux --target_libc=glibc
COPY . .
RUN npm run build

FROM node:18.14-buster as prod
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R node /app 
USER node
#RUN mkdir -p assetstore/public_files
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json /app/package-lock.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]