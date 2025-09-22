# How to run (connected client + server)

## 1) MySQL
- Make sure MySQL is running.
- Create the schema and tables:
  ```bash
  cd server
  npm i
  node --env-file=.env scripts/init-db.js
  # Optional: seed an admin
  node --env-file=.env scripts/seed-admin.js
  ```

## 2) Start the API (server)
```bash
cd server
npm run dev    # or: npm start
```
This will start on http://localhost (port 80).

## 3) Use the Client (PHP)
Serve the `client/` folder with PHP/Apache (e.g., XAMPP). Open:
- Student Register: `client/Student/studregister.php`
- Student Login:    `client/Student/studlogin.php`
- Evaluator Register: `client/Evaluator/evalregister.php`
- Evaluator Login:    `client/Evaluator/evallogin.php`
- Admin Login:        `client/Admin/adminlogin.php`

The pages include `client/js/api.js`, which calls the API at `http://localhost/api/...`.
If your API runs on a different port, add this to the `<head>` of any page:
```html
<meta name="api-base" content="http://localhost:3000">
```
or set `window.API_BASE` before loading `js/api.js`.

## Notes
- Server uses JWT. Tokens are stored in `localStorage` after login.
- Update `.env` as needed (DB_PASS, JWT_SECRET).
- CORS is enabled for any origin. Restrict it in production.
