<?php
session_start();
require_once __DIR__ . '/../helpers/api_client.php';
if($_SERVER['REQUEST_METHOD']==='POST' && !isset($_SESSION['token'])){
  $employeeId=$_POST['evalId'] ?? $_POST['employee_id'] ?? '';
  $password=$_POST['password'] ?? '';
  if($employeeId && $password){
    list($status,$resp,$errno,$error)=api_request('POST','/api/login/evaluator',['employee_id'=>intval($employeeId),'password'=>$password]);
    if(!$errno){
      $data=json_decode($resp,true);
      if($status===200 && isset($data['token'])){ $_SESSION['token']=$data['token']; $_SESSION['user']=$data['user']; }
      else { $_SESSION['error']=$data['error'] ?? 'Login failed'; header('Location: evallogin.php'); exit; }
    }else{ $_SESSION['error']='Login failed (network): '.$error; header('Location: evallogin.php'); exit; }
  }else{ header('Location: evallogin.php'); exit; }
}
if(!isset($_SESSION['token'])){ header('Location: evallogin.php'); exit; }
?><?php
session_start();
require_once __DIR__ . '/../helpers/api_client.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_SESSION['token'])) {
  $employeeId = $_POST['evalId'] ?? $_POST['employee_id'] ?? '';
  $password   = $_POST['password'] ?? '';
  if ($employeeId && $password) {
    list($status, $resp, $errno, $error) = api_request('POST','/api/login/evaluator',[
      'employee_id'=>intval($employeeId),'password'=>$password
    ]);
    if (!$errno) {
      $data = json_decode($resp, true);
      if ($status===200 && isset($data['token'])) {
        $_SESSION['token'] = $data['token'];
        $_SESSION['user']  = $data['user'];
      } else {
        $_SESSION['error'] = $data['error'] ?? 'Login failed';
        header('Location: evallogin.php'); exit;
      }
    } else {
      $_SESSION['error'] = 'Login failed (network): '.$error;
      header('Location: evallogin.php'); exit;
    }
  } else {
    header('Location: evallogin.php'); exit;
  }
}
if (!isset($_SESSION['token'])) { header('Location: evallogin.php'); exit; }
?>
<?php
session_start();
if (!isset($_SESSION['token'])) { header('Location: evallogin.php'); exit; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Evaluator Dashboard</title>

  <!-- Icons & Global Styles -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../assets/globalstyles.css" />
  <link rel="stylesheet" href="../Evaluator/eval css/evaldashb.css" />
</head>

<body class="evaluator-dashboard">
  <!-- Top Yellow Stripe -->
  <div class="top-bar"></div>

  <div class="global-container">
    <!-- ================= SIDEBAR ================= -->
    <aside id="sidebar" class="sidebar">
      <div>
        <!-- Logo Header -->
        <div class="sidebar-header">
          <span class="logo-icon">1</span>
          <span class="logo-text">One Enrollment</span>
        </div>

        <!-- User Info -->
        <div class="sidebar-user">
          <i class="fa-solid fa-user-circle user-icon"></i>
          <span class="user-text">Welcome Evaluator!</span>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <ul>
            <li class="nav-item active">
              <a href="evaldashb.php" data-page="dashboard">
                <i class="fa-solid fa-house"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="evalstudlist.php" data-page="studentlist">
                <i class="fa-solid fa-list"></i>
                <span>Student List</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="evalval.php" data-page="validate">
                <i class="fa-solid fa-book"></i>
                <span>Validate</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="evalreport.php" data-page="reports">
                <i class="fa-solid fa-chart-bar"></i>
                <span>Reports</span>
              </a>
            </li>
            <li class="nav-item" id="signout-btn">
              <a href="#" data-page="signout">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Sign out</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- ================= MAIN ================= -->
    <main>
      <!-- Header -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars"></i>
          <h1>Dashboard</h1>
        </div>

        <div class="header-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input id="globalSearch" type="search" placeholder="Search" aria-label="Search" />
        </div>

        <div class="header-icons">
          <i class="fa-solid fa-circle-info" title="Info"></i>

          <!-- Inbox button: visible; dropdown stays collapsed by default -->
         <button id="inboxBtn" type="button" class="icon-btn inbox-button"
        aria-expanded="false" aria-controls="inboxDropdown" title="Inbox">
        <i class="fa-solid fa-inbox"></i>
        <span class="badge" id="inboxBadge">3</span>
        </button>


          <span class="student-number">Evaluator #</span>
          <i class="fa-solid fa-user-circle" title="Profile"></i>
        </div>
      </header>

      <!-- Inbox Dropdown (global; default collapsed via [hidden]) -->
      <div id="inboxDropdown" class="inbox-dropdown" role="dialog" aria-modal="false" aria-labelledby="inboxTitle" hidden>
        <div class="inbox-head">
          <h3 id="inboxTitle"><i class="fa-solid fa-inbox"></i> Inbox</h3>
          <div class="inbox-actions">
            <button type="button" class="inbox-action" id="markAllReadBtn" title="Mark all as read">
              <i class="fa-solid fa-check-double"></i> Mark all read
            </button>
          </div>
        </div>

        <div class="inbox-tabs" role="tablist" aria-label="Inbox filters">
          <button class="inbox-tab active" data-filter="all" role="tab" aria-selected="true">All</button>
          <button class="inbox-tab" data-filter="unread" role="tab" aria-selected="false">Unread</button>
        </div>

        <ul class="inbox-list" id="inboxList">
          <!-- Example items; replace with your data server-side if you have it -->
          <li class="message unread" data-id="m1">
            <button class="message-row" title="Open message">
              <div class="message-main">
                <div class="message-title">Enrollment submitted</div>
                <div class="message-snippet">Your enrollment form was received and is pending review…</div>
              </div>
              <div class="message-meta">
                <time datetime="2025-08-23T12:05:00">12:05</time>
                <span class="dot unread-dot" aria-label="Unread"></span>
              </div>
            </button>
          </li>
          <li class="message" data-id="m2">
            <button class="message-row" title="Open message">
              <div class="message-main">
                <div class="message-title">Schedule updated</div>
                <div class="message-snippet">Your assessment schedule has been moved to Monday 9:00 AM…</div>
              </div>
              <div class="message-meta">
                <time datetime="2025-08-23T10:12:00">10:12</time>
              </div>
            </button>
          </li>
          <li class="message unread" data-id="m3">
            <button class="message-row" title="Open message">
              <div class="message-main">
                <div class="message-title">Document request</div>
                <div class="message-snippet">Please upload your latest Form 138 for verification…</div>
              </div>
              <div class="message-meta">
                <time datetime="2025-08-23T08:30:00">08:30</time>
                <span class="dot unread-dot" aria-label="Unread"></span>
              </div>
            </button>
          </li>
        </ul>

        <div class="inbox-foot">
          <a href="#" class="inbox-link" id="viewAllInbox">View all messages</a>
        </div>
      </div>
      </header>

      <!-- ======= DASHBOARD CONTENT ======= -->
      <section class="dashboard-content">
        <!-- LEFT COLUMN -->
        <div class="dash-left">
          <!-- Greeting / CTA Toolbar -->
          <div class="greeting-card">
            <div class="greet-head">
              <h2>Greetings Evaluator Name!</h2>
              <p>Oversee and manage the overall operation of the system</p>
            </div>

            <!-- Evaluator quick actions -->
            <div class="quick-actions three">
              <button class="qa-btn" data-action="assigned-students">
                <i class="fa-solid fa-user-check"></i>
                <span>Assigned<br/>Students</span>
              </button>
              <button class="qa-btn" data-action="validate-pre">
                <i class="fa-solid fa-clipboard-check"></i>
                <span>Validate<br/>Pre Assessments</span>
              </button>
              <button class="qa-btn" data-action="download-reports">
                <i class="fa-solid fa-file-arrow-down"></i>
                <span>Download<br/>Reports</span>
              </button>
            </div>
          </div>

          <!-- KPI CARDS -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-circle-check"></i>
                <h3>Completed Assessments</h3>
              </div>
              <div class="kpi-value" data-kpi="completed">980</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-hourglass-half"></i>
                <h3>Pending Assessments</h3>
              </div>
              <div class="kpi-value" data-kpi="pending">10</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-flag"></i>
                <h3>Flagged Assessments</h3>
              </div>
              <div class="kpi-value" data-kpi="flagged">10</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-badge-check"></i>
                <h3>Approved Today</h3>
              </div>
              <div class="kpi-value" data-kpi="approved-today">20</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-graduation-cap"></i>
                <h3>Total Students</h3>
              </div>
              <div class="kpi-value" data-kpi="students">140</div>
            </div>

            <div class="kpi-card countdown-card">
              <div class="kpi-head">
                <i class="fa-solid fa-clock"></i>
                <h3>Deadline Countdown</h3>
              </div>
              <!-- Add data-deadline for live countdown (parity with admin) -->
              <div class="countdown" data-deadline="2025-10-01T23:59:59" data-finish-text="Deadline reached">
                <div class="cd-part"><span class="cd-val" data-cd="days">05</span><span class="cd-lbl">days</span></div>
                <div class="cd-sep">:</div>
                <div class="cd-part"><span class="cd-val" data-cd="hrs">10</span><span class="cd-lbl">hrs</span></div>
                <div class="cd-sep">:</div>
                <div class="cd-part"><span class="cd-val" data-cd="mins">45</span><span class="cd-lbl">mins</span></div>
                <div class="cd-sep">:</div>
                <div class="cd-part"><span class="cd-val" data-cd="secs">00</span><span class="cd-lbl">secs</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN / WIDGETS -->
        <aside class="dash-right">
          <!-- Overall Progress -->
          <div class="panel panel-progress">
            <div class="panel-title">
              <span>Assessments Completed</span>
              <strong class="progress-percent" data-progress="overall">98%</strong>
            </div>
            <div class="progressbar">
              <div class="progressbar-fill" style="width: 98%;"></div>
            </div>
          </div>

          <!-- Merged: You are currently reviewing + On your queue -->
          <div class="panel review-queue-panel">
            <div class="panel-title">You are currently reviewing</div>

            <!-- Top — current student -->
            <div class="rq-current">
              <div class="rq-avatar"><i class="fa-solid fa-user"></i></div>
              <div class="rq-info">
                <div class="rq-name">Student Name</div>
                <div class="rq-meta">
                  <span>ID 2024-00123</span>
                  <span>Engineering</span>
                  <span>2nd Yr / 1st Sem</span>
                </div>
              </div>
            </div>

            <div class="rq-sep"></div>

            <!-- Queue list (rows are full-width links) -->
            <div class="rq-list">
              <a class="rq-item" href="evalval.php">
                <div class="rq-iavatar"><i class="fa-solid fa-user"></i></div>
                <div class="rq-text">
                  <div class="rq-sname">Student Name</div>
                  <div class="rq-smeta">
                    <span>ID 2024-00123</span>
                    <span>Engineering</span>
                    <span>Year level / Sem</span>
                  </div>
                </div>
              </a>

              <a class="rq-item" href="evalval.php">
                <div class="rq-iavatar"><i class="fa-solid fa-user"></i></div>
                <div class="rq-text">
                  <div class="rq-sname">Student Name</div>
                  <div class="rq-smeta">
                    <span>ID 2024-00124</span>
                    <span>Engineering</span>
                    <span>Year level / Sem</span>
                  </div>
                </div>
              </a>

              <a class="rq-item" href="evalval.php">
                <div class="rq-iavatar"><i class="fa-solid fa-user"></i></div>
                <div class="rq-text">
                  <div class="rq-sname">Student Name</div>
                  <div class="rq-smeta">
                    <span>ID 2024-00125</span>
                    <span>Engineering</span>
                    <span>Year level / Sem</span>
                  </div>
                </div>
              </a>

              <a class="rq-item" href="evalval.php">
                <div class="rq-iavatar"><i class="fa-solid fa-user"></i></div>
                <div class="rq-text">
                  <div class="rq-sname">Student Name</div>
                  <div class="rq-smeta">
                    <span>ID 2024-00126</span>
                    <span>Engineering</span>
                    <span>Year level / Sem</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div class="panel">
            <div class="panel-title">Recent Activity</div>
            <ul class="activity-list">
              <li class="activity-row">
                <div class="activity-time">10:30 am</div>
                <div class="activity-text">
                  <strong>Approved evaluator request from Maria Santos</strong>
                  <span>5 hours ago</span>
                </div>
              </li>
              <li class="activity-row">
                <div class="activity-time">9:05 am</div>
                <div class="activity-text">
                  <strong>Imported Student List – 2nd Semester 2025</strong>
                  <span>7 hours ago</span>
                </div>
              </li>
              <li class="activity-row">
                <div class="activity-time">8:40 am</div>
                <div class="activity-text">
                  <strong>Imported Student Grades – 2nd Semester 2025</strong>
                  <span>8 hours ago</span>
                </div>
              </li>
              <li class="activity-row">
                <div class="activity-time">8:00 am</div>
                <div class="activity-text">
                  <strong>Generated Assessment Status Report</strong>
                  <span>9 hours ago</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </section>

      <!-- Spacer for fixed bottom nav -->
      <div class="dashboard-spacer"></div>
    </main>

    <!-- Global Bottom Nav (right → Student List by default) -->
    <div id="bottomNav" data-right-default="evalstudlist.php">
      <div class="current-page-indicator">Dashboard</div>
      <button id="navRightBtn" class="nav-button primary" type="button">
        Student List <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- JS -->
  <script src="../Evaluator/eval js/evaldashb.js"></script>
</body>
</html>
