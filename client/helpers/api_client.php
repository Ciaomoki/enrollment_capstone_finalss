<?php
// Minimal API client for calling the Node backend from PHP.
if (!defined('API_BASE')) {
  $envApi = getenv('API_BASE');
  define('API_BASE', $envApi ? $envApi : 'http://localhost:5000');
}
function api_request($method, $path, $payload = null, $token = null) {
  $url = rtrim(API_BASE, '/') . $path;
  $ch = curl_init($url);
  $headers = ['Content-Type: application/json'];
  if ($token) $headers[] = 'Authorization: Bearer '.$token;
  $opts = [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => strtoupper($method),
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 20,
  ];
  if (!is_null($payload)) { $opts[CURLOPT_POSTFIELDS] = json_encode($payload); }
  curl_setopt_array($ch, $opts);
  $resp = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $errno = curl_errno($ch);
  $error = curl_error($ch);
  curl_close($ch);
  return [$status, $resp, $errno, $error];
}
?>
