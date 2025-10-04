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

      <!-- Content Area -->
      <div class="content-scrollable">
        <section class="curric-card">
          <div class="curric-card-header">
            <h2 class="curric-title">STI College Bacoor Students (SY: 2025–2026)</h2>

            <!-- Filters: visual same as Name; multi-select menus in dropdown -->
            <div class="filters-rail">
              <!-- Name (dropdown with search and A-Z) -->
              <div class="filter-group ns" data-ns="name">
                <label>Name</label>
                <button type="button" class="ns-button" id="nameBtn" aria-haspopup="listbox" aria-expanded="false">All Names</button>
                <div class="ns-menu" id="nameMenu" role="listbox" hidden>
                  <div class="ns-search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="search" id="nameSearch" placeholder="Search names..." aria-label="Search names">
                    <button type="button" id="nameSearchClear" class="ns-clear-btn" title="Clear search">
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                  <div class="ns-grid" id="nameGrid">
                    <button class="ns-letter active" data-letter="ALL">All</button>
                    <button class="ns-letter" data-letter="A">A</button>
                    <button class="ns-letter" data-letter="B">B</button>
                    <button class="ns-letter" data-letter="C">C</button>
                    <button class="ns-letter" data-letter="D">D</button>
                    <button class="ns-letter" data-letter="E">E</button>
                    <button class="ns-letter" data-letter="F">F</button>
                    <button class="ns-letter" data-letter="G">G</button>
                    <button class="ns-letter" data-letter="H">H</button>
                    <button class="ns-letter" data-letter="I">I</button>
                    <button class="ns-letter" data-letter="J">J</button>
                    <button class="ns-letter" data-letter="K">K</button>
                    <button class="ns-letter" data-letter="L">L</button>
                    <button class="ns-letter" data-letter="M">M</button>
                    <button class="ns-letter" data-letter="N">N</button>
                    <button class="ns-letter" data-letter="O">O</button>
                    <button class="ns-letter" data-letter="P">P</button>
                    <button class="ns-letter" data-letter="Q">Q</button>
                    <button class="ns-letter" data-letter="R">R</button>
                    <button class="ns-letter" data-letter="S">S</button>
                    <button class="ns-letter" data-letter="T">T</button>
                    <button class="ns-letter" data-letter="U">U</button>
                    <button class="ns-letter" data-letter="V">V</button>
                    <button class="ns-letter" data-letter="W">W</button>
                    <button class="ns-letter" data-letter="X">X</button>
                    <button class="ns-letter" data-letter="Y">Y</button>
                    <button class="ns-letter" data-letter="Z">Z</button>
                  </div>
                </div>
              </div>

              <!-- Department -->
              <div class="filter-group ms" data-ms="dept">
                <label>Department</label>
                <button type="button" class="ms-button" id="deptBtn" aria-haspopup="listbox" aria-expanded="false">All</button>
                <div class="ms-menu" id="deptMenu" role="listbox" hidden>
                  <div class="ms-actions">
                    <button type="button" data-act="all">Select all</button>
                    <button type="button" data-act="clear">Clear</button>
                  </div>
                  <label class="ms-option"><input type="checkbox" value="BSIT" checked> BSIT</label>
                  <label class="ms-option"><input type="checkbox" value="BAOM" checked> BAOM</label>
                  <label class="ms-option"><input type="checkbox" value="BSTM" checked> BSTM</label>
                  <label class="ms-option"><input type="checkbox" value="BAPSYCH" checked> BAPSYCH</label>
                  <label class="ms-option"><input type="checkbox" value="BSCS" checked> BSCS</label>
                </div>
              </div>

              <!-- Year Level -->
              <div class="filter-group ms" data-ms="year">
                <label>Year Level</label>
                <button type="button" class="ms-button" id="yearBtn" aria-haspopup="listbox" aria-expanded="false">All</button>
                <div class="ms-menu" id="yearMenu" role="listbox" hidden>
                  <div class="ms-actions">
                    <button type="button" data-act="all">Select all</button>
                    <button type="button" data-act="clear">Clear</button>
                  </div>
                  <label class="ms-option"><input type="checkbox" value="1" checked> 1</label>
                  <label class="ms-option"><input type="checkbox" value="2" checked> 2</label>
                  <label class="ms-option"><input type="checkbox" value="3" checked> 3</label>
                  <label class="ms-option"><input type="checkbox" value="4" checked> 4</label>
                </div>
              </div>

              <!-- Semester -->
              <div class="filter-group ms" data-ms="semester">
                <label>Semester</label>
                <button type="button" class="ms-button" id="semesterBtn" aria-haspopup="listbox" aria-expanded="false">All</button>
                <div class="ms-menu" id="semesterMenu" role="listbox" hidden>
                  <div class="ms-actions">
                    <button type="button" data-act="all">Select all</button>
                    <button type="button" data-act="clear">Clear</button>
                  </div>
                  <label class="ms-option"><input type="checkbox" value="1st" checked> 1st</label>
                  <label class="ms-option"><input type="checkbox" value="2nd" checked> 2nd</label>
                </div>
              </div>

              <!-- Assessment Status -->
              <div class="filter-group ms" data-ms="status">
                <label>Assessment Status</label>
                <button type="button" class="ms-button" id="statusBtn" aria-haspopup="listbox" aria-expanded="false">All</button>
                <div class="ms-menu" id="statusMenu" role="listbox" hidden>
                  <div class="ms-actions">
                    <button type="button" data-act="all">Select all</button>
                    <button type="button" data-act="clear">Clear</button>
                  </div>
                  <label class="ms-option"><input type="checkbox" value="COMPLETE" checked> COMPLETE</label>
                  <label class="ms-option"><input type="checkbox" value="PENDING" checked> PENDING</label>
                </div>
              </div>

              <div class="filter-group">
                <label>&nbsp;</label>
                <button id="applyFiltersBtn" class="apply-btn" type="button" title="Apply filters">Apply</button>
              </div>
            </div>
          </div>

          <!-- The ONLY scroller -->
          <div class="table-scroll">
            <table class="student-table">
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Student Name</th>
                  <th>Year Level</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Assessment Status</th>
                </tr>
              </thead>
              <tbody id="studentTbody"><!-- placeholder rows injected by JS --></tbody>
            </table>
          </div>

          <!-- Single custom resize handle -->
          <div class="curric-resize-handle" role="separator" aria-orientation="horizontal" aria-label="Resize table container" tabindex="0"></div>
        </section>

        <!-- Footer BELOW the card -->
        <div class="table-footer-container">
          <div class="table-footer">
            <span class="student-count-label" id="studentCount">Total Students: 0</span>
            <div class="record-actions">
              <button class="update-button" id="updateRecordsBtn" type="button">
                Manage Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Bottom Navigation -->
  <div id="bottomNav" data-left-default="admindataim.php" data-right-default="admincurr.php">
    <div class="current-page-indicator">Student List</div>
    <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="admindataim.php">
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Data Import
    </button>
    <button id="navRightBtn" class="nav-button primary" type="button" data-href="admincurr.php">
      Curriculum <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  </div>

  <!-- X-scroll hint -->
  <div id="curricScrollHint" class="scroll-hint-overlay">
    <div class="scroll-hint" aria-live="polite">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <!-- Manage Records Modal -->
  <div id="manageRecordsModal">
    <div class="manage-modal-container">
      <div class="manage-modal-header">
        <h3 class="manage-modal-title">Manage Student Records</h3>
        <button id="manageModalClose" type="button" aria-label="Close modal">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="add">Add Records</button>
        <button class="tab-btn" data-tab="remove">Remove Records</button>
      </div>

      <!-- Add Records Tab -->
      <div class="tab-content active" id="addTab">
        <div class="file-upload-area" data-zone="add-records">
          <i class="fa-solid fa-plus-circle"></i>
          <h3>Add Student Records</h3>
          <p>Upload a CSV, XLSX, or PDF file to import new student records.</p>
          <input type="file" id="addRecordsFile" accept=".csv,.xlsx,.pdf" />
        </div>
        <div class="attachments-list" id="addRecordsAttachments"></div>
      </div>

      <!-- Remove Records Tab -->
      <div class="tab-content" id="removeTab">
        <!-- Stored Records List -->
        <div class="stored-records-section">
          <h4>Currently Stored Records</h4>
          <div id="storedRecordsList" class="stored-records-list">
            <!-- Records will be populated by JavaScript -->
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button id="cancelAddBtn" type="button">Cancel</button>
        <button id="confirmAddBtn" type="button" disabled>Add Records</button>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div id="deleteConfirmationModal">
    <div class="delete-modal-container">
      <div class="delete-modal-header">
        <h3 class="delete-modal-title">Confirm Deletion</h3>
        <button id="deleteModalClose" type="button" aria-label="Close modal">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      <div class="delete-modal-body">
        <p>Are you sure you want to delete this record? This will remove the file from the project.</p>
      </div>
      <div class="delete-modal-actions">
        <button id="deleteCancelBtn" type="button">Cancel</button>
        <button id="deleteConfirmBtn" type="button">Delete</button>
      </div>
    </div>
  </div>

  <script src="../Admin/admin js/adminstudlist.js"></script>
</body>
</html>
