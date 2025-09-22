<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Validate - One Enrollment</title>

  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Evaluator/eval css/evalval.css">
</head>

<body class="validate-module">
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
          <span class="user-text">Welcome Evaluator!</span>
        </div>

        <nav class="sidebar-nav">
          <ul>
            <li class="nav-item">
              <a href="evaldashb.php" data-page="dashboard">
                <i class="fa-solid fa-house"></i><span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="evalstudlist.php" data-page="studentlist">
                <i class="fa-solid fa-list"></i><span>Student List</span>
              </a>
            </li>
            <li class="nav-item active">
              <a href="evalval.php" data-page="validate">
                <i class="fa-solid fa-book"></i><span>Validate</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="evalreport.php" data-page="reports">
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
          <h1>Validate</h1>
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

      <!-- Validation Grid (structure preserved) -->
      <section class="validation-grid">
        <!-- Left: tables stack (positions preserved) -->
        <div class="tables-section">
          <!-- Student Checklist -->
          <div class="checklist-container">
            <div class="checklist-header">
              <h2>Student Checklist</h2>
              <div class="checklist-filters">
                <select>
                  <option>2nd</option>
                  <option>1st</option>
                  <option>3rd</option>
                  <option>4th</option>
                </select>
                <select>
                  <option>3rd</option>
                  <option>1st</option>
                  <option>2nd</option>
                  <option>4th</option>
                </select>
              </div>
            </div>

            <!-- Single scroller -->
            <div class="table-wrapper">
              <table class="checklist-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Subject Area</th>
                    <th>Catalog No.</th>
                    <th>Description</th>
                    <th>Units</th>
                    <th>Grades</th>
                    <th>Pre Req</th>
                    <th>Co Req</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>002495</td><td>INTE</td><td>1064</td><td>Mobile Technology</td><td>3</td><td>---</td><td>App Dev</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002496</td><td>INTE</td><td>1065</td><td>Networks</td><td>3</td><td>---</td><td>Basic IT</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002497</td><td>COMP</td><td>1066</td><td>Database Systems</td><td>3</td><td>---</td><td>App Dev</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002498</td><td>COMP</td><td>1067</td><td>Web Development</td><td>3</td><td>---</td><td>IT Concepts</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002499</td><td>ITEC</td><td>1068</td><td>Security</td><td>3</td><td>---</td><td>Networking</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002500</td><td>INTE</td><td>1069</td><td>Technical Writing</td><td>3</td><td>---</td><td>Eng 101</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002501</td><td>INTE</td><td>1070</td><td>AI & ML</td><td>3</td><td>---</td><td>Math 2</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002502</td><td>INTE</td><td>1071</td><td>Mobile Apps</td><td>3</td><td>---</td><td>OOP</td><td>None</td>
                  </tr>
                  <tr>
                    <td>002503</td><td>COMP</td><td>1072</td><td>Data Analytics</td><td>3</td><td>---</td><td>Stats</td><td>None</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Per-card resize handle -->
            <div class="table-resize-handle"
                 role="separator"
                 aria-orientation="horizontal"
                 aria-label="Resize checklist table"
                 tabindex="0"></div>
          </div>

          <!-- Proposed Schedule -->
          <div class="schedule-container">
            <div class="schedule-header">
              <h2>Proposed Schedule</h2>
            </div>

            <!-- Single scroller -->
            <div class="table-wrapper">
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Units</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Section</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>001749</td><td>CTIE1008</td><td>App Development</td><td>3</td><td>Wed</td><td>8-11am</td><td>BSIT 501A</td></tr>
                  <tr><td>001750</td><td>CTIE1009</td><td>Systems Development</td><td>3</td><td>Fri</td><td>1-4pm</td><td>BSIT 501B</td></tr>
                  <tr><td>001751</td><td>CTIE1010</td><td>Database Systems</td><td>3</td><td>Mon</td><td>10-1pm</td><td>BSIT 502A</td></tr>
                  <tr><td>001752</td><td>CTIE1011</td><td>UX/UI Design</td><td>3</td><td>Tue</td><td>9-12pm</td><td>BSIT 503</td></tr>
                  <tr><td>001753</td><td>CTIE1012</td><td>Mobile Development</td><td>3</td><td>Thu</td><td>10-1pm</td><td>BSIT 504</td></tr>
                  <tr><td>001754</td><td>CTIE1013</td><td>Capstone Project</td><td>3</td><td>Fri</td><td>2-5pm</td><td>BSIT 505</td></tr>
                  <tr><td>001755</td><td>CTIE1014</td><td>Data Analytics</td><td>3</td><td>Wed</td><td>3-6pm</td><td>BSIT 506</td></tr>
                  <tr><td>001756</td><td>CTIE1015</td><td>Cloud Infrastructure</td><td>3</td><td>Mon</td><td>8-11am</td><td>BSIT 507</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Per-card resize handle -->
            <div class="table-resize-handle"
                 role="separator"
                 aria-orientation="horizontal"
                 aria-label="Resize schedule table"
                 tabindex="0"></div>
          </div>
        </div>

        <!-- Right Panel (unchanged) -->
        <div class="right-panel">
          <div class="current-student" aria-label="Current Student">
            <div class="avatar" aria-hidden="true">
              <i class="fa-solid fa-user"></i>
            </div>
            <div>
              <div class="name">Anna Garcia</div>
              <span class="meta">BSIT<br></span>
              <span class="meta">4th Year</span>
            </div>
          </div>

          <div class="student-switcher" aria-label="Switch Student">
            <button class="switch-btn" title="Previous student" aria-label="Previous student">
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            <div class="student-chooser">
              <button type="button" class="combo-toggle" aria-haspopup="listbox" aria-expanded="false" id="studentComboBtn">
                <span class="combo-label">Select student…</span>
                <i class="fa-solid fa-chevron-down"></i>
              </button>

              <div class="combo-panel" role="listbox" aria-labelledby="studentComboBtn" hidden>
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

            <button class="switch-btn" title="Next student" aria-label="Next student">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div class="message-card">
            <div class="head">
              <div class="title">Message</div>
              <i class="fa-solid fa-envelope-open-text" aria-hidden="true"></i>
            </div>
            <textarea placeholder="Type a message to the student..."></textarea>
            <div class="send-row">
              <button class="btn-send" type="button">
                <i class="fa-solid fa-paper-plane"></i>
                Send
              </button>
            </div>
          </div>

          <div class="flag-buttons">
            <button class="flag-btn" type="button" title="Positive flag">
              <i class="fa-solid fa-thumbs-up icon-up"></i>
              <span>Approve</span>
            </button>
            <button class="flag-btn" type="button" title="Negative flag">
              <i class="fa-solid fa-flag icon-down"></i>
              <span>Flag</span>
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <div id="bottomNav">
      <div class="current-page-indicator">Validate</div>
      <button id="navLeftBtn" class="nav-button secondary" type="button">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Student List
      </button>
      <button id="navRightBtn" class="nav-button primary" type="button">
        Reports <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- One-time X-scroll hint (sub-desktop; shows only if overflow exists) -->
  <div id="validateScrollHint" class="scroll-hint-overlay" hidden>
    <div class="scroll-hint" aria-live="polite">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <script src="../Evaluator/eval js/evalval.js"></script>
</body>
</html>
