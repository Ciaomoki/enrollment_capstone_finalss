<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="api-base" content="http://localhost:5000">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Evaluator Login</title>

  <!-- Font Awesome (for input icons) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <!-- Page-only stylesheet -->
  <link rel="stylesheet" href="../Evaluator/eval css/evallogin.css" />
</head>
<body>

  <main class="center-wrapper">
  <section class="form-container" role="dialog" aria-labelledby="evalLoginTitle" aria-describedby="evalLoginDesc">
    <img src="../assets/sti_logo.png" alt="STI College Logo" class="logo" />
    <h1 id="evalLoginTitle" class="title">Evaluator Login</h1>
    <p id="evalLoginDesc" class="subtitle">Sign in with your Evaluator ID and password.</p>

    <form method="POST" action="evaldashb.php" autocomplete="on" novalidate>
      <div class="input-icon">
        <i class="fa-solid fa-id-card" aria-hidden="true"></i>
        <label for="evalId" class="sr-only">Evaluator ID</label>
        <input id="evalId" name="evalId" type="text" placeholder="Evaluator ID" autocomplete="username" required>
      </div>

      <div class="input-icon">
        <i class="fa-solid fa-lock" aria-hidden="true"></i>
        <label for="evalPass" class="sr-only">Password</label>
        <input id="evalPass" name="password" type="password" placeholder="Password" autocomplete="current-password" required>
      </div>

      <div class="row-between">
        <label class="checkbox">
          <input type="checkbox" name="remember">
          <span>Remember me</span>
        </label>
      </div>

      <button type="submit" class="btn-primary">Login</button>
    
      <p id="msg" class="muted" style="margin-top:10px;"></p>
      </form>

    <p class="muted">
      Don’t have an account?
      <a href="evalregister.php" class="link">Register</a>
    </p>
  </section>
</main>

  <script src="../js/api.js"></script>
</body>
</html>
