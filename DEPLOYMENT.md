# Deployment Guide - Multi-Agent AI SOC Portal

This guide provides instructions for deploying the Multi-Agent AI SOC system to production environments.

---

## 1. MongoDB Atlas Provisioning

1. Register or Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster (Free Tier) and select your preferred Cloud Provider and Region.
3. In the Left Navigation Menu under **Security**:
   - Go to **Database Access**, create a user named `soc-db-user` with read/write access to any database, and copy the password.
   - Go to **Network Access**, click **Add IP Address**, and select **Allow Access from Anywhere (0.0.0.0/0)** to allow hosting providers (e.g. Render, Vercel) to reach the database cluster.
4. Go to **Database**, click **Connect**, select **Drivers**, and copy the connection string:
   ```text
   mongodb+srv://soc-db-user:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user password, and append a database name (e.g. `/soc_db`) before the `?` query parameters.

---

## 2. Backend Deployment (Render / Railway / Heroku)

Deploy the Node.js Express server to a hosting provider like Render.

### Render Setup
1. Create an account on [Render](https://render.com/).
2. Push your project code to a private GitHub repository.
3. On the Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
4. Link your GitHub account and select your repository.
5. Configure the deployment settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
6. Open the **Environment** tab and add the required variables:
   - `PORT`: `5000` (or `80` / Render default)
   - `MONGO_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string*
   - `GEMINI_API_KEY`: *Your Google AI Studio API key*
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - *Optional:* Add your SMTP host settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) to enable email verification.
7. Click **Deploy Web Service**. Render will install packages and spin up the server. Note down your public backend URL (e.g. `https://soc-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel / Netlify)

Deploy the React Vite client to Vercel.

### Configure Base URL for Production API Requests
To ensure the production React build points API requests to your deployed backend URL, update the proxy or backend configuration. In `frontend/vite.config.js`, Vite proxies requests locally, but for production static hosting, we should verify the backend API address.
Our frontend fetches API routes using relative paths like `/api/threats`. Vercel supports rewrites, which can act as a proxy in production.

#### Vercel Rewrite Configuration
Create a `vercel.json` file inside the `frontend/` folder to route production `/api` requests to your deployed Render URL:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://soc-backend.onrender.com/api/$1"
    }
  ]
}
```

### Deploying to Vercel
1. Log in to the [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** $\rightarrow$ **Project**.
3. Select your GitHub repository.
4. Configure the Vercel project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Vercel will bundle the React client and serve it at a public URL (e.g. `https://soc-frontend.vercel.app`).
