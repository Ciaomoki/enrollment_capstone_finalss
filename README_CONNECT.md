Connection Guide
================
Your PHP pages now call the Node backend (http://localhost:5000) using PHP cURL.

Where the wiring lives:
- client/helpers/api_client.php : reusable API client (POST/GET with JSON & optional Authorization header)
- client/Student/studcheck.php : POST -> /api/login/student
- client/Student/studregister.php : POST -> /api/student/register
- client/Evaluator/evalregister.php : POST -> /api/evaluator/register
- client/Evaluator/evaldashb.php : Accepts POST from login form; logs in to /api/login/evaluator, then shows dashboard
- client/Admin/admindashb.php : Accepts POST from login form; logs in to /api/login/admin, then shows dashboard

Notes:
- Student/Evaluator forms keep their original action attributes.
- Admin/Evaluator login forms still post to their dashboards; the dashboards now perform the login if needed.
- Dashboards and handlers set $_SESSION['token'] and $_SESSION['user'] upon successful login.

Run:
1) Start MySQL and ensure credentials in server/.env are correct.
2) From server/: npm i && npm run initdb && npm run seed:admin && npm run dev
3) Serve PHP frontend (from client/): php -S localhost:8080
4) Open the login/register pages; they will call the Node API automatically on form submit.
