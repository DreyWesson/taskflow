FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# The key change is here - passing the --host flag to make Vite accessible
CMD ["npm", "run", "dev", "--", "--host"]