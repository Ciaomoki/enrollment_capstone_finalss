<?php
session_start();
if (!isset($_SESSION['token'])) { header('Location: studlogin.php'); exit; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Student Dashboard</title>

  <!-- Icons & Styles -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../assets/globalstyles.css" />
  <link rel="stylesheet" href="../Student/stud css/studdashb.css" />
</head>

<body class="student-dashboard">
  <div class="top-bar"></div>

  <div class="global-container">
    <!-- ================= SIDEBAR ================= -->
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
            <li class="nav-item active">
              <a href="studdashb.php" data-page="dashboard">
                <i class="fa-solid fa-house"></i><span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item"><a href="studcheck.php" data-page="checklist"><i class="fa-solid fa-list-check"></i><span>Checklist</span></a></li>
            <li class="nav-item"><a href="studassess.php" data-page="assessment"><i class="fa-solid fa-bars-progress"></i><span>Assessment</span></a></li>
            <li class="nav-item"><a href="studenlist.php" data-page="enlistment"><i class="fa-solid fa-clipboard-list"></i><span>Enlistment</span></a></li>
            <li class="nav-item"><a href="studfinal.php" data-page="draft"><i class="fa-solid fa-file-lines"></i><span>Draft</span></a></li>
            <li class="nav-item"><a href="studreport.php" data-page="reports"><i class="fa-solid fa-chart-bar"></i><span>Reports</span></a></li>
            <li class="nav-item" id="signout-btn"><a href="#"><i class="fa-solid fa-right-from-bracket"></i><span>Sign out</span></a></li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- ================= MAIN ================= -->
    <main>
      <header>
        <div class="header-left">
          <i id="toggleBtnHeader" class="fa-solid fa-bars"></i>
          <h1>Dashboard</h1>
        </div>

        <div class="header-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input id="globalSearch" type="search" placeholder="Search" aria-label="Search" />
        </div>

        <div class="header-icons">
          <i class="fa-solid fa-circle-info" title="Info"></i>

          <button id="inboxBtn" type="button" class="icon-btn inbox-button"
                  aria-expanded="false" aria-controls="inboxDropdown" title="Inbox">
            <i class="fa-solid fa-inbox"></i>
            <span class="badge" id="inboxBadge">3</span>
          </button>

          <span class="student-number">Student #</span>
          <i class="fa-solid fa-user-circle" title="Profile"></i>
        </div>
      </header>

      <!-- Inbox dropdown (unchanged) -->
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
          <li class="message unread"><button class="message-row"><div class="message-main"><div class="message-title">Enrollment submitted</div><div class="message-snippet">Your enrollment form was received…</div></div><div class="message-meta"><time>12:05</time><span class="dot unread-dot"></span></div></button></li>
          <li class="message"><button class="message-row"><div class="message-main"><div class="message-title">Schedule updated</div><div class="message-snippet">Your assessment schedule moved to Monday 9:00 AM…</div></div><div class="message-meta"><time>10:12</time></div></button></li>
          <li class="message unread"><button class="message-row"><div class="message-main"><div class="message-title">Document request</div><div class="message-snippet">Please upload your latest Form 138…</div></div><div class="message-meta"><time>08:30</time><span class="dot unread-dot"></span></div></button></li>
        </ul>
        <div class="inbox-foot"><a href="#" class="inbox-link" id="viewAllInbox">View all messages</a></div>
      </div>

      <!-- ======= DASHBOARD CONTENT ======= -->
      <section class="dashboard-content">
        <!-- LEFT COLUMN -->
        <div class="dash-left">

          <!-- ===== RESTORED MEDIA BANNER (CSS slider) ===== -->
          <section class="media-slideshow" aria-label="Announcements">
            <!-- radios -->
            <input type="radio" name="sd-slides" id="sd-slide-1" checked>
            <input type="radio" name="sd-slides" id="sd-slide-2">
            <input type="radio" name="sd-slides" id="sd-slide-3">

            <!-- slides -->
            <div class="slides">
              <div class="track">
                <article class="slide">
                  <img src="https://picsum.photos/1280/420?random=11" alt="Enrollment reminders">
                  <div class="caption">Enrollment Reminders</div>
                </article>
                <article class="slide">
                  <img src="https://picsum.photos/1280/420?random=12" alt="Campus updates">
                  <div class="caption">Campus Updates</div>
                </article>
                <article class="slide">
                  <img src="https://picsum.photos/1280/420?random=13" alt="Assessment tips">
                  <div class="caption">Assessment Tips</div>
                </article>
              </div>
            </div>

            <!-- arrows: prev / next (wired via :checked) -->
            <div class="nav" aria-hidden="true">
              <label class="arrow" for="sd-slide-3" title="Previous">
                <i class="fa-solid fa-chevron-left"></i>
              </label>
              <label class="arrow" for="sd-slide-2" title="Next">
                <i class="fa-solid fa-chevron-right"></i>
              </label>
            </div>

            <!-- dots -->
            <div class="dots" role="tablist" aria-label="Slide navigation">
              <label class="dot" for="sd-slide-1" aria-label="Slide 1"></label>
              <label class="dot" for="sd-slide-2" aria-label="Slide 2"></label>
              <label class="dot" for="sd-slide-3" aria-label="Slide 3"></label>
            </div>
          </section>

          <!-- Greeting -->
          <div class="greeting-card">
            <div class="greet-head">
              <h2>Greetings Student Name!</h2>
              <ul class="greet-meta">
                <li><strong>Department</strong></li>
                <li><strong>Semester</strong></li>
                <li><strong>Academic Year</strong></li>
              </ul>
            </div>
            <p class="greet-sub">Complete your evaluation and assessment in five easy steps!</p>
          </div>

          <!-- Steps (horizontal chips, scrolls on small screens) -->
          <div class="student-steps">
            <ul class="steps-list">
              <li class="step-item" data-page="studcheck.php"><i class="fa-solid fa-list-check"></i><span>Checklist</span></li>
              <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
              <li class="step-item" data-page="studassess.php"><i class="fa-solid fa-bars-progress"></i><span>Assessment</span></li>
              <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
              <li class="step-item" data-page="studenlist.php"><i class="fa-solid fa-clipboard-list"></i><span>Enlistment</span></li>
              <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
              <li class="step-item" data-page="studfinal.php"><i class="fa-solid fa-file-signature"></i><span>Finalize</span></li>
              <li class="arrow-icon"><i class="fa-solid fa-chevron-right"></i></li>
              <li class="step-item" data-page="studreport.php"><i class="fa-solid fa-circle-check"></i><span>Complete</span></li>
            </ul>
          </div>

          <!-- KPI CARDS -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-head"><i class="fa-solid fa-file-circle-check"></i><h3>Pre Assessment Status</h3></div>
              <div><div class="kpi-value">Pending</div><div class="kpi-caption">Last update: —</div></div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head"><i class="fa-solid fa-clipboard-list"></i><h3>Enlisted Subjects</h3></div>
              <div><div class="kpi-value">10</div><div class="kpi-caption">(30 units)</div></div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head"><i class="fa-solid fa-list-ul"></i><h3>Eligible Subjects</h3></div>
              <div><div class="kpi-value">10</div><div class="kpi-caption">(30 units)</div></div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head"><i class="fa-solid fa-bars-staggered"></i><h3>Eligible Units</h3></div>
              <div><div class="kpi-value">20</div><div class="kpi-caption">based on prerequisites</div></div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head"><i class="fa-solid fa-scale-balanced"></i><h3>Credits Limit</h3></div>
              <div><div class="kpi-value">20/26</div><div class="kpi-caption">units used / maximum</div></div>
            </div>

            <div class="kpi-card">
              <div class="kpi-head"><i class="fa-solid fa-hourglass-half"></i><h3>Deadline Countdown</h3></div>
              <div class="tile">
                <div class="tile-body">
                  <div id="deadlineCountdown" class="countdown" data-deadline="2025-10-01T23:59:59">
                    <div class="cd-part"><span class="cd-val" data-cd="days">05</span><span class="cd-lbl">days</span></div>
                    <div class="cd-sep">:</div>
                    <div class="cd-part"><span class="cd-val" data-cd="hrs">10</span><span class="cd-lbl">hrs</span></div>
                    <div class="cd-sep">:</div>
                    <div class="cd-part"><span class="cd-val" data-cd="mins">45</span><span class="cd-lbl">mins</span></div>
                    <div class="cd-sep">:</div>
                    <div class="cd-part"><span class="cd-val" data-cd="secs">00</span><span class="cd-lbl">secs</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div><!-- /kpi-grid -->

          <div class="dashboard-tip"><em>Tip: You can change your preferred schedule anytime before finalizing your enrollment.</em></div>
        </div><!-- /dash-left -->

        <!-- RIGHT COLUMN -->
        <aside class="dash-right">
          <section class="panel-card evaluator-card">
            <div class="panel-head"><h3>Assigned evaluator</h3></div>
            <div class="panel-body eval-body">
              <div class="eval-row">
                <div class="eval-avatar" aria-hidden="true">EA</div>
                <div class="eval-info">
                  <div class="eval-name">Engr. Alex Dela Cruz</div>
                  <div class="eval-role">Evaluator • College of Engineering</div>
                  <ul class="eval-meta">
                    <li><i class="fa-solid fa-envelope"></i><span>alex.delacruz@univ.edu</span></li>
                  </ul>
                </div>
                <span class="status-pill online"><i class="fa-solid fa-circle"></i> Online</span>
              </div>
              <div class="panel-actions">
                <button class="btn btn-outline"><i class="fa-solid fa-paper-plane"></i> Message</button>
              </div>
            </div>
            
          </section>

          <!-- Step-by-step guide (right rail) -->
          <section class="panel-card panel-steps">
            <div class="panel-title">Step-by-step guide</div>
            <div class="steps-body">
              <ol class="step-list">
                <li class="step-item">
                  <span class="step-num">1</span>
                  <div class="step-main">
                    <div class="step-title">Review</div>
                    <p class="step-desc">your student checklist.</p>
                  </div>
                </li>
                <li class="step-item">
                  <span class="step-num">2</span>
                  <div class="step-main">
                    <div class="step-title">Assess</div>
                    <p class="step-desc">eligible subjects.</p>
                  </div>
                </li>
                <li class="step-item">
                  <span class="step-num">3</span>
                  <div class="step-main">
                    <div class="step-title">Enlist</div>
                    <p class="step-desc">preferred schedule.</p>
                  </div>
                </li>
                <li class="step-item">
                  <span class="step-num">4</span>
                  <div class="step-main">
                    <div class="step-title">Finalize</div>
                    <p class="step-desc">your pre-assessment draft.</p>
                  </div>
                </li>
                <li class="step-item">
                  <span class="step-num">5</span>
                  <div class="step-main">
                    <div class="step-title">Submit</div>
                    <p class="step-desc">and await approval.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section class="panel-card">
            <div class="panel-head"><h3>Dashboard guide</h3></div>
            <div class="panel-body">
              <ul class="guide-list">
                <li class="guide-item"><div class="guide-icon"><i class="fa-solid fa-file-circle-check"></i></div><div class="guide-text"><div class="guide-title">Pre Assessment Status</div><p>Track your evaluation from assessment to approval.</p></div></li>
                <li class="guide-item"><div class="guide-icon"><i class="fa-solid fa-square-check"></i></div><div class="guide-text"><div class="guide-title">Credited Subjects</div><p>Courses you’ve already completed toward your program.</p></div></li>
                <li class="guide-item"><div class="guide-icon"><i class="fa-solid fa-list-ul"></i></div><div class="guide-text"><div class="guide-title">Eligible Subjects</div><p>Offered this term based on your prerequisites.</p></div></li>
              </ul>
            </div>
          </section>

          <section class="panel panel-activity">
            <div class="panel-title">Recent Activity</div>
            <div class="panel-body">
              <ul class="activity-list">
                <li class="activity-row">
                  <span class="activity-time">10:30 am</span>
                  <div class="activity-text">
                    <strong>Added Subject – Math 101</strong>
                    <span>5 hours ago</span>
                  </div>
                </li>
                <li class="activity-row">
                  <span class="activity-time">09:15 am</span>
                  <div class="activity-text">
                    <strong>Updated Schedule – CS 202</strong>
                    <span>6 hours ago</span>
                  </div>
                </li>
                <li class="activity-row">
                  <span class="activity-time">08:40 am</span>
                  <div class="activity-text">
                    <strong>Generated Assessment Draft</strong>
                    <span>7 hours ago</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

        </aside>
      </section>

      <div class="dashboard-spacer"></div>
    </main>

    <div id="bottomNav">
      <div class="current-page-indicator">Dashboard</div>
      <button id="navRightBtn" class="nav-button primary" type="button">
        Checklist <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- Your existing JS (if any) can remain; not required for slider/countdown layout -->
  <script src="../Student/stud js/studdashb.js"></script>
</body>
</html>