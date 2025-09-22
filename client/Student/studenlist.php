<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enlistment</title>

  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Student/stud css/studenlist.css">
</head>

<body class="enlistment">
  <!-- Top Yellow Stripe -->
  <div class="top-bar"></div>

  <div class="global-container">
    <!-- SIDEBAR -->
    <aside id="sidebar" class="sidebar">
      <div>
        <div class="sidebar-header">
          <span class="logo-icon">1</span>
          <span class="logo-text">One Enrollment</span>
        </div>

        <div class="sidebar-user">
          <i class="fa-solid fa-user-circle user-icon"></i>
          <span class="user-text">Welcome Student!</span>
        </div>

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
            <li class="nav-item active">
              <a href="studenlist.php" data-page="enlistment">
                <i class="fa-solid fa-clipboard-list"></i><span>Enlistment</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="studfinal.php" data-page="draft">
                <i class="fa-solid fa-file-lines"></i><span>Draft</span>
              </a>
            </li>
            <li class="nav-item">
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

    <!-- MAIN -->
    <main>
      <!-- Header -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars" aria-label="Toggle sidebar" role="button" tabindex="0"></i>
          <h1>Enlistment</h1>
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

      <!-- Steps -->
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

      <!-- ================= Content Area (desktop static) ================= -->
      <div class="content-scrollable">
        <div class="tables-section">
          <!-- ===== Available Subjects CARD ===== -->
          <section class="table-half">
            <div class="table-card" id="availCard">
              <h2 class="table-title">Available Subjects</h2>

              <!-- Filters INSIDE the card -->
              <div class="filter-section">
                <div class="filter-chips-container">
                  <div class="filter-chips">
                    <button class="chip-filter active" onclick="filterSubjects('All', this)">All Subjects</button>
                    <button class="chip-filter" onclick="filterSubjects('Euthenics 2', this)">Euthenics 2</button>
                    <button class="chip-filter" onclick="filterSubjects('Game Development', this)">Game Development</button>
                    <button class="chip-filter" onclick="filterSubjects('Computer Graphics Programming', this)">Computer Graphics Programming</button>
                  </div>
                </div>
              </div>

              <!-- The ONLY scroller (this card) -->
              <div class="table-scroll" id="availTableScroll">
                <table class="enlistment-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Units</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Section</th>
                    </tr>
                  </thead>
                  <tbody id="schedule-body"><!-- populated by JS --></tbody>
                </table>
              </div>

              <!-- Single custom resize handle -->
              <div class="enlist-resize-handle" role="separator" aria-orientation="horizontal" aria-label="Resize available subjects container" tabindex="0"></div>
            </div>
          </section>

          <!-- ===== Your Schedule CARD ===== -->
          <section class="table-half">
            <div class="table-card" id="yourCard">
              <h2 class="table-title">Your Schedule</h2>

              <!-- The ONLY scroller (this card) -->
              <div class="table-scroll" id="yourTableScroll">
                <table class="enlistment-table">
                    <thead>
                      <tr>
                        <th class="subject-col">Subject Name</th>
                        <th class="units-col">Units</th>
                        <th class="day-col">Day</th>
                        <th class="time-col">Time</th>
                        <th class="section-col">Section</th>
                        <th class="remove-col" aria-label="Remove"></th>
                      </tr>
                    </thead>

                  <tbody id="your-schedule-body">
                    <tr id="empty-state-row" class="empty-state">
                      <td colspan="6">No courses enlisted yet</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Single custom resize handle -->
              <div class="enlist-resize-handle" role="separator" aria-orientation="horizontal" aria-label="Resize your schedule container" tabindex="0"></div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <div id="bottomNav">
      <div class="current-page-indicator">Enlistment</div>
      <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="studassess.php">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Assessment
      </button>
      <button id="navRightBtn" class="nav-button primary" type="button" data-href="studfinal.php">
        Finalize <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- Viewport-centered horizontal-scroll hint (global; hides on first scroll) -->
  <div id="enlistScrollHint" class="scroll-hint-overlay" hidden>
    <div class="scroll-hint">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <script src="../Student/stud js/studenlist.js"></script>
</body>
</html>
