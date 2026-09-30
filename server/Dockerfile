FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
