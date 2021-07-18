FROM node:12

WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force
RUN npm install

COPY . .

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run" ,"watch"]
