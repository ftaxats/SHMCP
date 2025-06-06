FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install 
RUN npm install

# Copy application cod
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8000

# Start the serve
CMD ["node", "dist/index.js"] 