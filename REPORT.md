Fix Summary
===========
1) **Port**: Confirmed `server/server.js` uses `process.env.PORT || 5000`. Also set `server/.env` `PORT=5000`.
2) **DB Password**: `server/config/connectiondb.js` was missing `password: process.env.DB_PASS`. Added it.
3) **Init SQL**: `server/scripts/init-db.js` loaded `schema.sql` but the file is named `sql/enrollment_db.sql`. Updated to use the correct filename.
4) **Client ⇄ API Base URL**:
   - Updated `<meta name="api-base" content="http://localhost">` in 5 PHP files to `http://localhost:5000` so the client hits the correct API port.
   - Updated `client/js/api.js` default to `http://localhost:5000` and the comment accordingly.
5) **Added Helper (optional)**: Created `client/assets/api.js` (lightweight fetch helper) in case you prefer including it on pages without the `client/js/api.js` script.

Verification
------------
- Routes present: `server/routes/authRoute.js` mounts:
  - POST `/api/student/register`
  - POST `/api/evaluator/register`
  - POST `/api/login/student`
  - POST `/api/login/evaluator`
  - POST `/api/login/admin`
  - GET `/api/me`
- Server mounts: `/api`, `/api/student`, `/api/evaluator`, `/api/admin`.
- SQL schema matches `enrollment_db` (student, evaluator, admin tables).

Next Steps
----------
- Run:
    npm run initdb
    npm run seed:admin
    npm run dev
- Ensure your MySQL credentials in `server/.env` are correct (`DB_PASS` cannot be blank if your MySQL has a password).
- Serve the PHP pages via any web server (Apache/Nginx/PHP built-in). They will call the API at `http://localhost:5000`.
