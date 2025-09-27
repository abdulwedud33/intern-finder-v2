# Inter Finder - Backend

## Setup Instructions

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file based on `.env.team`
4. Run the app:
   ```bash
   npm run dev


## Environment Variables

Create a `.env` file in the root with the following:

  - `MONGO_URI=your_mongodb_connection_string`
  - `JWT_SECRET=your_super_secret_key`
  - `PORT=5000`

## API Endpoints

- **Auth**
  - `POST /api/auth/register/intern` — Register as intern
  - `POST /api/auth/register/client` — Register as client

- **Listings**
  - `POST /api/listings/` — Create listing (client only)
  - `PUT /api/listings/:id` — Edit listing (client only)
  - `DELETE /api/listings/:id` — Delete listing (client only)

- **Applications**
  - `POST /api/applications/:id/apply` — Intern applies to a listing

- **Dashboard**
  - `GET /api/dashboard/intern/:id` — Intern dashboard
  - `GET /api/dashboard/client/:id` — Client dashboard
  
---