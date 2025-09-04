FROM node:buster-slim

ARG SEARXNG_API_URL
ENV SEARXNG_API_URL=${SEARXNG_API_URL}

WORKDIR /home/chathub

COPY src /home/chathub/src
COPY tsconfig.json /home/chathub/
COPY config.default.toml /home/chathub/config.toml
COPY package.json /home/chathub/
COPY package-lock.json /home/chathub/

RUN sed -i "s|SEARXNG = \".*\"|SEARXNG = \"${SEARXNG_API_URL}\"|g" /home/chathub/config.toml

RUN npm install
RUN npm run build

CMD [ "npm","start" ]