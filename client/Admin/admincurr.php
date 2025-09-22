<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Curriculum</title>

  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Admin/admin css/admincurr.css">
</head>

<body class="admin-curriculum">
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
            <li class="nav-item">
              <a href="adminstudlist.php" data-page="studentlist">
                <i class="fa-solid fa-list"></i><span>Student List</span>
              </a>
            </li>
            <li class="nav-item active">
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

    <!-- ================= MAIN ================= -->
    <main>
      <!-- Header -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars" aria-label="Toggle sidebar" role="button" tabindex="0"></i>
          <h1>Curriculum</h1>
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

      <!-- Content Area (page is static on desktop; table area scrolls) -->
      <div class="content-scrollable">
        <!-- ===== Card: title + filters + table area ===== -->
        <section class="curric-card">
          <!-- Card header (inside the card like Student List) -->
          <div class="curric-card-header">
            <h2 class="curric-title">STI College Bacoor Curriculum (SY: 2025–2026)</h2>

            <!-- Filters rail INSIDE the card -->
            <div class="filters-rail">
              <div class="filter-group">
                <label for="semester">Semester</label>
                <select id="semester" class="filter-select">
                  <option>1st</option>
                  <option selected>2nd</option>
                  <option>Summer</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="yearlevel">Year Level</label>
                <select id="yearlevel" class="filter-select">
                  <option>1st</option>
                  <option>2nd</option>
                  <option selected>3rd</option>
                  <option>4th</option>
                </select>
              </div>
            </div>
          </div>

          <!-- The ONLY scroller: table area (mirrors Student List) -->
          <div class="table-scroll" id="curricTableScroll">
            <table class="curric-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Subject Area</th>
                  <th>Catalog No.</th>
                  <th>Description</th>
                  <th>Units</th>
                  <th>Pre Requisite</th>
                  <th>Co Requisite</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>002495</td><td>INTE</td><td>1064</td>
                  <td>Mobile Systems &amp; Technologies</td><td>3</td>
                  <td>Application Development &amp; Emerging Technologies</td><td></td>
                </tr>
                <tr>
                  <td>002044</td><td>INTE</td><td>1027</td>
                  <td>Programming Languages</td><td>3</td>
                  <td>Enterprise Architecture</td><td>Game Development</td>
                </tr>
                <tr>
                  <td>002496</td><td>INTE</td><td>1065</td>
                  <td>Database Management Systems</td><td>3</td>
                  <td>Data Structures &amp; Algorithms</td><td></td>
                </tr>
                <tr>
                  <td>002497</td><td>INTE</td><td>1066</td>
                  <td>Web Development Frameworks</td><td>3</td>
                  <td>Introduction to Web Development</td><td>UI/UX Design</td>
                </tr>
                <tr>
                  <td>002498</td><td>INTE</td><td>1067</td>
                  <td>Software Engineering Principles</td><td>3</td>
                  <td>Object-Oriented Programming</td><td></td>
                </tr>
                <tr>
                  <td>002499</td><td>INTE</td><td>1068</td>
                  <td>Network Security</td><td>3</td>
                  <td>Computer Networks</td><td>Cybersecurity Fundamentals</td>
                </tr>
                <tr>
                  <td>002500</td><td>INTE</td><td>1069</td>
                  <td>Artificial Intelligence</td><td>3</td>
                  <td>Discrete Mathematics</td><td>Machine Learning</td>
                </tr>
                <tr>
                  <td>002501</td><td>INTE</td><td>1070</td>
                  <td>Cloud Computing</td><td>3</td>
                  <td>System Administration</td><td></td>
                </tr>
                <tr>
                  <td>002502</td><td>INTE</td><td>1071</td>
                  <td>Data Analytics</td><td>3</td>
                  <td>Statistics &amp; Probability</td><td>Data Visualization</td>
                </tr>
                <tr>
                  <td>002503</td><td>INTE</td><td>1072</td>
                  <td>DevOps Practices</td><td>3</td>
                  <td>Software Engineering Principles</td><td>Cloud Computing</td>
                </tr>
                <tr>
                  <td>002504</td><td>INTE</td><td>1073</td>
                  <td>Internet of Things</td><td>3</td>
                  <td>Embedded Systems</td><td>Network Security</td>
                </tr>
                <tr>
                  <td>002505</td><td>INTE</td><td>1074</td>
                  <td>Blockchain Technology</td><td>3</td>
                  <td>Cryptography</td><td></td>
                </tr>
                <tr>
                  <td>002506</td><td>INTE</td><td>1075</td>
                  <td>Virtual Reality Development</td><td>3</td>
                  <td>3D Graphics Programming</td><td>Game Development</td>
                </tr>
                <tr>
                  <td>002507</td><td>INTE</td><td>1076</td>
                  <td>Quality Assurance Testing</td><td>3</td>
                  <td>Software Engineering Principles</td><td></td>
                </tr>
                <tr>
                  <td>002508</td><td>INTE</td><td>1077</td>
                  <td>Project Management</td><td>3</td>
                  <td>Business Analysis</td><td>Agile Methodologies</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Single custom resize handle (works on mobile + desktop) -->
          <div class="curric-resize-handle"
               role="separator"
               aria-orientation="horizontal"
               aria-label="Resize table container"
               tabindex="0"></div>
        </section>

        <!-- Footer BELOW the card (never hidden on desktop) -->
        <div class="table-footer-container">
          <div class="table-footer">
            <span class="course-count-label">Total Courses: 24</span>
            <button class="update-button" type="button">Update Records</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- ================= Bottom Navigation (global) ================= -->
  <div id="bottomNav">
    <div class="current-page-indicator">Curriculum</div>
    <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="adminstudlist.php">
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Student List
    </button>
  </div>

  <!-- Viewport-centered horizontal-scroll hint (outside card) -->
  <div id="curricScrollHint" class="scroll-hint-overlay">
    <div class="scroll-hint" id="curricHintBox" aria-live="polite">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <!-- Your existing page JS -->
  <script src="../Admin/admin js/admincurr.js"></script>
</body>
</html>
