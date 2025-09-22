# Connection Report
PHP handlers were wired to the Node API (http://localhost:5000).
A reusable PHP helper exists at client/helpers/api_client.php.
- Student/studcheck.php: patched
- Student/studregister.php: patched
- Evaluator/evalcheck.php: missing
- Evaluator/evalregister-submit.php: missing
- Admin/admincheck.php: missing
- Student/studdashb.php: guard added
- Evaluator/evaldashb.php: guard added
- Admin/admindashb.php: guard added