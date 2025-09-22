<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="api-base" content="http://localhost:5000">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Student Login</title>

  <!-- Icon set -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>

  <!-- Page-only stylesheet -->
  <link rel="stylesheet" href="../Student/stud css/studlogin.css" />
</head>
<body>

  <!-- ===== Centered Login Card ===== -->
  <main class="center-wrapper">
    <section class="form-container" role="dialog" aria-labelledby="loginTitle" aria-describedby="loginDesc">
      <img src="../assets/sti_logo.png" alt="STI College Logo" class="logo" />
      <h1 id="loginTitle" class="title">Student Login</h1>
      <p id="loginDesc" class="subtitle">Sign in with your Student ID and password.</p>

      <form method="POST" action="studcheck.php" autocomplete="on" novalidate>
<!-- Ensure Font Awesome in <head> -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<!-- Inside your .form-container -->
<form method="POST" action="studcheck.php" autocomplete="on" novalidate>

  <!-- Student ID -->
  <div class="input-icon">
    <i class="fa-solid fa-id-card" aria-hidden="true"></i>
    <label for="studentId" class="sr-only">Student ID</label>
    <input
      id="studentId"
      name="studentId"
      type="text"
      placeholder="Student ID"
      autocomplete="username"
      required
    />
  </div>

  <!-- Password -->
  <div class="input-icon">
    <i class="fa-solid fa-lock" aria-hidden="true"></i>
    <label for="password" class="sr-only">Password</label>
    <input
      id="password"
      name="password"
      type="password"
      placeholder="Password"
      autocomplete="current-password"
      required
    />
  </div>
  
        <div class="row-between">
          <label class="checkbox">
            <input type="checkbox" name="remember" />
            <span>Remember me</span>
          </label>
          <!-- Optional forgot link -->
          <!-- <a href="#" class="link">Forgot password?</a> -->
        </div>

        <button type="submit" class="btn-primary">Login</button>
      
      <p id="msg" class="muted" style="margin-top:10px;"></p>
      </form>

      <p class="muted">
        Don’t have an account?
        <a href="studregister.php" class="link">Register</a>
      </p>
    </section>
  </main>

  <script src="../js/api.js"></script>
</body>
</html>
