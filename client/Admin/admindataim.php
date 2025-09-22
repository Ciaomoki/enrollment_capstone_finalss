<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Data Import - One Enrollment</title>
  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Admin/admin css/admindataim.css">
</head>

<body class="admin-dataimport">
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
            <li class="nav-item active">
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

    <!-- Main Content -->
    <main>
      <!-- Header -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars"></i>
          <h1>Data Import</h1>
        </div>

        <div class="header-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input id="globalSearch" type="search" placeholder="Search" aria-label="Search" />
        </div>

        <div class="header-icons">
          <i class="fa-solid fa-circle-info" title="Info"></i>

          <!-- Inbox button -->
          <button id="inboxBtn" type="button" class="icon-btn inbox-button"
                  aria-expanded="false" aria-controls="inboxDropdown" title="Inbox">
            <i class="fa-solid fa-inbox"></i>
            <span class="badge" id="inboxBadge">3</span>
          </button>

          <span class="student-number">Admin #</span>
          <i class="fa-solid fa-user-circle" title="Profile"></i>
        </div>
      </header>

      <!-- Inbox Dropdown -->
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

      <!-- Scrollable Content Area -->
      <div class="content-scrollable">
        <!-- Import Grades -->
        <section class="import-section">
          <div class="import-container">
            <h3>Import Grades</h3>

            <form class="import-form" data-import-type="grades">
              <div class="dropzone" data-zone="grades">
                <p>Drop a XLSX/CSV file or</p>
                <label class="browse-button">
                  <i class="fa-solid fa-folder-open"></i> Browse files
                  <input type="file" class="file-input" name="file" accept=".xlsx,.csv" />
                </label>
              </div>

              <div class="attachments" aria-live="polite"></div>

              <div class="import-actions">
                <button type="submit" class="btn-submit" disabled>
                  <i class="fa-solid fa-cloud-arrow-up"></i> Upload
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Import Schedules -->
        <section class="import-section">
          <div class="import-container">
            <h3>Import Schedules</h3>

            <form class="import-form" data-import-type="schedules">
              <div class="dropzone" data-zone="schedules">
                <p>Drop a XLSX file or</p>
                <label class="browse-button">
                  <i class="fa-solid fa-folder-open"></i> Browse files
                  <input type="file" class="file-input" name="file" accept=".xlsx" />
                </label>
              </div>

              <div class="attachments" aria-live="polite"></div>

              <div class="import-actions">
                <button type="submit" class="btn-submit" disabled>
                  <i class="fa-solid fa-cloud-arrow-up"></i> Upload
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <div id="bottomNav">
      <div class="current-page-indicator">Data Import</div>

      <button id="navLeftBtn" class="nav-button secondary" type="button">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Evaluators
      </button>

      <button id="navRightBtn" class="nav-button primary" type="button">
        Student List <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- Toast host (custom alerts) -->
  <div id="toastHost" aria-live="polite" aria-atomic="true"></div>

  <script src="../Admin/admin js/admindataim.js"></script>
</body>
</html>
