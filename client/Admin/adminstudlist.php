<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Student List - One Enrollment</title>
  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Admin/admin css/adminstudlist.css">
</head>

<body class="admin-studentlist">
  <!-- Top Yellow Stripe -->
  <div class="top-bar"></div>

  <div class="global-container">
    <!-- SIDEBAR -->
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
                <i class="fa-solid fa-house"></i><span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="admineval.php" data-page="evaluators">
                <i class="fa-solid fa-users"></i><span>Evaluators</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="admindataim.php" data-page="dataimport">
                <i class="fa-solid fa-file-import"></i><span>Data Import</span>
              </a>
            </li>
            <li class="nav-item active">
              <a href="adminstudlist.php" data-page="studentlist">
                <i class="fa-solid fa-list"></i><span>Student List</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="admincurr.php" data-page="curriculum">
                <i class="fa-solid fa-book-open"></i><span>Curriculum</span>
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
                <i class="fa-solid fa-right-from-bracket"></i><span>Sign out</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- MAIN -->
    <main>
      <!-- Header -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars" aria-label="Toggle sidebar" role="button" tabindex="0"></i>
          <h1>Student List</h1>
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

      <!-- Content Area (static page; table area scrolls on sub-desktop) -->
      <div class="content-scrollable">
        <section class="curric-card">
          <div class="curric-card-header">
            <h2 class="curric-title">STI College Bacoor Students (SY: 2025–2026)</h2>

            <!-- Filters (inside the card) -->
            <div class="filters-rail">
              <div class="filter-group">
                <label for="dept">Department</label>
                <select id="dept">
                  <option>All</option>
                  <option>IT</option>
                  <option>Business</option>
                  <option>Engineering</option>
                  <option>Nursing</option>
                </select>
              </div>
              <div class="filter-group">
                <label for="year">Year Level</label>
                <select id="year">
                  <option>All</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
              <div class="filter-group">
                <label for="status">Assessment Status</label>
                <select id="status">
                  <option>All</option>
                  <option>Complete</option>
                  <option>Pending</option>
                  <option>Incomplete</option>
                </select>
              </div>
            </div>
          </div>

          <!-- The ONLY scroller -->
          <div class="table-scroll">
            <table class="student-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Year Level</th>
                  <th>Department</th>
                  <th>Assessment Status</th>
                </tr>
              </thead>
              <tbody>
                <!-- Sample rows -->
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                <tr><td>Garcia, Anna M.</td><td>4th</td><td>Engineering</td><td>Complete</td></tr>
                <tr><td>Smith, John P.</td><td>3rd</td><td>Business</td><td>Pending</td></tr>
                
              </tbody>
            </table>
          </div>

          <!-- Single custom resize handle (bar; mobile+desktop) -->
          <div class="curric-resize-handle"
               role="separator"
               aria-orientation="horizontal"
               aria-label="Resize table container"
               tabindex="0"></div>
        </section>

        <!-- Footer BELOW the card -->
        <div class="table-footer-container">
          <div class="table-footer">
            <span class="student-count-label">Total Students: 50</span>
            <button class="update-button" type="button">Update Records</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Bottom Navigation (outside global-container, like curriculum) -->
  <div id="bottomNav" data-left-default="admindataim.php" data-right-default="admincurr.php">
    <div class="current-page-indicator">Student List</div>

    <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="admindataim.php">
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Data Import
    </button>

    <button id="navRightBtn" class="nav-button primary" type="button" data-href="admincurr.php">
      Curriculum <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  </div>

  <!-- Viewport-centered horizontal-scroll hint (same component id/class) -->
  <div id="curricScrollHint" class="scroll-hint-overlay">
    <div class="scroll-hint" aria-live="polite">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <script src="../Admin/admin js/adminstudlist.js"></script>
</body>
</html>
