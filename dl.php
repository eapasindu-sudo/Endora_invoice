<?php
// Short download link for WhatsApp messages: /dl.php?app=invoice → the newest installer for this computer (Windows .exe / Mac .dmg).
$app = preg_replace('/[^a-z0-9-]/', '', (string) ($_GET['app'] ?? ''));
$get = function ($u, $gh = false) {
    $c = curl_init($u);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_HTTPHEADER => ['User-Agent: endora-tools'] ]);
    return json_decode((string) curl_exec($c), true);
};
$j   = $get('https://www.endoraweddingfilms.com/perfex_crm/endora_bridge/shop/download?p=' . rawurlencode($app));
$url = is_array($j) ? (string) ($j['url'] ?? '') : '';
if (preg_match('#^https://github\.com/([^/]+/[^/]+)/releases/latest#', $url, $m)) {
    $rel = $get('https://api.github.com/repos/' . $m[1] . '/releases/latest');
    $ua  = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    $mac = stripos($ua, 'Macintosh') !== false || stripos($ua, 'Mac OS X') !== false && stripos($ua, 'iPhone') === false && stripos($ua, 'iPad') === false;
    foreach ((array) ($rel['assets'] ?? []) as $a) {
        $n = (string) $a['name'];
        if ($mac ? preg_match('/\.dmg$/i', $n) : preg_match('/\.exe$/i', $n)) {
            $url = $a['browser_download_url'];
            break;
        }
    }
}
header('Location: ' . ($url !== '' && preg_match('#^https://#', $url) ? $url : '/#' . $app), true, 302);
