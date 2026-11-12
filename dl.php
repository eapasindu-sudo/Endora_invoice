<?php
// Short download link for WhatsApp messages: /dl.php?app=invoice → the newest installer for this computer (Windows .exe / Mac .dmg).
$app = preg_replace('/[^a-z0-9-]/', '', (string) ($_GET['app'] ?? ''));
$get = function ($u, $gh = false) {
    $c = curl_init($u);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_HTTPHEADER => ['User-Agent: endora-tools'] ]);
    return json_decode((string) curl_exec($c), true);
};
$ua  = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
$mac = (stripos($ua, 'Macintosh') !== false || stripos($ua, 'Mac OS X') !== false) && stripos($ua, 'iPhone') === false && stripos($ua, 'iPad') === false;
@file_get_contents('https://www.endoraweddingfilms.com/perfex_crm/endora_bridge/shop/track?ev=download&app=' . rawurlencode($app));
// 1) Google Drive copy (kept up to date by the "Drive sync" GitHub workflow)
$man = $get('https://raw.githubusercontent.com/eapasindu-sudo/Endora_invoice/drive-manifest/drive-manifest.json');
foreach ((array) ($man['apps'][$app]['files'] ?? []) as $f) {
    if ($mac ? preg_match('/\.dmg$/i', $f['name']) : preg_match('/\.(exe|msi|apk)$/i', $f['name'])) {
        header('Location: https://drive.usercontent.google.com/download?export=download&confirm=t&id=' . rawurlencode($f['id']), true, 302);
        exit;
    }
}
// 2) Otherwise straight from the release
$j   = $get('https://www.endoraweddingfilms.com/perfex_crm/endora_bridge/shop/download?p=' . rawurlencode($app));
$url = is_array($j) ? (string) ($j['url'] ?? '') : '';
if (preg_match('#^https://github\.com/([^/]+/[^/]+)/releases/latest#', $url, $m)) {
    $rel = $get('https://api.github.com/repos/' . $m[1] . '/releases/latest');
    foreach ((array) ($rel['assets'] ?? []) as $a) {
        $n = (string) $a['name'];
        if ($mac ? preg_match('/\.dmg$/i', $n) : preg_match('/\.exe$/i', $n)) {
            $url = $a['browser_download_url'];
            break;
        }
    }
}
header('Location: ' . ($url !== '' && preg_match('#^https://#', $url) ? $url : '/#' . $app), true, 302);
