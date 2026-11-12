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
        'atem-ccu'      => ['ATEM CCU', 'CCU', 12000, 'sw:ATEM Switcher'],
        'cricket-scorer' => ['Cricket Scorer', 'CRK', 25000, 'sw:Cricket Scorer'],
        'playout'       => ['Endora Playout + CG Composer', 'PLY', 45000, 'sw:Endora Playout'],
        'replay'        => ['Endora Replay', 'RPL', 30000, 'sw:Endora Replay'],
        'led-display'   => ['Endora LED Display', 'LED', 15000, 'sw:Endora LED Display'],
        'album'         => ['Endora Album', 'ALB', 20000, 'https://github.com/eapasindu-sudo/endora-album-releases/releases/latest'],
        'invoice'       => ['Endora Invoice', 'INV', 9500, 'https://github.com/eapasindu-sudo/Endora_invoice/releases/latest'],
    ];
}

function endora_bridge_shop_plans($product = null)
{
    // product => plan => [label, computers, price LKR, days valid (0 = lifetime)]. Updates are included for as long as the licence is valid.
    $life = function ($price) { return ['life' => ['Lifetime licence + updates', 1, $price, 0]]; };
    $all  = [
        'cricket-scorer' => [
            'match' => ['1 match', 1, 500, 1], 'day' => ['1 day', 1, 1000, 1], 'days2' => ['2 days', 1, 1500, 2],
            'week' => ['1 week', 1, 3500, 7], 'month' => ['1 month', 1, 10000, 30], 'life' => ['Lifetime licence + updates', 1, 50000, 0],
        ],
        'playout' => ['day' => ['1 day', 1, 1500, 1], 'year' => ['1 year + updates', 1, 25000, 365], 'life' => ['Lifetime licence + updates', 1, 100000, 0]],
        'atem-switcher' => $life(5000), 'atem-tally' => $life(5000), 'atem-ccu' => $life(10000),
        'replay' => $life(10000), 'album' => $life(20000), 'invoice' => $life(9500), 'led-display' => $life(15000),
    ];
    if ($product === null) {
        return $all;
    }
    return $all[$product] ?? [];
}

function endora_bridge_shop_plan($product, $plan)
{
    return endora_bridge_shop_plans($product)[$plan] ?? null;
}

function endora_bridge_shop_price($product, $plan)
{
    $pl = endora_bridge_shop_plan($product, $plan);
    return $pl ? (int) $pl[2] : 0;
}

function endora_bridge_shop_expiry($product, $plan, $from = null)
{
    $pl = endora_bridge_shop_plan($product, $plan);
    return ($pl && $pl[3] > 0) ? date('Y-m-d', strtotime(($from ?: date('Y-m-d')) . ' +' . ($pl[3] - 1) . ' days')) : null;
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
function endora_bridge_shop_key_message($lic, $one_line = false)
{
    $pr = endora_bridge_shop_products()[$lic->product] ?? [$lic->product];
    $pl = endora_bridge_shop_plan($lic->product, $lic->plan) ?: ['', 1];
    $dl = endora_bridge_shop_download($lic->product) !== '' ? 'https://tools.endoraweddingfilms.com/dl.php?app=' . rawurlencode($lic->product) : '';
    if ($one_line) {
        // WhatsApp templates cannot carry line breaks, so this version reads as one clean paragraph (no " · " separators).
        return 'Hi ' . $lic->name . ', thank you for buying ' . $pr[0] . '. Your licence key is ' . $lic->lic_key
            . ' – Licence: ' . str_replace(' · ', ', ', $pl[0]) . ($lic->expires_at ? ', valid until ' . date('j M Y', strtotime($lic->expires_at)) : '') . '.'
            . ($dl !== '' ? ' Download the app here: ' . $dl : '')
            . ' Open the app and paste the licence key when it asks for it. Reply to this message and we will send the key again on its own line, easy to copy. – Endora Live Tools';
    }
    return 'Hi ' . $lic->name . ', thank you for buying ' . $pr[0] . ".\n\n"
        . "Your licence key:\n" . $lic->lic_key . "\n\n"
        . 'Licence: ' . $pl[0] . ($lic->expires_at ? "\nValid until: " . date('j M Y', strtotime($lic->expires_at)) : '') . "\n"
        . ($dl !== '' ? 'Download: ' . $dl . "\n" : '')
        . "\nOpen the app and paste the licence key when it asks for it.\n"
        . "Reply to this message and we will send the licence key again on its own, so it is easy to copy.\n\n"
        . '– Endora Live Tools';
}

/* Send the key to the client. Outside the WhatsApp 24-hour window the message goes as a template (one line),
   so the key alone is also queued: it is delivered by itself as soon as the client replies. */
function endora_bridge_shop_send_key($lic, $file = null, $file_name = 'invoice.pdf')
{
    $open = function_exists('endora_bridge_meta_window_open') && endora_bridge_meta_cfg() ? endora_bridge_meta_window_open($lic->phone) : true;
    $res  = endora_bridge_wa_send($lic->phone, endora_bridge_shop_key_message($lic, !$open), $file, $file_name);
    if (!$open && !empty($res['ok']) && empty($res['queued'])) {
        endora_bridge_wa_tables();
        get_instance()->db->insert(db_prefix() . 'endora_wa_queue', ['phone' => endora_bridge_wa_digits($lic->phone), 'body' => $lic->lic_key, 'file' => null, 'file_name' => null, 'created_at' => date('Y-m-d H:i:s')]);
    }
    return $res;
}

/* Orders always reach the owner on WhatsApp (not only as an app notification). Returns the send result. */
function endora_bridge_shop_owner_wa($text, $file = null, $file_name = 'payment-slip.pdf')
{
    $GLOBALS['endora_wa_force'] = 1;
    try {
        // With the slip attached it goes out as the approved "endora_document" template, so it arrives even when the 24-hour WhatsApp window is closed.
        $r = endora_bridge_wa_send(endora_bridge_shop_owner_phone(), $text, $file && is_file($file) ? $file : null, $file_name);
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
