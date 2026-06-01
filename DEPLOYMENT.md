# Customer Deployment

Use this file when you are already inside the `customer` folder. For full VPS setup from PuTTY, use `../DEPLOYMENT_HANDBOOK.md`.

## Environment

```bash
cp .env.example .env.production
nano .env.production
```

Production values:

```txt
VITE_API_BASE_URL=https://<API_DOMAIN>
VITE_SITE_URL=https://<CUSTOMER_DOMAIN>
```

Do not add `/api/v1`; customer endpoints already include `/api/v1`.

## Build

```bash
npm ci
npm run seo:sitemap
npm run build
```

Serve this folder with Nginx:

```txt
customer/dist
```

## Docker

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://<API_DOMAIN> \
  --build-arg VITE_SITE_URL=https://<CUSTOMER_DOMAIN> \
  -t ecommerce-customer .

docker run -p 8081:80 ecommerce-customer
```
