# Kurento Many To Many

> WebRTC Protocol Using the Kurento Media Server <br>
> JS code for Nodejs environment based on the Kurento java example code 


### Progress
* 23/08/09 Translated Java code into JS code

### Desc
* 이 예제는 Kurento Media 서버와 통신하기 위한 Backend Application 입니다.
  <br> (Front code 포함)
* Kurento 예제에는 JS 용 N:N 코드가 존재하지 않아 만들었습니다.
* Kurento 자바 예제를 NodeJs 용으로 번역만 진행하였기 때문에,<br>
  흐름 파악용으로만 사용해주시기 바랍니다.
* 추후 리팩토링을 할 생각이며, NodeJS 공부 추가적으로 진행 후 작업할 예정입니다.


### Before
* 쿠렌토 미디어서버를 실행해야합니다. 아래 링크를 참고해주세요. <br>
  https://doc-kurento.readthedocs.io/en/latest/user/installation.html

#### 도커 실행 방법
* 도커 이미지 설치
```
docker pull kurento/kurento-media-server:7.0.0
```
* 도커 이미지 실행 (별도 STUN/TURN Server 구성 X)
```
docker run --rm \
    -p 8888:8888/tcp \
    -p 5000-5050:5000-5050/udp \
    -e KMS_MIN_PORT=5000 \
    -e KMS_MAX_PORT=5050 \
    kurento/kurento-media-server:7.0.0
```
& 별도의 STUN/TURN Server 구성 시, 추가적인 Config 설정 작업이 필요합니다.