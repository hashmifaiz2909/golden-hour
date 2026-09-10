FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY shared ./shared

RUN npm install --workspace=apps/web

COPY apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npx", "vite", "--port", "3000", "--host"]
