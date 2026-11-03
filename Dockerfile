FROM node:24-bookworm-slim
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG BACKEND_API_URL=http://hris-backend:3000
ENV BACKEND_API_URL=${BACKEND_API_URL}
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
