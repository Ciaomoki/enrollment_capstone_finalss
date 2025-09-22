<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Finalize</title>

  <!-- External Resources -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../assets/globalstyles.css">
  <link rel="stylesheet" href="../Student/stud css/studfinal.css">
</head>

<body class="finalize">
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
            <li class="nav-item active">
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

    <!-- Main Content -->
    <main>
      <!-- Header -->
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars" aria-label="Toggle sidebar" role="button" tabindex="0"></i>
          <h1>Finalize</h1>
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

      <!-- Progress Steps -->
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

      <!-- Content Area (static page; only table scrolls) -->
      <div class="content-wrapper">
        <!-- Draft/Finalize Card -->
        <section class="final-card" id="finalCard">
          <div class="final-card-header">
            <h2 class="final-card-title">Draft Schedule</h2>
            <div class="units-info">
              <span class="units-label">Total Units:</span>
              <span class="units-count">7</span>
              <span class="units-range">MIN: 8 &nbsp; MAX: 21</span>
            </div>
          </div>

          <!-- The only scroller -->
          <div class="table-scroll" id="finalTableScroll">
            <table class="finalize-table">
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
              <tbody id="schedule-table-body">
                <tr class="row-white">
                  <td>001749</td>
                  <td>CTIE1008</td>
                  <td>Application Development</td>
                  <td>3</td>
                  <td>Mon</td>
                  <td>8:00-11:00 AM</td>
                  <td>BSIT 501A</td>
                </tr>
                <tr class="row-blue">
                  <td>001701</td>
                  <td>STIC1007</td>
                  <td>Euthenics 2</td>
                  <td>1</td>
                  <td>Wed</td>
                  <td>2:00-3:00 PM</td>
                  <td>BSIT 701C</td>
                </tr>
                <tr class="row-white">
                  <td>002253</td>
                  <td>INTE1040</td>
                  <td>Game Development</td>
                  <td>3</td>
                  <td>Thu</td>
                  <td>1:00-4:00 PM</td>
                  <td>BSIT 701B</td>
                </tr>
                <!-- Demo rows preserved -->
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
                <tr class="row-white"><td>002253</td><td>INTE1040</td><td>Game Development</td><td>3</td><td>Thu</td><td>1:00-4:00 PM</td><td>BSIT 701B</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Manual resize handle -->
          <div class="final-resize-handle" role="separator" aria-orientation="horizontal" aria-label="Resize schedule container" tabindex="0"></div>
        </section>

        <!-- Action Section -->
        <div class="action-section">
          <div class="action-note">
            * You can still take additional subjects.
          </div>
          <div class="action-buttons">
            <button id="submitValidationBtn" class="btn-submit">
              <i class="fa-solid fa-paper-plane"></i>Send for Validation
            </button>
            <button id="messageValidatorBtn" class="btn-message">
              <i class="fa-solid fa-envelope"></i>Message Validator
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <div id="bottomNav">
      <div class="current-page-indicator">Finalize</div>
      <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="studenlist.php">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Enlistment
      </button>
      <button id="navRightBtn" class="nav-button primary" type="button" data-href="studreport.php">
        Reports <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- Centered horizontal-scroll hint (auto-hides on first scroll) -->
  <div id="finalScrollHint" class="scroll-hint-overlay" hidden>
    <div class="scroll-hint">
      <i class="fa-solid fa-arrows-left-right" style="margin-right:8px;"></i>
      <span><b>Tip:</b> Swipe / scroll sideways to see more columns.</span>
    </div>
  </div>

  <!-- Submit for Validation Modal -->
  <div id="validationModal" class="modal-overlay hidden">
    <div class="modal-content validation-modal">
      <div class="modal-icon validation-icon">
        <i class="fa-solid fa-circle-exclamation"></i>
      </div>
      <h2 class="modal-title">Are you sure you want to submit this schedule for validation?</h2>
      <p class="modal-subtitle">Make sure to check everything before submitting.</p>
      <div class="modal-units-info">
        <div class="modal-total-units">Total Units: 7</div>
        <div class="modal-units-range">MIN: 8 &nbsp;&nbsp; MAX: 21</div>
        <p class="modal-note">"You can still take additional subjects."</p>
      </div>
      <div class="modal-buttons">
        <button id="cancelValidationBtn" class="btn-cancel">Cancel</button>
        <button id="confirmValidationBtn" class="btn-confirm">Submit</button>
      </div>
    </div>
  </div>

  <!-- Message Validator Modal -->
  <div id="messageModal" class="modal-overlay hidden">
    <div class="modal-content message-modal">
      <div class="modal-header">
        <h2 class="modal-title">Send Message to Validator</h2>
        <div class="modal-nav">
          <span class="modal-nav-item"><i class="fa-solid fa-inbox"></i>Inbox</span>
          <span class="modal-nav-item"><i class="fa-solid fa-paper-plane"></i>Sent</span>
        </div>
      </div>
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Subject</label>
          <select class="form-select" id="messageSubject">
            <option>Overload</option>
            <option>Conflict</option>
            <option>Others</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea class="form-textarea" id="messageText" rows="4"></textarea>
        </div>
      </div>
      <div class="modal-buttons">
        <button id="cancelMessageBtn" class="btn-cancel">Cancel</button>
        <button id="sendMessageBtn" class="btn-confirm">Send</button>
      </div>
    </div>
  </div>

  <script src="../Student/stud js/studfinal.js"></script>
</body>
</html>
