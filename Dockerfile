FROM node:16-alpine AS builder

ARG DB_URL
ENV DATABASE_URL=${DB_URL}

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn generate

RUN yarn build

FROM node:16-alpine as runner

ARG DB_URL

ENV PORT=8080
ENV NODE_ENV=production
ENV DATABASE_URL=${DB_URL}
ENV JWT_SECRET=secret

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY ./prisma ./prisma

RUN yarn generate

COPY --from=builder /app/dist ./dist

EXPOSE ${PORT}

CMD ["yarn", "start"]

