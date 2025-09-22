<?php
session_start();
require_once __DIR__ . '/../helpers/api_client.php';
if($_SERVER['REQUEST_METHOD']==='POST' && !isset($_SESSION['token'])){
  $admin_id=$_POST['admin_id'] ?? '';
  $password=$_POST['password'] ?? '';
  if($admin_id && $password){
    list($status,$resp,$errno,$error)=api_request('POST','/api/login/admin',['admin_id'=>intval($admin_id),'password'=>$password]);
    if(!$errno){
      $data=json_decode($resp,true);
      if($status===200 && isset($data['token'])){ $_SESSION['token']=$data['token']; $_SESSION['user']=$data['user']; }
      else { $_SESSION['error']=$data['error'] ?? 'Login failed'; header('Location: adminlogin.php'); exit; }
    }else{ $_SESSION['error']='Login failed (network): '.$error; header('Location: adminlogin.php'); exit; }
  }else{ header('Location: adminlogin.php'); exit; }
}
if(!isset($_SESSION['token'])){ header('Location: adminlogin.php'); exit; }
?><?php
session_start();
require_once __DIR__ . '/../helpers/api_client.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_SESSION['token'])) {
  $admin_id = $_POST['admin_id'] ?? '';
  $password = $_POST['password'] ?? '';
  if ($admin_id && $password) {
    list($status, $resp, $errno, $error) = api_request('POST','/api/login/admin',[
      'admin_id'=>intval($admin_id),'password'=>$password
    ]);
    if (!$errno) {
      $data = json_decode($resp, true);
      if ($status===200 && isset($data['token'])) {
        $_SESSION['token'] = $data['token'];
        $_SESSION['user']  = $data['user'];
      } else {
        $_SESSION['error'] = $data['error'] ?? 'Login failed';
        header('Location: adminlogin.php'); exit;
      }
    } else {
      $_SESSION['error'] = 'Login failed (network): '.$error;
      header('Location: adminlogin.php'); exit;
    }
  } else {
    header('Location: adminlogin.php'); exit;
  }
}
if (!isset($_SESSION['token'])) { header('Location: adminlogin.php'); exit; }
?>
<?php
session_start();
if (!isset($_SESSION['token'])) { header('Location: adminlogin.php'); exit; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Dashboard</title>

  <!-- Icons & Styles -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../assets/globalstyles.css" />
  <link rel="stylesheet" href="../Admin/admin css/admindashb.css" />
</head>

<body class="admin-dashboard">
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
          <span class="user-text">Welcome Admin!</span>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <ul>
            <li class="nav-item active">
              <a href="admindashb.php" data-page="dashboard">
                <i class="fa-solid fa-house"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="admineval.php" data-page="evaluators">
                <i class="fa-solid fa-users"></i>
                <span>Evaluators</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="admindataim.php" data-page="dataimport">
                <i class="fa-solid fa-file-import"></i>
                <span>Data Import</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="adminstudlist.php" data-page="studentlist">
                <i class="fa-solid fa-list"></i>
                <span>Student List</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="admincurr.php" data-page="curriculum">
                <i class="fa-solid fa-book-open"></i>
                <span>Curriculum</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="adminreport.php" data-page="reports">
                <i class="fa-solid fa-book-open"></i>
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


          <span class="student-number">Admin #</span>
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

      <!-- ======= DASHBOARD CONTENT ======= -->
      <section class="dashboard-content">
        <!-- LEFT COLUMN -->
        <div class="dash-left">
          <!-- Greeting / CTA Toolbar -->
          <div class="greeting-card">
            <div class="greet-head">
              <h2>Greetings Admin Name!</h2>
              <p>Oversee and manage the overall operation of the system</p>
            </div>

            <div class="quick-actions">
              <button class="qa-btn" data-action="import">
                <i class="fa-solid fa-file-import"></i>
                <span>Import Data</span>
              </button>
              <button class="qa-btn" data-action="approve-eval">
                <i class="fa-solid fa-user-check"></i>
                <span>Approve Evaluators</span>
              </button>
              <button class="qa-btn" data-action="monitor">
                <i class="fa-solid fa-desktop"></i>
                <span>Monitor Assessments</span>
              </button>
              <button class="qa-btn" data-action="reports">
                <i class="fa-solid fa-chart-column"></i>
                <span>Generated Reports</span>
              </button>
            </div>
          </div>

          <!-- KPI CARDS -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-graduation-cap"></i>
                <h3>Total Students</h3>
              </div>
              <div class="kpi-value" data-kpi="students">1000</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-user-tie"></i>
                <h3>Active Evaluators</h3>
              </div>
              <div class="kpi-value" data-kpi="active-evaluators">6</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-user-plus"></i>
                <h3>Evaluator Requests</h3>
              </div>
              <div class="kpi-value" data-kpi="evaluator-requests">4</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-clipboard-check"></i>
                <h3>Completed Assessments</h3>
              </div>
              <div class="kpi-value" data-kpi="completed">980</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head">
                <i class="fa-solid fa-flag"></i>
                <h3>Flagged Assessments</h3>
              </div>
              <div class="kpi-value" data-kpi="flagged">20</div>
            </div>

            <div class="kpi-card countdown-card">
              <div class="kpi-head">
                <i class="fa-solid fa-clock"></i>
                <h3>Deadline Countdown</h3>
              </div>
              <div class="tile">
                <div class="tile-body">
                  <div id="deadlineCountdown" class="countdown" data-deadline="2025-10-01T23:59:59">
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
          </div><!-- /kpi-grid -->
        </div><!-- /dash-left -->

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

          <!-- Flagged Assessments -->
          <div class="panel panel-flagged">
            <div class="panel-title">Flagged Assessments</div>
            <div class="table-like three-cols">
              <div class="tl-head">
                <span>Student</span><span>Evaluator</span><span>Concern</span>
              </div>

              <!-- Clickable rows (open preview modal) -->
              <div class="tl-row modal-trigger" tabindex="0" role="button"
                   data-student-id="stu-001" data-student="Maria Santos" data-evaluator="A. Cruz"
                   data-remarks="Overload in scheduled units." data-concern="Overload">
                <span>Maria Santos</span><span>A. Cruz</span><span>Overload</span>
              </div>
              <div class="tl-row modal-trigger" tabindex="0" role="button"
                   data-student-id="stu-002" data-student="J. Dela Cruz" data-evaluator="K. Lim"
                   data-remarks="Duplicate course detected." data-concern="Duplicate Course">
                <span>J. Dela Cruz</span><span>K. Lim</span><span>Duplicate Course</span>
              </div>
              <div class="tl-row modal-trigger" tabindex="0" role="button"
                   data-student-id="stu-003" data-student="Paolo Reyes" data-evaluator="M. Tan"
                   data-remarks="Prerequisite not met for CTIE1013." data-concern="Prerequisite">
                <span>Paolo Reyes</span><span>M. Tan</span><span>Prerequisite</span>
              </div>
              <div class="tl-row modal-trigger" tabindex="0" role="button"
                   data-student-id="stu-004" data-student="A. Villanueva" data-evaluator="R. Gomez"
                   data-remarks="Schedule conflict Tue 9–12 and 10–1." data-concern="Conflict">
                <span>A. Villanueva</span><span>R. Gomez</span><span>Conflict</span>
              </div>
            </div>
          </div>

          <!-- Evaluator Requests -->
          <div class="panel panel-requests">
            <div class="panel-title">Evaluator Requests</div>

            <div class="req-head">
              <span>Evaluator</span>
              <span>Accept</span>
              <span>Decline</span>
            </div>

            <div class="req-row">
              <div class="req-eval">
                <span class="req-avatar"><i class="fa-solid fa-user-circle"></i></span>
                <div class="req-text">
                  <strong>Evaluator Name</strong>
                  <small>ID</small>
                </div>
              </div>
              <button class="req-btn approve" aria-label="Accept evaluator">
                <i class="fa-solid fa-thumbs-up"></i>
              </button>
              <button class="req-btn decline" aria-label="Decline evaluator">
                <i class="fa-solid fa-thumbs-down"></i>
              </button>
            </div>

            <div class="req-row">
              <div class="req-eval">
                <span class="req-avatar"><i class="fa-solid fa-user-circle"></i></span>
                <div class="req-text">
                  <strong>Evaluator Name</strong>
                  <small>ID</small>
                </div>
              </div>
              <button class="req-btn approve" aria-label="Accept evaluator">
                <i class="fa-solid fa-thumbs-up"></i>
              </button>
              <button class="req-btn decline" aria-label="Decline evaluator">
                <i class="fa-solid fa-thumbs-down"></i>
              </button>
            </div>

            <div class="req-row">
              <div class="req-eval">
                <span class="req-avatar"><i class="fa-solid fa-user-circle"></i></span>
                <div class="req-text">
                  <strong>Evaluator Name</strong>
                  <small>ID</small>
                </div>
              </div>
              <button class="req-btn approve" aria-label="Accept evaluator">
                <i class="fa-solid fa-thumbs-up"></i>
              </button>
              <button class="req-btn decline" aria-label="Decline evaluator">
                <i class="fa-solid fa-thumbs-down"></i>
              </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="panel">
            <div class="panel-title">Recent Activity</div>
            <ul class="activity-list">
              <li class="activity-row">
                <span class="activity-time">10:30 am</span>
                <div class="activity-text">
                  <strong>Approved evaluator request</strong>
                  <span>Maria Santos • 5 hours ago</span>
                </div>
              </li>
              <li class="activity-row">
                <span class="activity-time">09:15 am</span>
                <div class="activity-text">
                  <strong>Imported Student List</strong>
                  <span>2nd Semester 2025 • 6 hours ago</span>
                </div>
              </li>
              <li class="activity-row">
                <span class="activity-time">09:00 am</span>
                <div class="activity-text">
                  <strong>Imported Student Grades</strong>
                  <span>2nd Semester 2025 • 6 hours ago</span>
                </div>
              </li>
              <li class="activity-row">
                <span class="activity-time">08:40 am</span>
                <div class="activity-text">
                  <strong>Generated Assessment Status Report</strong>
                  <span>System Reports • 7 hours ago</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </section>
      <!-- ======= /DASHBOARD CONTENT ======= -->

      <!-- Spacer for fixed bottom nav -->
      <div class="dashboard-spacer"></div>
    </main>

    <!-- ======= GLOBAL BOTTOM NAV ======= -->
    <div id="bottomNav" data-right-default="admineval.php">
      <div class="current-page-indicator">Dashboard</div>
      <button id="navRightBtn" class="nav-button primary" type="button">
        Evaluators <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- ======================= FLAGGED ASSESSMENT PREVIEW MODAL ======================= -->
  <div id="flaggedPreview" class="flagged-preview-modal" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="fp-overlay" data-close="1"></div>

    <div class="fp-dialog" role="document">
      <!-- Header -->
      <div class="fp-header">
        <div class="fp-id">
          <div class="fp-avatar" id="fpStudentAvatar"><i class="fa-solid fa-user"></i></div>
          <div class="fp-who">
            <h3 id="fpStudentName">Student Name</h3>
            <div class="fp-meta" id="fpStudentMeta">Section • Student ID</div>
          </div>
        </div>

        <div class="fp-assignee">
          <span class="fp-assignee-label">Assigned Evaluator</span>
          <div class="fp-assignee-row">
            <div class="fp-assignee-avatar" id="fpAssigneeAvatar"><i class="fa-solid fa-user-tie"></i></div>
            <div>
              <div class="fp-assignee-name" id="fpAssigneeName">Evaluator Name</div>
              <div class="fp-assignee-email" id="fpAssigneeEmail">evaluator@college.edu</div>
            </div>
          </div>
        </div>

        <button class="fp-close" aria-label="Close preview" data-close="1">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="fp-body">
        <!-- Table side -->
        <div class="fp-table-card" id="fpTableCard">
          <div class="fp-table-head">Assessment Preview</div>
          <div class="fp-table-wrap" id="fpTableWrap">
            <table class="fp-table" id="fpTable">
              <thead>
              <tr>
                <th>Course ID</th>
                <th>Subject<br>Code</th>
                <th>Subject<br>Name</th>
                <th>Units</th>
                <th>Day</th>
                <th>Time</th>
                <th>Section</th>
              </tr>
              </thead>
              <tbody id="fpTableBody"><!-- rows injected --></tbody>
            </table>
          </div>
          <div class="fp-resize-handle" id="fpResizeHandle" title="Drag to resize"></div>
        </div>

        <!-- Right rail -->
        <aside class="fp-rail">
          <div class="fp-remarks">
            <div class="fp-remarks-title">Remarks</div>
            <p id="fpRemarks">—</p>
          </div>

          <div class="fp-message">
            <div class="fp-message-title">Message Evaluator</div>
            <textarea id="fpMessage" placeholder="Write a short message…"></textarea>
            <div class="fp-send-row">
              <button id="fpSendBtn" class="fp-send"><i class="fa-solid fa-paper-plane"></i> Send</button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Modal-local horizontal scroll hint -->
      <div class="fp-scroll-hint-overlay" id="fpScrollHint" aria-hidden="true">
        <div class="fp-scroll-hint">
          Hint: this table is wider than the view — <b>drag left/right</b> to see more.
        </div>
      </div>
    </div>
  </div>
  <!-- =================== /FLAGGED ASSESSMENT PREVIEW MODAL =================== -->

  <script src="../Admin/admin js/admindashb.js"></script>
</body>
</html>
