# 엑셀 데이터 MongoDB 업로더

이 프로젝트는 엑셀 파일의 특정 열(C, K, L)을 MongoDB에 업로드하는 웹 애플리케이션입니다.

## 기능

- 엑셀 파일 업로드 기능
- 엑셀 파일에서 C, K, L 열의 데이터 추출
- MongoDB Atlas에 데이터 저장
- 실시간 업로드 상태 표시

## 기술 스택

- Frontend: React, Styled-Components
- Backend: Node.js, Express
- 데이터베이스: MongoDB Atlas
- 라이브러리: xlsx, mongoose, multer

## 설치 및 실행 방법

1. 저장소 복제하기
```
git clone https://github.com/yhsmoa/test-project.git
cd test-project
```

2. 패키지 설치하기
```
npm install
```

3. 개발 모드로 실행하기
```
npm run dev
```

이 명령어는 React 클라이언트와 Express 서버를 동시에 실행합니다.

## 환경 변수

MongoDB 연결 정보는 server.js 파일에 직접 포함되어 있습니다. 보안을 위해 실제 배포 환경에서는 환경 변수를 사용하는 것이 좋습니다.

## 데이터 형식

업로드된, 다음과 같은 구조로 MongoDB에 저장됩니다:
- c_orderName: C열 데이터
- k_productName: K열 데이터
- l_optionName: L열 데이터 