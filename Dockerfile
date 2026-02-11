FROM node:20-alpine

WORKDIR /app

# Install full dependencies (build + runtime)
COPY package.json package-lock.json ./
RUN npm install

# Copy full project
COPY . .

# Build Strapi admin
ENV NODE_ENV=production
RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]

