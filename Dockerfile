# Journey — Production Docker Image
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY server/package.json server/package-lock.json* ./
RUN npm install --production

# Copy server code
COPY server/ ./

# Copy frontend static files
COPY *.html *.css *.js ./
COPY pages/ ./pages/
COPY components/ ./components/

EXPOSE 3001

CMD ["node", "index.js"]
