FROM thyrlian/android-sdk:latest

COPY . /app

RUN mkdir /result

WORKDIR /app

RUN chmod -R 777 .

CMD ./gradlew assembleDebug && cp -r "/app/app/build/outputs/apk/debug" "/result/"
