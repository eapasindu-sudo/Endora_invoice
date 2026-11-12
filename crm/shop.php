<?php

defined('BASEPATH') or exit('No direct script access allowed');

/* Endora Live Tools shop: software catalog, orders, licence keys, trials. Public page: tools.endoraweddingfilms.com */

function endora_bridge_shop_tables()
{
    $CI = &get_instance();
    $p  = db_prefix();
    if (!$CI->db->table_exists($p . 'endora_licenses')) {
        $cs = $CI->db->char_set;
        $CI->db->query('CREATE TABLE `' . $p . 'endora_licenses` (`id` int(11) NOT NULL AUTO_INCREMENT, `lic_key` varchar(40) NOT NULL DEFAULT \'\', `product` varchar(40) NOT NULL, `plan` varchar(10) NOT NULL, `seats` int(11) NOT NULL DEFAULT 1, `clientid` int(11) NOT NULL DEFAULT 0, `invoiceid` int(11) NOT NULL DEFAULT 0, `name` varchar(120) NOT NULL, `phone` varchar(20) NOT NULL, `status` varchar(12) NOT NULL DEFAULT \'pending\', `machines` text, `created_at` datetime NOT NULL, `approved_at` datetime DEFAULT NULL, `expires_at` date DEFAULT NULL, `wa_sent` tinyint(1) NOT NULL DEFAULT 0, PRIMARY KEY (`id`), KEY `lic_key` (`lic_key`), KEY `phone` (`phone`)) ENGINE=InnoDB DEFAULT CHARSET=' . $cs . ';');
        $CI->db->query('CREATE TABLE `' . $p . 'endora_trials` (`id` int(11) NOT NULL AUTO_INCREMENT, `product` varchar(40) NOT NULL, `name` varchar(120) NOT NULL, `phone` varchar(20) NOT NULL, `ip` varchar(45) NOT NULL DEFAULT \'\', `created_at` datetime NOT NULL, PRIMARY KEY (`id`), KEY `phone` (`phone`)) ENGINE=InnoDB DEFAULT CHARSET=' . $cs . ';');
    }
}

function endora_bridge_shop_products()
{
    // id => [name, key prefix, price LKR (1 computer, one-time + 1 year updates), name in endora_bridge_software() or a download URL]
    return [
        'atem-switcher' => ['ATEM Web Switcher', 'ATM', 15000, 'sw:ATEM Switcher'],
        'atem-tally'    => ['ATEM Tally for DJI RC Pro', 'TLY', 7500, 'sw:ATEM Switcher'],
        'atem-ccu'      => ['ATEM CCU', 'CCU', 12000, ''],
        'cricket-scorer' => ['Cricket Scorer', 'CRK', 25000, 'sw:Cricket Scorer'],
        'playout'       => ['Endora Playout + CG Composer', 'PLY', 45000, 'sw:Endora Playout'],
        'replay'        => ['Endora Replay', 'RPL', 30000, 'sw:Endora Replay'],
        'led-display'   => ['Endora LED Display', 'LED', 15000, 'sw:Endora LED Display'],
        'album'         => ['Endora Album', 'ALB', 20000, 'https://github.com/eapasindu-sudo/endora-album-releases/releases/latest'],
        'invoice'       => ['Endora Invoice', 'INV', 9500, 'https://github.com/eapasindu-sudo/Endora_invoice/releases/latest'],
    ];
}

function endora_bridge_shop_plans()
{
    // plan => [label, seats, price factor, months valid (0 = forever, updates 1 year)]
    return ['one' => ['1 computer · one-time + 1 year updates', 1, 1.0, 0], 'two' => ['2 computers · one-time + 1 year updates', 2, 1.6, 0], 'year' => ['Yearly subscription (updates included)', 1, 0.4, 12]];
}

function endora_bridge_shop_price($product, $plan)
{
    $pr = endora_bridge_shop_products()[$product] ?? null;
    $pl = endora_bridge_shop_plans()[$plan] ?? null;
    return ($pr && $pl) ? (int) (round($pr[2] * $pl[2] / 500) * 500) : 0;
}

function endora_bridge_shop_download($product)
{
    $pr = endora_bridge_shop_products()[$product] ?? null;
    if (!$pr || $pr[3] === '') {
        return '';
    }
    if (strpos($pr[3], 'sw:') !== 0) {
        return $pr[3];
    }
    foreach (endora_bridge_software() as $a) {
        if ($a[0] === substr($pr[3], 3) && !empty($a[3]['url']) && strpos($a[3]['url'], '/admin/') === false) {
            return $a[3]['url'];
        }
    }
    return '';
}

function endora_bridge_shop_newkey($prefix)
{
    $c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $k = 'EWF-' . $prefix;
    for ($g = 0; $g < 3; $g++) {
        $k .= '-';
        for ($i = 0; $i < 4; $i++) {
            $k .= $c[random_int(0, strlen($c) - 1)];
        }
    }
    return $k;
}

function endora_bridge_shop_owner_phone()
{
    return preg_replace('/\D/', '', (string) (get_option('endora_bridge_shop_owner_phone') ?: '94710674180'));
}

function endora_bridge_shop_lk_phone($raw)
{
    $d = preg_replace('/\D/', '', (string) $raw);
    if (strlen($d) === 10 && $d[0] === '0') {
        $d = '94' . substr($d, 1);
    } elseif (strlen($d) === 9 && $d[0] === '7') {
        $d = '94' . $d;
    }
    return (strlen($d) >= 11 && strlen($d) <= 15) ? $d : '';
}

/* Message to the client with the licence key (sent when the owner presses Approve). No CRM links. */
function endora_bridge_shop_key_message($lic)
{
    $pr   = endora_bridge_shop_products()[$lic->product] ?? [$lic->product];
    $pl   = endora_bridge_shop_plans()[$lic->plan] ?? ['', 1];
    $dl   = endora_bridge_shop_download($lic->product);
    $text = 'Hi ' . $lic->name . ', thank you for buying ' . $pr[0] . ".\n\nYour licence key:\n*" . $lic->lic_key . "*\n\n"
        . 'Licence: ' . $pl[0] . ($lic->expires_at ? "\nValid until: " . date('j M Y', strtotime($lic->expires_at)) : '') . "\n\n"
        . ($dl !== '' ? 'Download: ' . $dl . "\n\n" : '')
        . "Open the app and paste the key when it asks for it. Keep this message safe.\n\n– Endora Live Tools";
    return $text;
}

/* Orders always reach the owner on WhatsApp (not only as an app notification). Returns the send result. */
function endora_bridge_shop_owner_wa($text)
{
    $GLOBALS['endora_wa_force'] = 1;
    try {
        $r = endora_bridge_wa_send(endora_bridge_shop_owner_phone(), $text);
    } catch (Throwable $e) {
        $r = ['ok' => false, 'error' => $e->getMessage()];
    }
    unset($GLOBALS['endora_wa_force']);
    if (empty($r['ok'])) {
        log_message('error', 'Endora shop: owner WhatsApp failed: ' . json_encode($r));
    }
    update_option('endora_bridge_shop_last_wa', json_encode(['t' => date('Y-m-d H:i:s'), 'r' => $r]));
    return $r;
}
