FROM oven/bun:alpine AS builder
WORKDIR /app

# RUN apt update && apt install python3 python3-pip make g++ gcc  -y
RUN apk add --no-cache python3 py3-pip make g++ \
    && ln -sf python3 /usr/bin/python \
    && ln -sf pip3 /usr/bin/pip

COPY bun.lock package.json  ./
COPY patches ./patches
RUN bun install --frozen-lockfile --verbose

COPY . .


RUN bun run build ./subscriber/index.ts --outdir ./subscriber_build



FROM builder AS deployer

WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
COPY --from=builder /app/bun.lock .


ENV NODE_ENV=production


CMD ["bun", "./subscriber_build"]
