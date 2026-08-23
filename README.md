# EDUCATION MANAGEMENT SYSTEM (SERVICE)

```bash
git clone https://github.com/yudhaginongpratidina/education-management-system-backend.git
```

## REQUIREMENTS

- [Node JS](https://nodejs.org/en/download/)
- [Bun](https://bun.sh/install)

## LOCAL SETUP

```bash
# ---------------------------------------------------------------------------
# 01 - CLONE REPOSITORY
# ---------------------------------------------------------------------------
git clone https://github.com/yudhaginongpratidina/education-management-system-backend.git
cd education-management-system-backend

# ---------------------------------------------------------------------------
# 02 - INSTALL DEPENDENCIES
# ---------------------------------------------------------------------------
bun install

# ---------------------------------------------------------------------------
# 03 - HOW TO RUN APPLICATION
# ---------------------------------------------------------------------------
bun run dev

# ---------------------------------------------------------------------------
# 04 - HOW TO ACCESS APPLICATION
# ---------------------------------------------------------------------------
open on browser or postman with url http://<hostname>:<port>
```

## DOCKER

```bash
docker build -t devyudhaginongpratidina140/ems-service:1.0.0 .
docker run -p 4000:4000 \
  -e APP_NAME='EMS SERVICE' \
  -e APP_VERSION=1.0.0 \
  -e NODE_ENV=production \
  -e APP_HOST=0.0.0.0 \
  -e APP_PORT=4000 \
  -e CORS_ORIGINS=http://localhost:3000 \
  -e JWT_ACCESS_TOKEN_SECRET=your_jwt_secret \
  -e JWT_ACCESS_TOKEN_EXPIRY='60m' \
  -e JWT_ISSUER=your-app-name \
  -e JWT_AUDIENCE=your-app-users \
  -e JWT_ALGORITHM=HS256 \
  -e LOG_LEVEL=info \
  -e DB_MAIN_ENGINE=mysql \
  -e DB_MAIN_HOST=your_db_host \
  -e DB_MAIN_PORT=3306 \
  -e DB_MAIN_USERNAME=your_db_user \
  -e DB_MAIN_PASSWORD=your_db_password \
  -e DB_MAIN_DATABASE=your_db_name \
  -d devyudhaginongpratidina140/ems-service:1.0.0
```