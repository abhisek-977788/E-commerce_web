# Wistoria

Wistoria is a full-stack e-commerce platform with a Vite React frontend and an Express/MongoDB backend.

## Production URLs

- Frontend: `https://wistoria-abhisek-patels-projects.vercel.app`
- Smartphone showcase: `https://wistoria-abhisek-patels-projects.vercel.app/products?category=smartphones`
- Backend API: `https://wistoria-qq9f.onrender.com`
- API health check: `https://wistoria-qq9f.onrender.com/api/health`

## Repository Structure

- `client/` - Vite React app deployed to Vercel
- `server/` - Express API deployed to Render
- `render.yaml` - Render Blueprint for the API service
- `.env.example` - production environment variable template

## Frontend Deployment: Vercel

1. Import the GitHub repository into Vercel.
2. Set the Vercel project name to `wistoria`.
3. The repository root is supported by `vercel.json`. You may also set the project root directory to `client` and use `client/vercel.json`.
4. If using the repository root, use these build settings:
   - Framework preset: `Vite`
   - Install command: `npm ci --prefix client`
   - Build command: `npm run build --prefix client`
   - Output directory: `client/dist`
5. If using `client` as the root directory, use these build settings:
   - Framework preset: `Vite`
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Output directory: `dist`
6. Add production environment variables:
   - `VITE_API_URL=https://wistoria-qq9f.onrender.com/api`
   - `VITE_API_BASE_URL=https://wistoria-qq9f.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID=<your Razorpay key id>`
7. Enable GitHub auto-deploys for the `main` branch.
8. Assign an available production domain.

The SPA fallback is configured in `client/vercel.json` so direct route visits work in production.

## Backend Deployment: Render

1. Create a new Render Blueprint or Web Service from this repository.
2. Use the service name `wistoria-api`.
3. If creating manually, use:
   - Root directory: `server`
   - Runtime: `Node`
   - Build command: `npm ci`
   - Start command: `npm start`
   - Health check path: `/api/health`
4. Add production environment variables:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://wistoria-abhisek-patels-projects.vercel.app`
   - `FRONTEND_URL=https://wistoria-abhisek-patels-projects.vercel.app`
   - `MONGODB_URI=<MongoDB Atlas connection string>`
   - `DATABASE_URL=<same MongoDB Atlas connection string, optional fallback>`
   - `JWT_SECRET=<strong random secret>`
   - `JWT_EXPIRES_IN=7d`
   - `RAZORPAY_KEY_ID=<server Razorpay key id>`
   - `RAZORPAY_KEY_SECRET=<server Razorpay key secret>`
   - `CLOUDINARY_CLOUD_NAME=<optional>`
   - `CLOUDINARY_API_KEY=<optional>`
   - `CLOUDINARY_API_SECRET=<optional>`
5. Enable automatic deploys from the `main` branch.

`render.yaml` contains the deployment-ready Render service definition.

## MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with a strong password.
3. Add Render outbound access to Atlas. For quick setup, allow `0.0.0.0/0`; for stricter production, use Atlas access controls that match Render's documented outbound networking.
4. Use the connection string as `MONGODB_URI` on Render.
5. Seed initial products from the backend root if needed:

```bash
npm run seed
```

## Local Development

Install dependencies:

```bash
cd client
npm ci

cd ../server
npm ci
```

Run the API:

```bash
cd server
npm run dev
```

Run the frontend:

```bash
cd client
npm run dev
```

Use `client/.env.example` and `server/.env.example` as templates for local secrets.

## Verification Checklist

- `GET /api/health` returns success from Render.
- Vercel frontend loads without console CORS errors.
- Register and login return a JWT and persist the user session.
- Products, cart, orders, wishlist, profile, and admin dashboard routes can call the API.
- Razorpay checkout uses the public `VITE_RAZORPAY_KEY_ID` on the client and verifies with server-side `RAZORPAY_KEY_SECRET`.
- `.env`, `node_modules`, `dist`, logs, and cache files remain untracked.
