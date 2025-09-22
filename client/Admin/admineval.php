<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Evaluators - One Enrollment</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../assets/globalstyles.css" />
  <link rel="stylesheet" href="../Admin/admin css/admineval.css" />
</head>

<body class="admin-evaluators">
  <div class="top-bar"></div>

  <div class="global-container">
    <!-- Sidebar -->
    <aside id="sidebar" class="sidebar">
      <div>
        <div class="sidebar-header"><span class="logo-icon">1</span><span class="logo-text">One Enrollment</span></div>
        <div class="sidebar-user"><i class="fa-solid fa-user-circle user-icon"></i><span class="user-text">Welcome Admin!</span></div>
        <nav class="sidebar-nav">
          <ul>
            <li class="nav-item"><a href="admindashb.php" data-page="dashboard"><i class="fa-solid fa-house"></i><span>Dashboard</span></a></li>
            <li class="nav-item active"><a href="admineval.php" data-page="evaluators"><i class="fa-solid fa-users"></i><span>Evaluators</span></a></li>
            <li class="nav-item"><a href="admindataim.php" data-page="dataimport"><i class="fa-solid fa-file-import"></i><span>Data Import</span></a></li>
            <li class="nav-item"><a href="adminstudlist.php" data-page="studentlist"><i class="fa-solid fa-list"></i><span>Student List</span></a></li>
            <li class="nav-item"><a href="admincurr.php" data-page="curriculum"><i class="fa-solid fa-book-open"></i><span>Curriculum</span></a></li>
            <li class="nav-item"><a href="adminreport.php" data-page="reports"><i class="fa-solid fa-book-open"></i><span>Reports</span></a><li>
            <li class="nav-item" id="signout-btn"><a href="#" data-page="signout"><i class="fa-solid fa-right-from-bracket"></i><span>Sign out</span></a></li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Main -->
    <main>
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars" aria-label="Toggle sidebar" role="button" tabindex="0"></i>
          <h1>Evaluators</h1>
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

      <!-- Page content (Bottom Nav-safe) -->
      <div class="content-scrollable">
        <section class="page-grid">
          <!-- LEFT container -->
          <section class="eval-left">
            <div class="eval-left-card">
              <div class="evals-head">
                <h3>Active Evaluators</h3>
                <div class="filters">
                  <div class="filter">
                    <label for="deptSelect">Department</label>
                    <select id="deptSelect">
                      <option>All</option><option>IT</option><option>Business</option><option>Nursing</option><option>Engineering</option>
                    </select>
                  </div>
                  <div class="filter">
                    <label for="yearSelect">Year Level</label>
                    <select id="yearSelect">
                      <option>All</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- The only left-side scroller -->
              <div class="cards-scroll">
                <div class="cards-grid">
                  <!-- (Plenty of cards to prove overflow works) -->
                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Dr. Maria Cruz</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1001</li><li>Department: IT</li>
                      <li>maria.cruz@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Dr. Ana Reyes</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1002</li><li>Department: Business</li>
                      <li>ana.reyes@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Prof. Juan Dela Cruz</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1003</li><li>Department: Engineering</li>
                      <li>juan.dc@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Dr. Jane Santos</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1004</li><li>Department: Nursing</li>
                      <li>jane.santos@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Prof. Liza Tan</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1006</li><li>Department: Business</li>
                      <li>liza.tan@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Prof. Noel Ramos</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1007</li><li>Department: Engineering</li>
                      <li>noel.ramos@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Dr. Irene Gomez</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1008</li><li>Department: Nursing</li>
                      <li>irene.gomez@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Prof. Allan Uy</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1009</li><li>Department: IT</li>
                      <li>allan.uy@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Dr. Nina Cruz</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1010</li><li>Department: Business</li>
                      <li>nina.cruz@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Prof. Mark Villanueva</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1011</li><li>Department: Engineering</li>
                      <li>mark.v@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>

                  <!-- add one more row just to prove overflow -->
                  <article class="eval-card">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h4 class="eval-name">Dr. Celeste Ong</h4>
                    <ul class="eval-meta">
                      <li>Employee ID: 1012</li><li>Department: Nursing</li>
                      <li>celeste.ong@example.com</li>
                    </ul>
                    <div class="status-pill"><span class="dot"></span>Online</div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          <!-- RIGHT container -->
          <aside class="eval-right">
            <div class="requests-panel">
              <h3>Evaluator Requests</h3>
              <div class="requests-list">
                <!-- Lots of items to show internal scrolling -->
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">John Reyes</div><div class="req-id">Employee ID: 2211</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Maria Santos</div><div class="req-id">Employee ID: 2212</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Joel Chan</div><div class="req-id">Employee ID: 2213</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Aileen Cruz</div><div class="req-id">Employee ID: 2214</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Rico Santos</div><div class="req-id">Employee ID: 2215</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Grace Lim</div><div class="req-id">Employee ID: 2216</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Rey Bautista</div><div class="req-id">Employee ID: 2217</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Cathy Uy</div><div class="req-id">Employee ID: 2218</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Ian Torres</div><div class="req-id">Employee ID: 2219</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Nina Alvarez</div><div class="req-id">Employee ID: 2220</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Owen Lee</div><div class="req-id">Employee ID: 2221</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
                <div class="request-item"><div class="req-left"><div class="req-avatar"><i class="fa-regular fa-user"></i></div><div class="req-meta"><div class="req-name">Pam dela Rosa</div><div class="req-id">Employee ID: 2222</div></div></div><div class="req-actions"><button class="btn-pill approve"><i class="fa-solid fa-thumbs-up"></i> Approve</button><button class="btn-pill decline"><i class="fa-solid fa-thumbs-down"></i> Decline</button></div></div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  </div>

  <!-- Bottom Nav (unchanged) -->
  <div id="bottomNav" data-left-default="admindashb.php" data-right-default="admindataim.php">
    <div class="current-page-indicator">Evaluators</div>
    <button id="navLeftBtn" class="nav-button secondary" type="button" data-href="admindashb.php">
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Dashboard
    </button>
    <button id="navRightBtn" class="nav-button primary" type="button" data-href="admindataim.php">
      Data Import <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  </div>

  <!-- Your existing page JS include (no new inline JS added) -->
  <script src="../Admin/admin js/admineval.js"></script>
</body>
</html>
