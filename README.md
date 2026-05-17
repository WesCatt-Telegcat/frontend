# Frontend

## Local development

```bash
npm install
npm run dev
```

Default local URL:

- App: `http://localhost:2616`
- API: `http://localhost:2617`

Use these env files as templates:

- [`.env.example`](./.env.example)
- [`.env.development.example`](./.env.development.example)
- [`.env.production.example`](./.env.production.example)

## Docker deployment

The frontend is configured for Next.js `standalone` output and can be deployed with Docker directly.

### Server files

If `chat-frontend/` itself is the deployment root on the server, keep:

- `docker-compose.yml`
- `.env.production`
- `Dockerfile`
- `.dockerignore`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `components.json`
- `public/`
- `src/`

### Build image

```bash
docker build -t telecat-frontend:latest .
```

### Run container

```bash
docker run -d \
  --name telecat-frontend \
  -p 2616:2616 \
  telecat-frontend:latest
```

### Server-side note

`NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_BASE_URL` are read from `.env.production` during image build.  
If you deploy to another domain, update `.env.production` and rebuild.

### Reverse proxy

If you put Nginx, Caddy, or Traefik in front of the container, proxy traffic to:

- `http://127.0.0.1:2616`

## Docker Compose

Create `.env.production`:

```env
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Then start:

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

## Server Deploy Command

Run this in the `frontend` project root on the server:

```bash
docker compose up -d --build
```
