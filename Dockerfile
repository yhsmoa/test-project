FROM node:lts-alpine

# 환경 설정
ENV NODE_ENV=production
ENV PORT=5000
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

# 작업 디렉토리 생성 및 변경
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 패키지 설치 (프로덕션 모드)
RUN npm ci --only=production

# 소스 코드 복사
COPY . ./

# 앱 빌드
RUN npm run build

# uploads 디렉토리 생성
RUN mkdir -p uploads && chmod 777 uploads

# 포트 노출
EXPOSE 5000

# 서버 실행 (Caddy가 아닌 Express 서버 실행)
CMD ["node", "server.js"] 