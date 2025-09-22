<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Student Reports</title>

  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Student/stud css/studreport.css">
</head>

<body class="student-reports">
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
          <span class="user-text">Welcome Student!</span>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <ul>
            <li class="nav-item">
              <a href="studdashb.php" data-page="dashboard">
                <i class="fa-solid fa-house"></i><span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="studcheck.php" data-page="checklist">
                <i class="fa-solid fa-list-check"></i><span>Checklist</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="studassess.php" data-page="assessment">
                <i class="fa-solid fa-bars-progress"></i><span>Assessment</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="studenlist.php" data-page="enlistment">
                <i class="fa-solid fa-clipboard-list"></i><span>Enlistment</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="studfinal.php" data-page="draft">
                <i class="fa-solid fa-file-lines"></i><span>Draft</span>
              </a>
            </li>
            <li class="nav-item active">
              <a href="studreport.php" data-page="reports">
                <i class="fa-solid fa-chart-bar"></i><span>Reports</span>
              </a>
            </li>
            <li class="nav-item" id="signout-btn">
              <a href="#" data-page="signout">
                <i class="fa-solid fa-right-from-bracket"></i><span>Sign out</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- ================= MAIN ================= -->
    <main>
      <!-- Header (consistent with other student modules) -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars" aria-label="Toggle sidebar" role="button" tabindex="0"></i>
          <h1>Reports</h1>
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


          <span class="student-number">Student #</span>
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

      <!-- Page content -->
      <div class="content-scrollable">
        <!-- Steps Bar -->
        <div class="steps-wrapper">
          <ul class="steps-list">
            <li class="step-item" data-page="studcheck.php">
              <i class="fa-solid fa-list-check"></i><span>Checklist</span>
            </li>
            <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
            <li class="step-item" data-page="studassess.php">
              <i class="fa-solid fa-bars-progress"></i><span>Assessment</span>
            </li>
            <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
            <li class="step-item" data-page="studenlist.php">
              <i class="fa-solid fa-clipboard-list"></i><span>Enlistment</span>
            </li>
            <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
            <li class="step-item" data-page="studfinal.php">
              <i class="fa-solid fa-file-signature"></i><span>Finalize</span>
            </li>
            <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
            <li class="step-item" data-page="studreport.php">
              <i class="fa-solid fa-circle-check"></i><span>Complete</span>
            </li>
          </ul>
        </div>

        <!-- Enrollment Details -->
        <section class="report-card" aria-label="Enrollment Details">
          <h2>Enrollment Details</h2>
          <div class="report-details">
            <div class="detail-row">
              <span class="detail-label">Student Name</span>
              <span class="detail-value">Juan Dela Cruz</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Number</span>
              <span class="detail-value">2023-12345</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Program</span>
              <span class="detail-value">BS Information Technology</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Academic Year</span>
              <span class="detail-value">2023-2024</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Term</span>
              <span class="detail-value">2nd Semester</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="detail-value status-official">Officially Enrolled</span>
            </div>
          </div>
        </section>

        <!-- Enrollment Summary -->
        <section class="reports-card" aria-label="Enrollment Summary">
          <div class="reports-card-header">
            <h2 class="reports-title">Enrollment Summary</h2>
            <div class="units-summary">
              <span>Total Units: <strong>12</strong></span>
              <span class="units-range">MIN: 12 | MAX: 21</span>
            </div>
          </div>

          <div class="summary-table-container table-scroll" id="reportsTableScroll">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Units</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Application Development</td><td>3</td><td>Mon</td><td>8:00–11:00 AM</td><td>BST 501A</td></tr>
                <tr><td>Euthenics 2</td><td>1</td><td>Wed</td><td>2:00–3:00 PM</td><td>BST 701C</td></tr>
                <tr><td>Game Development</td><td>3</td><td>Thu</td><td>1:00–4:00 PM</td><td>BST 701B</td></tr>
                <tr><td>Calculus 2</td><td>5</td><td>Tue, Fri</td><td>9:00–10:30 AM</td><td>BST 501A</td></tr>
                <tr><td>Calculus 2</td><td>5</td><td>Tue, Fri</td><td>9:00–10:30 AM</td><td>BST 501A</td></tr>
                <tr><td>Calculus 2</td><td>5</td><td>Tue, Fri</td><td>9:00–10:30 AM</td><td>BST 501A</td></tr>
                <tr><td>Calculus 2</td><td>5</td><td>Tue, Fri</td><td>9:00–10:30 AM</td><td>BST 501A</td></tr>
                <tr><td>Calculus 2</td><td>5</td><td>Tue, Fri</td><td>9:00–10:30 AM</td><td>BST 501A</td></tr>
                <tr><td>Calculus 2</td><td>5</td><td>Tue, Fri</td><td>9:00–10:30 AM</td><td>BST 501A</td></tr>
                <tr><td>Calculus 2</td><td>5</td><td>Tue, Fri</td><td>9:00–10:30 AM</td><td>BST 501A</td></tr>
              </tbody>
            </table>
          </div>

          <div class="reports-resize-handle"
               role="separator"
               aria-orientation="horizontal"
               aria-label="Resize table container"
               tabindex="0"></div>
        </section>
      </div>

      <!-- Bottom Navigation -->
      <div id="bottomNav">
        <div class="current-page-indicator">Reports</div>
        <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="studdashb.php">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Dashboard
        </button>
      </div>
    </main>
  </div>

  <!-- X-scroll hint (centered) -->
  <div id="studReportScrollHint" class="scroll-hint-overlay" hidden>
    <div class="scroll-hint" aria-live="polite">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <script src="../Student/stud js/studreport.js"></script>
</body>
</html>
