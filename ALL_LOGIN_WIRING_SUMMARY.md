All-role Login Wiring Results:
- student_login: already wired
- student_register: already wired
- student_dash_guard: exists
- evaluator_login: patched evaldashb.php
- evaluator_register: already wired
- evaluator_dash_guard: patched evaldashb.php
- admin_login: patched admindashb.php
- admin_dash_guard: exists
- server_port_default: {'server.js': '5000'}