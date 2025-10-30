# Step 1: Use Node.js official image
FROM node:18

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy project files
COPY . .

# Step 6: Expose backend port
EXPOSE 5000

# Step 7: Run the app
CMD ["npm", "run", "dev"]
