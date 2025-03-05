FROM oven/bun:alpine AS builder
WORKDIR /app

# RUN apt update && apt install python3 python3-pip make g++ gcc  -y
RUN apk add --no-cache python3 py3-pip make g++ \
    && ln -sf python3 /usr/bin/python \
    && ln -sf pip3 /usr/bin/pip

COPY bun.lock package.json  ./
COPY patches ./patches
RUN ls
RUN bun add @rocicorp/zero-sqlite3
RUN bun install --frozen-lockfile --verbose

COPY . .


# RUN ls
# RUN bun install --verbsoe
RUN bun run build



FROM builder AS deployer

WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
COPY --from=builder /app/bun.lock .
# COPY --from=builder /app/.env .

# COPY ./build/ ./build/
# COPY ./package.json .
# COPY ./bun.lock .
# COPY ./.env .

RUN ls

EXPOSE 3000
ENV NODE_ENV=production


CMD ["bun", "./build"]

# FROM node:22-alpine AS builder

# WORKDIR /app

# COPY package*.json .
# COPY pnpm-lock.yaml .

# RUN apk add --no-cache python3 py3-pip make g++ \
#     && ln -sf python3 /usr/bin/python \
#     && ln -sf pip3 /usr/bin/pip

# RUN npm i -g pnpm
# RUN pnpm install

# COPY . .

# RUN pnpm run build
# RUN pnpm prune --prod

# FROM builder AS deployer

# WORKDIR /app

# COPY --from=builder /app/build build/
# COPY --from=builder /app/package.json .

# EXPOSE 3000

# ENV NODE_ENV=production

# CMD [ "node", "build" ]