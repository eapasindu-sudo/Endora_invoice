<?php

defined('BASEPATH') or exit('No direct script access allowed');

require_once __DIR__ . '/Ops.php';

/** Software orders and licences. URL: admin/endora_bridge/shop_admin */
class Shop_admin extends Ops
{
    public function __construct()
    {
        parent::__construct();
        endora_bridge_shop_tables();
    }

    private function go($q)
    {
        redirect(admin_url('endora_bridge/shop_admin?' . $q));
    }

    public function index()
    {
        $p     = db_prefix();
        $prods = endora_bridge_shop_products();
        $plans = endora_bridge_shop_plans();
        $this->head('&#128273; Software orders', 'Orders from tools.endoraweddingfilms.com. Check the slip on the invoice, then press Approve: the payment is recorded and the licence key goes to the client on WhatsApp.');
        $rows = $this->db->order_by('id', 'desc')->limit(100)->get($p . 'endora_licenses')->result();
        foreach (['pending' => 'Waiting for approval', 'active' => 'Active licences', 'rejected' => 'Rejected'] as $st => $label) {
            $list = array_filter($rows, function ($r) use ($st) { return $r->status === $st || ($st === 'active' && $r->status === 'revoked'); });
            echo '<h2>' . $label . ' (' . count($list) . ')</h2>';
            if (!$list) {
                echo '<p class="m">None.</p>';
            }
            foreach ($list as $r) {
                $inv = $r->invoiceid ? $this->db->select('id,total,status')->where('id', $r->invoiceid)->get($p . 'invoices')->row() : null;
                echo '<div class="box"><div class="r"><div><b>' . html_escape(($prods[$r->product][0] ?? $r->product)) . '</b><div class="m">' . html_escape($plans[$r->plan][0] ?? $r->plan) . '</div></div><div style="text-align:right">'
                    . ($inv ? '<a href="' . admin_url('invoices/list_invoices/' . $inv->id) . '">' . format_invoice_number($inv->id) . '</a><div class="m">LKR ' . number_format((float) $inv->total) . ' · ' . format_invoice_status($inv->status, '', false) . '</div>' : '') . '</div></div>'
                    . '<div class="r"><span>' . html_escape($r->name) . ' · +' . html_escape($r->phone) . '</span><span class="m">' . date('j M, g:i a', strtotime($r->created_at)) . '</span></div>';
                if ($r->status === 'pending') {
                    $preview = clone $r;
                    $preview->lic_key = 'EWF-' . ($prods[$r->product][1] ?? 'XXX') . '-XXXX-XXXX-XXXX';
                    $preview->expires_at = $plans[$r->plan][3] ? date('Y-m-d', strtotime('+' . $plans[$r->plan][3] . ' months')) : null;
                    echo '<details style="margin:8px 0"><summary class="m">WhatsApp message the client will get</summary><pre style="white-space:pre-wrap;font:13px/1.5 inherit;background:#141110;padding:10px;border-radius:10px">' . html_escape(endora_bridge_shop_key_message($preview)) . '</pre></details>'
                        . '<div class="row">' . form_open(admin_url('endora_bridge/shop_admin/approve/' . $r->id), ['class' => 'inline']) . '<button class="btn gold" style="width:100%">&#10003; Payment received – approve &amp; send key</button>' . form_close()
                        . form_open(admin_url('endora_bridge/shop_admin/reject/' . $r->id), ['class' => 'inline']) . '<button class="btn" style="width:100%">Reject</button>' . form_close() . '</div>';
                } elseif ($r->status === 'active' || $r->status === 'revoked') {
                    $ms = json_decode((string) $r->machines, true) ?: [];
                    echo '<div class="r"><b style="font-family:monospace">' . html_escape($r->lic_key) . '</b><span class="m">' . count($ms) . '/' . (int) $r->seats . ' computers' . ($r->expires_at ? ' · until ' . date('j M Y', strtotime($r->expires_at)) : '') . ($r->status === 'revoked' ? ' · <span class="red">revoked</span>' : '') . '</span></div><div class="row">'
                        . form_open(admin_url('endora_bridge/shop_admin/resend/' . $r->id), ['class' => 'inline']) . '<button class="btn" style="width:100%">Resend key on WhatsApp</button>' . form_close()
                        . form_open(admin_url('endora_bridge/shop_admin/reset/' . $r->id), ['class' => 'inline']) . '<button class="btn" style="width:100%">Free the computers</button>' . form_close()
                        . form_open(admin_url('endora_bridge/shop_admin/' . ($r->status === 'revoked' ? 'restore/' : 'revoke/') . $r->id), ['class' => 'inline']) . '<button class="btn" style="width:100%">' . ($r->status === 'revoked' ? 'Restore' : 'Revoke') . '</button>' . form_close() . '</div>';
                }
                echo '</div>';
            }
        }
        echo '<h2>Free trial downloads</h2><div class="box">';
        $tr = $this->db->order_by('id', 'desc')->limit(30)->get($p . 'endora_trials')->result();
        echo $tr ? '' : '<p class="m">None yet.</p>';
        foreach ($tr as $t) {
            echo '<div class="r"><span>' . html_escape($prods[$t->product][0] ?? $t->product) . '<div class="m">' . html_escape($t->name) . ' · +' . html_escape($t->phone) . '</div></span><span class="m">' . date('j M, g:i a', strtotime($t->created_at)) . '</span></div>';
        }
        echo '</div><p class="m" style="text-align:center"><a href="https://tools.endoraweddingfilms.com/" target="_blank">Open the public page</a></p>';
        $this->foot();
    }

    /* polled by the web app every 20 s to ring the order alarm */
    public function pending()
    {
        $r = $this->db->query('SELECT MAX(id) m, SUM(status="pending") p FROM ' . db_prefix() . 'endora_licenses')->row();
        header('Content-Type: application/json');
        echo json_encode(['latest' => (int) ($r->m ?? 0), 'pending' => (int) ($r->p ?? 0)]);
        exit;
    }

    /* Key message with the paid invoice PDF attached. With a file it goes out as the approved
       "endora_document" template, so it reaches a client who has never written to us on WhatsApp. */
    private function send_key($r)
    {
        $file = null;
        $name = 'invoice.pdf';
        if ($r->invoiceid) {
            try {
                $this->load->model('invoices_model');
                $inv = $this->invoices_model->get($r->invoiceid);
                if ($inv) {
                    $name = format_invoice_number($inv->id) . '.pdf';
                    $file = get_temp_dir() . 'endora-licence-' . $inv->id . '-' . time() . '.pdf';
                    invoice_pdf($inv)->Output($file, 'F');
                }
            } catch (Throwable $e) {
                $file = null;
            }
        }
        $res = endora_bridge_shop_send_key($r, $file && is_file($file) ? $file : null, $name);
        if ($file && is_file($file)) {
            @unlink($file);
        }
        return !empty($res['ok']) && empty($res['queued']);
    }

    private function row($id)
    {
        $r = $this->db->where('id', (int) $id)->get(db_prefix() . 'endora_licenses')->row();
        if (!$r || $this->input->method() !== 'post') {
            $this->go('err=' . rawurlencode('Order not found.'));
        }
        return $r;
    }

    public function approve($id)
    {
        $r = $this->row($id);
        if ($r->status !== 'pending') {
            $this->go('err=' . rawurlencode('This order is already handled.'));
        }
        $p     = db_prefix();
        $prods = endora_bridge_shop_products();
        $plans = endora_bridge_shop_plans();
        do {
            $key = endora_bridge_shop_newkey($prods[$r->product][1] ?? 'APP');
        } while ($this->db->where('lic_key', $key)->count_all_results($p . 'endora_licenses'));
        $exp = !empty($plans[$r->plan][3]) ? date('Y-m-d', strtotime('+' . $plans[$r->plan][3] . ' months')) : null;
        // record the payment for what is still due on the invoice
        if ($r->invoiceid) {
            $this->load->model(['invoices_model', 'payments_model', 'payment_modes_model']);
            $inv = $this->invoices_model->get($r->invoiceid);
            $due = $inv ? (float) get_invoice_total_left_to_pay($inv->id, $inv->total) : 0;
            if ($due > 0) {
                $modes = $this->payment_modes_model->get('', ['active' => 1]);
                $this->payments_model->add(['invoiceid' => $inv->id, 'amount' => $due, 'paymentmode' => $modes ? $modes[0]['id'] : 1, 'date' => _d(date('Y-m-d')), 'note' => 'Software licence – bank transfer / LankaQR', 'do_not_send_email_template' => 'on', 'do_not_redirect' => true]);
            }
        }
        $this->db->where('id', $r->id)->update($p . 'endora_licenses', ['lic_key' => $key, 'status' => 'active', 'approved_at' => date('Y-m-d H:i:s'), 'expires_at' => $exp]);
        $r = $this->db->where('id', $r->id)->get($p . 'endora_licenses')->row();
        $ok = $this->send_key($r);
        $this->db->where('id', $r->id)->update($p . 'endora_licenses', ['wa_sent' => $ok ? 1 : 0]);
        $this->go($ok ? 'm=' . rawurlencode('Approved. Licence key ' . $key . ' sent to ' . $r->name . ' on WhatsApp.') : 'err=' . rawurlencode('Approved with key ' . $key . ', but WhatsApp did not send. Press "Resend key".'));
    }

    public function resend($id)
    {
        $r  = $this->row($id);
        $ok = $r->lic_key !== '' && $this->send_key($r);
        $this->go($ok ? 'm=' . rawurlencode('Key sent again.') : 'err=' . rawurlencode('WhatsApp did not send.'));
    }

    public function reject($id)
    {
        $r = $this->row($id);
        $this->db->where('id', $r->id)->update(db_prefix() . 'endora_licenses', ['status' => 'rejected']);
        $this->go('m=' . rawurlencode('Order rejected. No message was sent to the client.'));
    }

    public function reset($id)
    {
        $r = $this->row($id);
        $this->db->where('id', $r->id)->update(db_prefix() . 'endora_licenses', ['machines' => '[]']);
        $this->go('m=' . rawurlencode('Computers cleared. The key can be used on new computers.'));
    }

    public function revoke($id)
    {
        $r = $this->row($id);
        $this->db->where('id', $r->id)->update(db_prefix() . 'endora_licenses', ['status' => 'revoked']);
        $this->go('m=' . rawurlencode('Licence revoked.'));
    }

    public function restore($id)
    {
        $r = $this->row($id);
        $this->db->where('id', $r->id)->update(db_prefix() . 'endora_licenses', ['status' => 'active']);
        $this->go('m=' . rawurlencode('Licence restored.'));
    }
}
