# Production Node.js container for CodeSense AI
FROM node:20-slim

WORKDIR /app

# Install curl for health checks if needed
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install dependencies cleanly
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]

