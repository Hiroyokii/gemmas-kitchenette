# Gemma's Kitchenette

A web-based **Food Management and Ordering System** developed for **Gemma's Kitchenette**, a local carinderia in Punta I, Tanza, Cavite.

The system provides a centralized platform for managing daily food preparation, menu availability, ingredient inventory, purchases, customer orders, and sales monitoring.

## Production Deployment

The production layout uses Vercel for the Vite client, a Docker-capable application host for the Express API, and Supabase for PostgreSQL. Vercel does not run the API's Docker image; deploy the `server` image to a container host and point the Vercel client at its public HTTPS URL.

### Supabase database

1. Create a Supabase project and open **Project Settings → Database → Connection string**.
2. Set `DATABASE_URL` to Supabase's **session pooler** connection string for the long-running Docker API, and `DIRECT_URL` to the direct database connection string for Prisma migrations. If direct connectivity is unavailable on your network, the session pooler can also be used for `DIRECT_URL`. Add `?schema=public` if the URL does not already specify a schema. Keep both values private.
3. The API container runs `prisma migrate deploy` and the idempotent seed on startup, applying checked-in migrations and initial roles/catalog data.

### Docker API

Build and deploy the `server` directory as the Docker build context. Configure these environment variables on the container host:

- `DATABASE_URL` and `DIRECT_URL` from Supabase
- `JWT_SECRET` as a long, random secret
- `FRONTEND_URL` as the deployed Vercel origin, such as `https://your-project.vercel.app`
- `NODE_ENV=production`
- `PORT` if required by the host (the API defaults to `5000`)

The container applies migrations and then starts the compiled Express server. Keep the database and JWT values in the host's secret manager rather than in the image or repository.

### Vercel client

Import the repository into Vercel and set the project **Root Directory** to `client`. Use `npm run build` as the build command and `dist` as the output directory, then deploy. Production API calls use the same-origin `/api` route, which `client/vercel.json` proxies to the Render API. Local development continues to use `VITE_API_URL` (for example, `http://localhost:5000`).

The Vercel proxy keeps the refresh-token cookie first-party in the browser. Production cookies use `SameSite=Lax; Secure` with the `/` path so they work through both the proxy and direct API routes. The short-lived access JWT is kept in tab-scoped `sessionStorage` and refreshed using the HttpOnly cookie. Keep `FRONTEND_URL` set to the deployed Vercel origin, especially if you use other API clients that call Render directly.

### Food image uploads

Food images are uploaded by the API to Supabase Storage; they are not stored on the Render filesystem. In Supabase Storage, create a public bucket named `food-images`, limit it to 5 MB per object, and allow only `image/jpeg`, `image/png`, and `image/webp`. Public access lets visitors see menu images without signing in. Add `SUPABASE_URL` and a server-only `SUPABASE_SECRET_KEY` to the Render service environment. Keep the secret key out of Vercel and source control. `SUPABASE_FOOD_BUCKET` is optional and defaults to `food-images`.

### Local Docker Compose

`docker compose up --build` remains a local development setup with a local PostgreSQL container. Production uses Supabase and the standalone API image described above; do not expose the local Compose database publicly.

## Overview

Gemma's Kitchenette currently handles customer orders and business operations through manual processes. This system was developed to help organize these activities through a web-based application.

The system supports two user roles:

- **Customer** – browses the daily menu, places orders, and tracks orders.
- **Admin** – manages foods, recipes, inventory, purchases, menus, users, orders, and reports.

## Features

### Customer

- User registration and login
- Browse today's menu
- View food details
- View food ratings and reviews
- Add food to cart
- Place pickup or delivery orders
- Choose Cash on Delivery (COD) or simulated GCash payment
- Track order status
- View order history
- View order details
- Submit feedback and ratings for completed orders

### Admin

- Dashboard
- Food management
- Food category management
- Recipe management
- Ingredient inventory management
- Purchase recording
- Daily menu preparation
- Order management
- Order history
- Sales reports
- Inventory monitoring
- Expiration monitoring
- Spoilage and waste tracking
- User management

## Order Management

The system manages customer orders throughout the order processing workflow.

### Order Status

```text
PENDING
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
OUT_FOR_DELIVERY
   ↓
COMPLETED
```
