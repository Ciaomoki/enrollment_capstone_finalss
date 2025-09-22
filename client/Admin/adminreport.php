<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reports - One Enrollment</title>

  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../assets/globalstyles.css" />
  <link rel="stylesheet" href="admin css/adminreport.css" />
</head>

<body class="admin-reports">
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
            <li class="nav-item">
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
            <li class="nav-item active">
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

    <!-- =============== MAIN =============== -->
    <main>
      <!-- Header -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars" aria-label="Toggle sidebar"></i>
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
      </header>

      <!-- ===================== Navigator + Filters ===================== -->
      <section class="reports-topbar" aria-label="Navigator and Filters">
        <!-- Prev -->
        <button class="switch-btn prev" title="Previous student" aria-label="Previous student">
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <!-- Student Combobox -->
        <div class="chooser student-chooser">
          <label class="chooser-label" for="reportsStudentComboBtn">Student</label>
          <button type="button" class="combo-toggle" aria-haspopup="listbox" aria-expanded="false" id="reportsStudentComboBtn">
            <span class="combo-label">Select student…</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="combo-panel" role="listbox" aria-labelledby="reportsStudentComboBtn" hidden>
            <div class="combo-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="search" placeholder="Search students…" aria-label="Search students" />
            </div>
            <ul class="combo-options">
              <li class="combo-option" data-value="Abad, Carlo">Abad, Carlo</li>
              <li class="combo-option" data-value="Bautista, Liza">Bautista, Liza</li>
              <li class="combo-option" data-value="Cruz, Mateo">Cruz, Mateo</li>
              <li class="combo-option" data-value="Dela Cruz, Ana">Dela Cruz, Ana</li>
              <li class="combo-option" data-value="Garcia, Anna">Garcia, Anna</li>
              <li class="combo-option" data-value="Lopez, Marielle">Lopez, Marielle</li>
              <li class="combo-option" data-value="Santos, Aaron">Santos, Aaron</li>
              <li class="combo-option" data-value="Villanueva, Paolo">Villanueva, Paolo</li>
            </ul>
          </div>
        </div>

        <!-- Next -->
        <button class="switch-btn next" title="Next student" aria-label="Next student">
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <!-- Current Student -->
        <div class="current-student" aria-label="Current Student">
          <div class="avatar" aria-hidden="true"><i class="fa-solid fa-user"></i></div>
          <div class="name-line">
            <span class="name" id="reportsCurrentName">Anna Garcia</span>
            <span class="meta-inline">BS Information Technology, 4th Year</span>
          </div>
        </div>

        <!-- Department Combobox -->
        <div class="chooser dept-chooser">
          <label class="chooser-label" for="reportsDeptComboBtn">Department</label>
          <button type="button" class="combo-toggle" aria-haspopup="listbox" aria-expanded="false" id="reportsDeptComboBtn">
            <span class="combo-label">All Departments</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="combo-panel" role="listbox" aria-labelledby="reportsDeptComboBtn" hidden>
            <div class="combo-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="search" placeholder="Search departments…" aria-label="Search departments" />
            </div>
            <ul class="combo-options">
              <li class="combo-option" data-value="All Departments">All Departments</li>
              <li class="combo-option" data-value="CITCS">CITCS</li>
              <li class="combo-option" data-value="CAS">CAS</li>
              <li class="combo-option" data-value="CBA">CBA</li>
              <li class="combo-option" data-value="COE">COE</li>
              <li class="combo-option" data-value="CHM">CHM</li>
              <li class="combo-option" data-value="CTE">CTE</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ===================== Table Card ===================== -->
      <section class="table-section">
        <div class="reports-card">
          <h2 class="section-title">Finalized Schedule</h2>

          <!-- Scroll window sized to rows (default 10). Adjust via --report-rows -->
          <div class="table-scroll" style="--report-rows:10; --report-row-h:48px;">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th class="th-wrap">Subject<br/>Code</th>
                  <th>Subject Name</th>
                  <th class="th-wrap">Units</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>001749</td><td>CTIE1008</td><td>Application Development & Emerging Technologies</td><td>3</td><td>Wed</td><td>8:00–11:00 am</td><td>BSIT 501A</td></tr>
                <tr><td>001750</td><td>CTIE1009</td><td>Systems Development</td><td>3</td><td>Fri</td><td>1:00–4:00 pm</td><td>BSIT 501B</td></tr>
                <tr><td>001751</td><td>CTIE1010</td><td>Database Systems</td><td>3</td><td>Mon</td><td>10:00–1:00 pm</td><td>BSIT 502A</td></tr>
                <tr><td>001752</td><td>CTIE1011</td><td>UX/UI Design</td><td>3</td><td>Tue</td><td>9:00–12:00 pm</td><td>BSIT 503</td></tr>
                <tr><td>001753</td><td>CTIE1012</td><td>Mobile Development</td><td>3</td><td>Thu</td><td>10:00–1:00 pm</td><td>BSIT 504</td></tr>
                <tr><td>001754</td><td>CTIE1013</td><td>Capstone Project</td><td>3</td><td>Fri</td><td>2:00–5:00 pm</td><td>BSIT 505</td></tr>
                <tr><td>001755</td><td>CTIE1014</td><td>Data Analytics</td><td>3</td><td>Wed</td><td>3:00–6:00 pm</td><td>BSIT 506</td></tr>
                <tr><td>001756</td><td>CTIE1015</td><td>Cloud Infrastructure</td><td>3</td><td>Mon</td><td>8:00–11:00 am</td><td>BSIT 507</td></tr>
                <tr><td>001757</td><td>CTIE1016</td><td>Information Security</td><td>3</td><td>Thu</td><td>1:00–4:00 pm</td><td>BSIT 508</td></tr>
                <tr><td>001758</td><td>CTIE1017</td><td>Project Management</td><td>3</td><td>Tue</td><td>2:00–5:00 pm</td><td>BSIT 509</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Custom resize handle (drag + keyboard) -->
          <div class="reports-resize-handle"
               aria-label="Resize table (drag up/down)"
               role="separator"
               aria-orientation="horizontal"
               tabindex="0"></div>
        </div>
      </section>

      <!-- Centered Download (outside the table card) -->
      <div class="download-actions">
        <button id="downloadBtn" class="btn-download" type="button">
          <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
          Download PDF
        </button>
      </div>
    </main>
  </div>

  <!-- Bottom Navigation -->
  <div id="bottomNav">
    <div class="current-page-indicator">Reports</div>
    <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="admindashb.php">
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Dashboard
    </button>
  </div>

  <!-- Viewport-centered X-scroll hint (shown once when needed) -->
  <div class="scroll-hint-overlay" id="reportsScrollHint" aria-hidden="true">
    <div class="scroll-hint">
      This table scrolls horizontally — try <b>swiping</b> or <b>Shift + scroll</b>.
    </div>
  </div>

  <script src="admin js/adminreport.js"></script>
</body>
</html>
