<?php
session_start();
require_once __DIR__ . '/../helpers/api_client.php';
$studentId = $_POST['studentId'] ?? $_POST['student_id'] ?? '';
$password  = $_POST['password'] ?? '';
if (!$studentId || !$password) { $_SESSION['error']='Student ID and Password are required'; header('Location: studlogin.php'); exit; }
list($status, $resp, $errno, $error) = api_request('POST', '/api/login/student', ['student_id'=>intval($studentId),'password'=>$password]);
if ($errno) { $_SESSION['error']='Login failed (network): '.$error; header('Location: studlogin.php'); exit; }
$data = json_decode($resp, true);
if ($status===200 && isset($data['token'])) { $_SESSION['token']=$data['token']; $_SESSION['user']=$data['user']; header('Location: studdashb.php'); exit; }
$_SESSION['error']=$data['error'] ?? 'Login failed'; header('Location: studlogin.php'); exit;
?>
