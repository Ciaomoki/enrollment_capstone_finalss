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
        <!-- Left Column: Grades -->
        <section class="import-section left-column">
          <div class="import-container">
            <h3>Import Grades</h3>

            <!-- List of Uploaded Grades Files -->
            <div class="uploaded-files-list" data-type="grades">
              <h4>Uploaded Files</h4>
              <div id="gradesFilesList" class="files-list">
                <!-- Files will be populated by JS -->
              </div>
            </div>

            <button type="button" class="manage-imports-btn" data-type="grades">
              <i class="fa-solid fa-plus"></i> Manage Grades
            </button>
          </div>
        </section>

        <!-- Right Column: Schedules -->
        <section class="import-section right-column">
          <div class="import-container">
            <h3>Import Schedules</h3>

            <!-- List of Uploaded Schedules Files -->
            <div class="uploaded-files-list" data-type="schedules">
              <h4>Uploaded Files</h4>
              <div id="schedulesFilesList" class="files-list">
                <!-- Files will be populated by JS -->
              </div>
            </div>

            <button type="button" class="manage-imports-btn" data-type="schedules">
              <i class="fa-solid fa-plus"></i> Manage Schedules
            </button>
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

  <!-- Manage Grades Modal -->
  <div id="manageGradesModal" style="display: none;">
    <div class="manage-modal-container">
      <div class="manage-modal-header">
        <h3 class="manage-modal-title">Manage Grades</h3>
        <button id="manageGradesModalClose" type="button" aria-label="Close modal">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="add">Add Files</button>
        <button class="tab-btn" data-tab="remove">Remove Files</button>
      </div>

      <!-- Add Files Tab -->
      <div class="tab-content active" id="addGradesTab">
        <div class="file-upload-area" data-zone="add-grades">
          <i class="fa-solid fa-plus-circle"></i>
          <h3>Add Grade Files</h3>
          <p>Upload XLSX/CSV files to import grade data.</p>
          <input type="file" id="addGradesFile" accept=".xlsx,.csv" />
        </div>
        <div class="attachments-list" id="addGradesAttachments"></div>
      </div>

      <!-- Remove Files Tab -->
      <div class="tab-content" id="removeGradesTab">
        <!-- Stored Files List -->
        <div class="stored-files-section">
          <h4>Currently Stored Grade Files</h4>
          <div id="storedGradesList" class="stored-files-list">
            <!-- Files will be populated by JavaScript -->
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button id="cancelGradesBtn" type="button">Cancel</button>
        <button id="confirmGradesBtn" type="button" disabled>Add Files</button>
      </div>
    </div>
  </div>

  <!-- Manage Schedules Modal -->
  <div id="manageSchedulesModal" style="display: none;">
    <div class="manage-modal-container">
      <div class="manage-modal-header">
        <h3 class="manage-modal-title">Manage Schedules</h3>
        <button id="manageSchedulesModalClose" type="button" aria-label="Close modal">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="add">Add Files</button>
        <button class="tab-btn" data-tab="remove">Remove Files</button>
      </div>

      <!-- Add Files Tab -->
      <div class="tab-content active" id="addSchedulesTab">
        <div class="file-upload-area" data-zone="add-schedules">
          <i class="fa-solid fa-plus-circle"></i>
          <h3>Add Schedule Files</h3>
          <p>Upload XLSX/CSV files to import schedule data.</p>
          <input type="file" id="addSchedulesFile" accept=".xlsx,.csv" />
        </div>
        <div class="attachments-list" id="addSchedulesAttachments"></div>
      </div>

      <!-- Remove Files Tab -->
      <div class="tab-content" id="removeSchedulesTab">
        <!-- Stored Files List -->
        <div class="stored-files-section">
          <h4>Currently Stored Schedule Files</h4>
          <div id="storedSchedulesList" class="stored-files-list">
            <!-- Files will be populated by JavaScript -->
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button id="cancelSchedulesBtn" type="button">Cancel</button>
        <button id="confirmSchedulesBtn" type="button" disabled>Add Files</button>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div id="deleteConfirmationModal" style="display: none;">
    <div class="delete-modal-container">
      <div class="delete-modal-header">
        <h3 class="delete-modal-title">Confirm Deletion</h3>
        <button id="deleteModalClose" type="button" aria-label="Close modal">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      <div class="delete-modal-body">
        <p>Are you sure you want to delete this file? This will remove the file from the project.</p>
      </div>
      <div class="delete-modal-actions">
        <button id="deleteCancelBtn" type="button">Cancel</button>
        <button id="deleteConfirmBtn" type="button">Delete</button>
      </div>
    </div>
  </div>

  <!-- File Preview Modal -->
  <div id="filePreviewModal" style="display: none;">
    <div class="preview-modal-container">
      <div class="preview-modal-header">
        <h3 class="preview-modal-title">File Preview</h3>
        <button id="filePreviewModalClose" type="button" aria-label="Close modal">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      <div class="preview-modal-body">
        <div id="previewTableContainer" class="preview-table-container">
          <!-- Table will be populated by JS -->
        </div>
      </div>
      <div class="preview-modal-actions">
        <button id="downloadPreviewBtn" type="button">Download File</button>
        <button id="closePreviewBtn" type="button">Close</button>
      </div>
    </div>
  </div>

  <!-- Toast host (custom alerts) -->
  <div id="toastHost" aria-live="polite" aria-atomic="true"></div>

  <script src="../Admin/admin js/admindataim.js"></script>
</body>
</html>
