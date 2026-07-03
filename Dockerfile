FROM node:22-alpine

WORKDIR /workspace

RUN apk add --no-cache docker-cli
RUN corepack enable

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

COPY . .

RUN pnpm run build

ENV NODE_ENV=production
ENV HEADMASTER_PORT=41869
ENV HEADMASTER_HOST=0.0.0.0

EXPOSE 41869

CMD ["node", ".output/server/index.mjs"]
