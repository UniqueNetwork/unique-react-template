FROM node:lts AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/build /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        expires -1; \
        add_header \"Cache-Control\" \"no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0\"; \
        root /usr/share/nginx/html; \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
