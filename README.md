# UrbanStay

UrbanStay is a hotel reservation application with a React/Vite frontend, an Express API, and MongoDB persistence.

## Requirements

- Node.js 20 or newer
- MongoDB connection string

## Local development

1. Copy `Backend/.env.example` to `Backend/.env` and set `MONGO_URI` and a private `JWT_SECRET`.
2. Copy `Frontend/.env.example` to `Frontend/.env`.
3. Install and start the API:

   ```sh
   cd Backend
   npm ci
   npm run server
   ```

4. In a second terminal, install and start the web app:

   ```sh
   cd Frontend
   npm ci
   npm run dev
   ```

The local API runs on port 4000 and Vite runs on port 5173 by default.

## Production environment

Configure these values in the hosting provider's secret/environment settings. Do not commit `.env` files.

### Backend

- `NODE_ENV=production`
- `PORT` (provided by the host)
- `MONGO_URI` (production MongoDB connection string)
- `JWT_SECRET` (unique, randomly generated secret with at least 32 characters)
- `CORS_ORIGIN` (comma-separated exact frontend origins, for example `https://booking.example.com`)

### Frontend

- `VITE_BACKEND_URL` (public HTTPS URL of the deployed API)

Deploy the backend and frontend over HTTPS. Configure MongoDB network access for the backend host only, use a persistent/private image storage service for uploaded hotel images, and review database backups and retention policies before accepting real customer data.

## Validation

```sh
cd Backend
npm ci
```

```sh
cd Frontend
npm ci
npm run lint
npm run build
```

Online payment is not connected to a payment provider. Until a provider and verified webhook are configured, only pay-at-hotel reservations should be offered; never treat a client request as proof of payment.
