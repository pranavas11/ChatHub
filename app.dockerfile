FROM node:buster-slim

ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

WORKDIR /home/jupyter

COPY ui /home/jupyter/

RUN npm install
RUN npm run build

CMD ["npm","start"]