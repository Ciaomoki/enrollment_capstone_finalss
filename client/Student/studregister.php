<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  session_start();
  require_once __DIR__ . '/../helpers/api_client.php';
  $student_id = $_POST['student_id'] ?? $_POST['studentId'] ?? '';
  $full_name  = $_POST['full_name'] ?? $_POST['name'] ?? '';
  $email      = $_POST['email'] ?? '';
  $course     = $_POST['course'] ?? '';
  $password   = $_POST['password'] ?? '';
  $confirm    = $_POST['confirm_password'] ?? '';
  if (!$student_id || !$full_name || !$email || !$course || !$password) { $_SESSION['error']='All fields are required'; header('Location: studregister.php'); exit; }
  if ($confirm!=='' && $confirm!==$password) { $_SESSION['error']='Passwords do not match'; header('Location: studregister.php'); exit; }
  list($status, $resp, $errno, $error) = api_request('POST', '/api/student/register', ['student_id'=>intval($student_id),'full_name'=>$full_name,'email'=>$email,'course'=>$course,'password'=>$password]);
  if ($errno) { $_SESSION['error']='Register failed (network): '.$error; header('Location: studregister.php'); exit; }
  $data = json_decode($resp, true);
  if ($status===201) { $_SESSION['flash']='Registration successful. Please login.'; header('Location: studlogin.php'); exit; }
  $_SESSION['error']=$data['error'] ?? 'Registration failed'; header('Location: studregister.php'); exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="api-base" content="http://localhost:5000">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Create Student Account</title>

  <!-- Font Awesome (for input icons) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>

  <!-- Page-only stylesheet (no Tailwind, no globals) -->
  <link rel="stylesheet" href="../Student/stud css/studregister.css" />
</head>
<body>

  <main class="center-wrapper">
    <section class="form-container" role="dialog" aria-labelledby="regTitle" aria-describedby="regDesc">
      <img src="../assets/sti_logo.png" alt="STI College Logo" class="logo" />

      <h1 id="regTitle" class="title">Create Student Account</h1>
      <p id="regDesc" class="subtitle">Fill in your details to register.</p>

      <!-- Optional server-side error placeholder -->
      <p id="errorMsgReg" class="error hidden" role="alert"></p>

      <form id="registerForm" method="POST" action="studregister.php" autocomplete="on" novalidate>
        <!-- Student ID -->
        <div class="input-icon">
          <i class="fa-solid fa-id-card" aria-hidden="true"></i>
          <label for="student_id" class="sr-only">Student ID</label>
          <input id="student_id" name="student_id" type="text" inputmode="numeric" placeholder="Student ID" required />
        </div>

        <!-- Full Name -->
        <div class="input-icon">
          <i class="fa-solid fa-user" aria-hidden="true"></i>
          <label for="full_name" class="sr-only">Full Name</label>
          <input id="full_name" name="full_name" type="text" placeholder="Full Name" required />
        </div>

        <!-- Email -->
        <div class="input-icon">
          <i class="fa-solid fa-envelope" aria-hidden="true"></i>
          <label for="email" class="sr-only">Email</label>
          <input id="email" name="email" type="email" placeholder="Email" required />
        </div>

        <!-- Course Selection -->
        <div class="input-icon">
          <i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>
          <label for="course" class="sr-only">Course</label>
          <select id="course" name="course" required>
            <option value="">Select Course</option>
            <option value="BSIT">BSIT</option>
            <option value="BSA">BSA</option>
            <option value="BSBA">BSBA</option>
          </select>
        </div>

        <!-- Password -->
        <div class="input-icon">
          <i class="fa-solid fa-lock" aria-hidden="true"></i>
          <label for="password" class="sr-only">Password</label>
          <input id="password" name="password" type="password" placeholder="Password" required />
        </div>

        <button type="submit" class="btn-primary">Register</button>
      
      <p id="msg" class="muted" style="margin-top:10px;"></p>
      </form>

      <p class="muted">
        Already have an account?
        <a href="studlogin.php" class="link">Login</a>
      </p>
    </section>
  </main>

  <script src="../js/api.js"></script>
</body>
</html>
