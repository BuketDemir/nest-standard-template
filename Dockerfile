FROM node:latest As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g npm@8.5.4

RUN npm install --only=development

COPY . .


RUN npm run build

FROM node:latest as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}


ARG github_token
RUN git config --global http.extraheader "PRIVATE-TOKEN: ${github_token}"
RUN git config --global url."https://${github_token}:x-oauth-basic@github.com/".insteadOf "https://github.com/"

WORKDIR /usr/src/app

COPY package*.json ./

# Error
RUN npm install -g npm@8.5.4

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
