FROM node:buster-slim

ARG SEARXNG_API_URL
ENV SEARXNG_API_URL=${SEARXNG_API_URL}

WORKDIR /home/jupyter

COPY src /home/jupyter/src
COPY tsconfig.json /home/jupyter/
COPY config.default.toml /home/jupyter/config.toml
COPY package.json /home/jupyter/
COPY package-lock.json /home/jupyter/

RUN sed -i "s|SEARXNG = \".*\"|SEARXNG = \"${SEARXNG_API_URL}\"|g" /home/jupyter/config.toml

RUN npm install
RUN npm run build

CMD [ "npm","start" ]