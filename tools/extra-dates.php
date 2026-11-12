<?php
// Patch: Homecoming + Pre-shoot dates on invoices, synced to the Google Calendar feed.
// Usage: php extra-dates.php <Webhook.php> <out>
$f = $argv[1];
$s = file_get_contents($f);
if (strpos($s, 'invoice_homecoming_date') !== false) { echo "already\n"; exit; }
$anchor = "        return \$this->out(200, ['ok' => true, 'items' => \$items]);\n    }\n\n    /**\n     * GET/POST /endora_bridge/webhook/meta";
if (substr_count($s, $anchor) !== 1) { echo "anchor\n"; exit(1); }
$add = <<<'P'
        // Homecoming and pre-shoot dates typed on invoices → their own calendar events.
        foreach (['invoice_homecoming_date' => ['h', 'HOMECOMING', 'CYAN'], 'invoice_preshoot_date' => ['s', 'PRE-SHOOT', 'MAUVE']] as $slug => $cfg) {
            $fid = (int) $this->db->select('id')->where(['slug' => $slug, 'fieldto' => 'invoice'])->get($p . 'customfields')->row('id');
            if (!$fid) {
                continue;
            }
            $q = "SELECT i.id, i.clientid, v.value FROM {$p}invoices i JOIN {$p}customfieldsvalues v ON v.relid = i.id AND v.fieldto = 'invoice' AND v.fieldid = {$fid} WHERE i.status NOT IN (5,6) AND v.value <> ''";
            foreach ($this->db->query($q)->result_array() as $r) {
                $t = strtotime(str_replace('/', '-', (string) $r['value']));
                if (!$t || date('Y-m-d', $t) < date('Y-m-d', strtotime('-60 days'))) {
                    continue;
                }
                $c       = endora_bridge_contact($r['clientid']);
                $pk      = $pkgs((int) $r['id']);
                $items[] = [
                    'key'     => $cfg[0] . (int) $r['id'],
                    'invoice' => 0, // never merged with the website booking of the wedding day
                    'date'    => date('Y-m-d', $t),
                    'title'   => $cfg[1] . ' – ' . trim($c['name']),
                    'desc'    => $cfg[1] === 'HOMECOMING' ? "Homecoming shoot\n" : "Pre-shoot\n",
                    'color'   => $cfg[2],
                ];
                $items[count($items) - 1]['desc'] .= $money((int) $r['id']) . "\nPackage: " . ($pk ?: '-') . "\nClient phone: " . ($c['phone'] !== '' ? '+' . $c['phone'] : '-') . "\nInvoice: " . admin_url('invoices/list_invoices/' . (int) $r['id']);
            }
        }

P;
$s = str_replace($anchor, $add . $anchor, $s);
file_put_contents($argv[2], $s);
echo "ok\n";
