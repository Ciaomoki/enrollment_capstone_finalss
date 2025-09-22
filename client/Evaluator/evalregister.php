<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  session_start();
  require_once __DIR__ . '/../helpers/api_client.php';
  $employee_id = $_POST['evaluator_id'] ?? $_POST['employee_id'] ?? '';
  $name        = $_POST['full_name'] ?? $_POST['name'] ?? '';
  $email       = $_POST['email'] ?? '';
  $department  = $_POST['department'] ?? '';
  $password    = $_POST['password'] ?? '';
  if (!$employee_id || !$name || !$email || !$department || !$password) { $_SESSION['error']='All fields are required'; header('Location: evalregister.php'); exit; }
  list($status, $resp, $errno, $error) = api_request('POST','/api/evaluator/register',[
    'employee_id'=>intval($employee_id),'name'=>$name,'email'=>$email,'department'=>$department,'password'=>$password
  ]);
  if ($errno) { $_SESSION['error']='Register failed (network): '.$error; header('Location: evalregister.php'); exit; }
  $data = json_decode($resp, true);
  if ($status===201) { $_SESSION['flash']='Registration successful. Please login.'; header('Location: evallogin.php'); exit; }
  $_SESSION['error']=$data['error'] ?? 'Registration failed'; header('Location: evalregister.php'); exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="api-base" content="http://localhost:5000">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Create Evaluator Account</title>

  <!-- Font Awesome (for input icons) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <!-- Page-only stylesheet -->
  <link rel="stylesheet" href="../Evaluator/eval css/evalregister.css" />
</head>
<body>

  <main class="center-wrapper">
  <section class="form-container" role="dialog" aria-labelledby="evalRegTitle" aria-describedby="evalRegDesc">
    <img src="../assets/sti_logo.png" alt="STI College Logo" class="logo" />

    <h1 id="evalRegTitle" class="title">Create Evaluator Account</h1>
    <p id="evalRegDesc" class="subtitle">Fill in your details to register.</p>

    <p id="errorEvalReg" class="error hidden" role="alert"></p>

    <form method="POST" action="evalregister.php" autocomplete="on" novalidate>
      <div class="input-icon">
        <i class="fa-solid fa-id-card" aria-hidden="true"></i>
        <label for="evaluator_id" class="sr-only">Evaluator ID</label>
        <input id="evaluator_id" name="evaluator_id" type="text" placeholder="Evaluator ID" required>
      </div>

      <div class="input-icon">
        <i class="fa-solid fa-user" aria-hidden="true"></i>
        <label for="evaluator_name" class="sr-only">Full Name</label>
        <input id="evaluator_name" name="full_name" type="text" placeholder="Full Name" required>
      </div>

      <div class="input-icon">
        <i class="fa-solid fa-envelope" aria-hidden="true"></i>
        <label for="evaluator_email" class="sr-only">Email</label>
        <input id="evaluator_email" name="email" type="email" placeholder="Email" required>
      </div>

      <div class="input-icon">
        <i class="fa-solid fa-building-columns" aria-hidden="true"></i>
        <label for="department" class="sr-only">Department</label>
        <select id="department" name="department" required>
          <option value="">Select Department</option>
          <option value="IT">IT</option>
          <option value="Engineering">Engineering</option>
          <option value="Business">Business</option>
        </select>
      </div>

      <div class="input-icon">
        <i class="fa-solid fa-lock" aria-hidden="true"></i>
        <label for="evaluator_password" class="sr-only">Password</label>
        <input id="evaluator_password" name="password" type="password" placeholder="Password" required>
      </div>

      <button type="submit" class="btn-primary">Register</button>
    </form>

    <p class="muted">
      Already have an account?
      <a href="evallogin.php" class="link">Login</a>
    </p>
  </section>
</main>

  <script src="../js/api.js"></script>
</body>
</html>
