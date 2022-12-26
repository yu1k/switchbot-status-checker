FROM --platform=linux/x86_64 node:18.12-buster-slim

RUN apt-get update
RUN apt-get install -y locales git procps
RUN locale-gen ja_JP.UTF-8
RUN localedef -f UTF-8 -i ja_JP ja_JP

# env
ENV LANG=ja_JP.UTF-8
ENV TZ=Asia/Tokyo
ENV HOME=/home

WORKDIR $HOME/

COPY . $HOME/

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]