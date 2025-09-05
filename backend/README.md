Environment setup
-----------------

1) Copy `.env.example` to `.env` and fill `DATABASE_URL` with your Supabase Postgres connection string.

2) Start the server:

```
npm run dev
```

3) Endpoint:
- `POST /analyze` with JSON body `{ "polygon": <GeoJSON Polygon or MultiPolygon> }`.


