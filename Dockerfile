FROM oven/bun AS builder
WORKDIR /app

RUN apt update && apt install python3 python3-pip make g++ -y

# COPY bun.lock package.json patches  ./
COPY . .
RUN bun install --frozen-lockfile

RUN bun run build

FROM builder AS deployer

WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "build"]