FROM node:lts

WORKDIR /
COPY . .
RUN yarn install

CMD ["yarn", "start"]
