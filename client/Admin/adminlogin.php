<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="api-base" content="http://localhost:5000">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Login</title>

  <!-- Font Awesome (for input icons) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <!-- Page-only stylesheet -->
  <link rel="stylesheet" href="../Admin/admin css/adminlogin.css" />
</head>
<body>

<main class="center-wrapper">
  <section class="form-container" role="dialog" aria-labelledby="loginTitle" aria-describedby="loginDesc">
    <img src="../assets/sti_logo.png" alt="STI College Logo" class="logo" />
    <h1 id="loginTitle" class="title">Admin Login</h1>
    <p id="loginDesc" class="subtitle">Sign in with your Admin ID and password.</p>

    <form method="POST" action="admindashb.php" autocomplete="on" novalidate>
      <!-- Admin ID -->
      <div class="input-icon">
        <i class="fa-solid fa-user-shield" aria-hidden="true"></i>
        <label for="admin_id" class="sr-only">Admin ID</label>
        <input id="admin_id" name="admin_id" type="text"
               placeholder="Admin ID" autocomplete="username" required>
      </div>

      <!-- Password -->
      <div class="input-icon">
        <i class="fa-solid fa-lock" aria-hidden="true"></i>
        <label for="password" class="sr-only">Password</label>
        <input id="password" name="password" type="password"
               placeholder="Password" autocomplete="current-password" required>
      </div>

      <button type="submit" class="btn-primary">Login</button>
    
      <p id="msg" class="muted" style="margin-top:10px;"></p>
      </form>

    <p class="muted">
      <a href="../index.php" class="link">Back to Home</a>
    </p>
  </section>
</main>

  <script src="../js/api.js"></script>
</body>
</html>
