<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Assessment</title>

  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Student/stud css/studassess.css">
</head>

<body class="assessment">
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
            <li class="nav-item active">
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
          <h1>Assessment</h1>
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

      <!-- ================= Content Area (desktop static; only table scrolls) ================= -->
      <div class="content-scrollable">
        <!-- Card: filters + table (ONLY scroller) -->
        <section class="assess-card">
          <!-- Filters rail (left-aligned) -->
          <div class="filters-rail">
            <div class="filter-group">
              <label class="filter-label" for="semester">Semester</label>
              <select id="semester" class="filter-select">
                <option selected>1st</option>
                <option>2nd</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label" for="yearlevel">Year Level</label>
              <select id="yearlevel" class="filter-select">
                <option>All</option>
                <option>1st</option>
                <option>2nd</option>
                <option>3rd</option>
                <option selected>4th</option>
              </select>
            </div>

            <div class="display-controls">
              <label class="display-label">Display:</label>
              <label class="checkbox-group eligible">
                <input type="checkbox" checked> Eligible
              </label>
              <label class="checkbox-group ineligible">
                <input type="checkbox" checked> Ineligible
              </label>
              <label class="checkbox-group offsem">
                <input type="checkbox" checked> Off sem
              </label>
            </div>
          </div>

          <!-- The ONLY scroller -->
          <div class="table-scroll" id="assessTableScroll">
            <table class="assessment-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr class="row-white">
                  <td>001749</td><td>CTIE1008</td><td>Application Development</td>
                  <td>3</td><td class="status-eligible">Eligible</td><td>All requirements met</td>
                </tr>
                <tr class="row-blue">
                  <td>001701</td><td>STIC1007</td><td>Euthenics 2</td>
                  <td>1</td><td class="status-ineligible">Ineligible</td><td>Missing prerequisites</td>
                </tr>
                <tr class="row-white">
                  <td>002253</td><td>INTE1040</td><td>Game Development</td>
                  <td>3</td><td class="status-offsem">Off-semester</td><td>Not offered this term</td>
                </tr>
                <tr class="row-blue">
                  <td>001702</td><td>MATH1010</td><td>Advanced Calculus</td>
                  <td>4</td><td class="status-eligible">Eligible</td><td>Prerequisites completed</td>
                </tr>
                <tr class="row-white">
                  <td>001703</td><td>PHYS2015</td><td>Quantum Physics</td>
                  <td>3</td><td class="status-ineligible">Ineligible</td><td>Missing corequisite</td>
                </tr>
                <tr class="row-blue">
                  <td>001704</td><td>CHEM1020</td><td>Organic Chemistry</td>
                  <td>4</td><td class="status-offsem">Off-semester</td><td>Offered next semester</td>
                </tr>
                <tr class="row-white">
                  <td>001705</td><td>BIOL2025</td><td>Genetics</td>
                  <td>3</td><td class="status-eligible">Eligible</td><td>All requirements met</td>
                </tr>
                <tr class="row-blue">
                  <td>001706</td><td>COMP3030</td><td>Database Systems</td>
                  <td>3</td><td class="status-eligible">Eligible</td><td>Prerequisites completed</td>
                </tr>
                <tr class="row-white">
                  <td>001707</td><td>ENG3010</td><td>Technical Writing</td>
                  <td>2</td><td class="status-ineligible">Ineligible</td><td>Not available for your program</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Single custom resize handle -->
          <div
            class="assess-resize-handle"
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize table container"
            tabindex="0">
          </div>
        </section>

        <!-- Footer BELOW the card (always visible) -->
        <div class="table-footer-container">
          <div class="table-footer">
            <span id="assessRowCount" class="row-count-label">Subjects in assessment: 0</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <div id="bottomNav">
      <div class="current-page-indicator">Assessment</div>
      <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="studcheck.php">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Checklist
      </button>
      <button id="navRightBtn" class="nav-button primary" type="button" data-href="studenlist.php">
        Enlistment <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- Viewport-centered horizontal-scroll hint (outside card) -->
  <div id="assessScrollHint" class="scroll-hint-overlay" hidden>
    <div class="scroll-hint">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <script src="../Student/stud js/studassess.js"></script>
</body>
</html>
