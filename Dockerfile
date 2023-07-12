FROM node:18.14-buster as prod
EXPOSE 3001
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN chown -R node /app
USER node
CMD ["node", "dist/main.js"]