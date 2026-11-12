<?php
// Short download link for WhatsApp messages: /dl.php?app=invoice → newest installer.
$app = preg_replace('/[^a-z0-9-]/', '', (string) ($_GET['app'] ?? ''));
$c = curl_init('https://www.endoraweddingfilms.com/perfex_crm/endora_bridge/shop/download?p=' . rawurlencode($app));
curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15]);
$j = json_decode((string) curl_exec($c), true);
$url = is_array($j) ? (string) ($j['url'] ?? '') : '';
header('Location: ' . ($url !== '' && preg_match('#^https://#', $url) ? $url : '/#' . $app), true, 302);
