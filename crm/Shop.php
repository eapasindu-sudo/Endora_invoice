<?php

defined('BASEPATH') or exit('No direct script access allowed');

/** Public API for tools.endoraweddingfilms.com: catalog, free trial, order with bank slip, licence check. URL: endora_bridge/shop/... */
class Shop extends App_Controller
{
    public function __construct()
    {
        parent::__construct();
        endora_bridge_shop_tables();
        $o = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
        if (preg_match('#^https?://tools\.endoraweddingfilms\.com$#', $o)) {
            header('Access-Control-Allow-Origin: ' . $o);
            header('Vary: Origin');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
        }
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            exit;
        }
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
    }

    private function out($data, $code = 200)
    {
        http_response_code($code);
        echo json_encode($data);
        exit;
    }

    private function common()
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            $this->out(['ok' => false, 'error' => 'Use POST.'], 405);
        }
        if (trim((string) $this->input->post('website')) !== '') { // honeypot
            $this->out(['ok' => true]);
        }
        $product = (string) $this->input->post('product');
        $name    = mb_substr(trim(strip_tags((string) $this->input->post('name'))), 0, 120);
        $phone   = endora_bridge_shop_lk_phone($this->input->post('phone'));
        if (!isset(endora_bridge_shop_products()[$product])) {
            $this->out(['ok' => false, 'error' => 'Choose a software.'], 400);
        }
        if (mb_strlen($name) < 2) {
            $this->out(['ok' => false, 'error' => 'Add your name.'], 400);
        }
        if ($phone === '' || preg_match('/(\d)\1{6,}/', $phone)) {
            $this->out(['ok' => false, 'error' => 'Add a valid WhatsApp number, for example 071 234 5678.'], 400);
        }
        $since = date('Y-m-d H:i:s', time() - 3600);
        $n     = $this->db->where(['phone' => $phone, 'created_at >' => $since])->count_all_results(db_prefix() . 'endora_licenses')
               + $this->db->where(['phone' => $phone, 'created_at >' => $since])->count_all_results(db_prefix() . 'endora_trials');
        if ($n >= 5) {
            $this->out(['ok' => false, 'error' => 'Too many requests from this number. Please try again later.'], 429);
        }
        return [$product, $name, $phone];
    }

    public function catalog()
    {
        $out = [];
        foreach (endora_bridge_shop_products() as $id => $p) {
            $prices = [];
            foreach (endora_bridge_shop_plans($id) as $k => $pl) {
                $prices[$k] = ['label' => $pl[0], 'price' => (int) $pl[2], 'days' => (int) $pl[3]];
            }
            $out[$id] = ['name' => $p[0], 'plans' => $prices];
        }
        $this->out(['ok' => true, 'products' => $out]);
    }

    public function trial()
    {
        list($product, $name, $phone) = $this->common();
        $this->db->insert(db_prefix() . 'endora_trials', ['product' => $product, 'name' => $name, 'phone' => $phone, 'ip' => mb_substr((string) $this->input->ip_address(), 0, 45), 'created_at' => date('Y-m-d H:i:s')]);
        $pr = endora_bridge_shop_products()[$product];
        endora_bridge_shop_owner_wa( "🧪 Free trial download\n" . $pr[0] . "\n" . $name . ' · +' . $phone);
        $dl = endora_bridge_shop_download($product);
        $this->out(['ok' => true, 'download' => $dl, 'message' => $dl !== '' ? '' : 'We will send the download link to your WhatsApp.']);
    }

    public function order()
    {
        list($product, $name, $phone) = $this->common();
        $plan = (string) $this->input->post('plan');
        if (!endora_bridge_shop_plan($product, $plan)) {
            $this->out(['ok' => false, 'error' => 'Choose a licence.'], 400);
        }
        $f = $_FILES['slip'] ?? null;
        if (!$f || (int) $f['error'] !== UPLOAD_ERR_OK || (int) $f['size'] < 1000) {
            $this->out(['ok' => false, 'error' => 'Add a photo or PDF of the payment slip.'], 400);
        }
        if ((int) $f['size'] > 8 * 1048576) {
            $this->out(['ok' => false, 'error' => 'The slip file is too big. Send a photo under 8 MB.'], 400);
        }
        $mime = (string) (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
        $ext  = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/heic' => 'heic', 'application/pdf' => 'pdf'][$mime] ?? '';
        if ($ext === '') {
            $this->out(['ok' => false, 'error' => 'The slip must be a photo (JPG, PNG) or a PDF.'], 400);
        }
        // act as the first admin so the CRM models work
        $sid = (int) $this->db->select('staffid')->where(['admin' => 1, 'active' => 1])->order_by('staffid')->get(db_prefix() . 'staff')->row('staffid');
        $this->session->set_userdata(['staff_user_id' => $sid, 'staff_logged_in' => true]);
        $this->load->model(['invoices_model', 'clients_model', 'payment_modes_model']);
        $p   = db_prefix();
        $cid = (int) $this->db->select('userid')->like('phonenumber', substr($phone, -9), 'before')->order_by('userid', 'desc')->get($p . 'clients')->row('userid');
        if (!$cid) {
            $cid = (int) $this->clients_model->add(['company' => $name, 'phonenumber' => '+' . $phone, 'country' => 206]);
        }
        $pr    = endora_bridge_shop_products()[$product];
        $pl    = endora_bridge_shop_plan($product, $plan);
        $price = endora_bridge_shop_price($product, $plan);
        $cur   = get_base_currency();
        $iid   = (int) $this->invoices_model->add([
            'clientid' => $cid, 'number' => str_pad((string) get_option('next_invoice_number'), (int) get_option('number_padding_prefixes'), '0', STR_PAD_LEFT),
            'date' => _d(date('Y-m-d')), 'duedate' => _d(date('Y-m-d', strtotime('+7 days'))), 'currency' => $cur ? $cur->id : 1,
            'subtotal' => $price, 'total' => $price, 'discount_total' => 0, 'discount_percent' => 0, 'adjustment' => 0,
            'newitems' => [1 => ['order' => 1, 'description' => $pr[0] . ' licence', 'long_description' => $pl[0], 'qty' => 1, 'unit' => '', 'rate' => $price]],
            'clientnote' => 'Software licence – Endora Live Tools', 'terms' => '', 'show_quantity_as' => 1, 'sale_agent' => $sid,
            'allowed_payment_modes' => array_map(function ($m) { return $m['id']; }, $this->payment_modes_model->get('', ['active' => 1])),
        ]);
        if (!$iid) {
            $this->out(['ok' => false, 'error' => 'Could not save the order. Please send the slip to us on WhatsApp.'], 500);
        }
        $dir = FCPATH . 'uploads/invoices/' . $iid . '/';
        @mkdir($dir, 0755, true);
        $fn = 'payment-slip-' . date('Ymd-His') . '.' . $ext;
        if (move_uploaded_file($f['tmp_name'], $dir . $fn)) {
            $this->db->insert($p . 'files', ['rel_id' => $iid, 'rel_type' => 'invoice', 'file_name' => $fn, 'filetype' => $mime, 'visible_to_customer' => 0, 'attachment_key' => app_generate_hash(), 'staffid' => 0, 'contact_id' => 0, 'dateadded' => date('Y-m-d H:i:s')]);
        }
        $this->db->insert($p . 'endora_licenses', ['product' => $product, 'plan' => $plan, 'seats' => $pl[1], 'clientid' => $cid, 'invoiceid' => $iid, 'name' => $name, 'phone' => $phone, 'status' => 'pending', 'machines' => '[]', 'created_at' => date('Y-m-d H:i:s')]);
        endora_bridge_shop_owner_wa( "🛒 New software order\n" . $pr[0] . ' – ' . $pl[0] . "\nLKR " . number_format($price) . "\n" . $name . ' · +' . $phone . "\nInvoice " . format_invoice_number($iid) . " (slip attached in the CRM)\n\nCheck the payment, then approve: " . admin_url('endora_bridge/shop_admin'), is_file($dir . $fn) ? $dir . $fn : null, $fn);
        @endora_bridge_push_all(['title' => '🛒 New software order', 'body' => $pr[0] . ' · LKR ' . number_format($price) . ' · ' . $name, 'url' => admin_url('endora_bridge/shop_admin'), 'tag' => 'shop-' . $iid, 'alarm' => 1]);
        $this->out(['ok' => true, 'invoice' => format_invoice_number($iid)]);
    }

    /* Click counter ping from the tools page (an image request, so no CORS). */
    public function track()
    {
        endora_bridge_shop_track((string) $this->input->get('app'), (string) $this->input->get('ev'));
        header('Content-Type: image/gif');
        echo base64_decode('R0lGODlhAQABAAAAACw=');
        exit;
    }

    /* tools.endoraweddingfilms.com/dl.php?app=… asks here for the newest installer link */
    public function download()
    {
        $p = (string) $this->input->get('p');
        $this->out(['ok' => true, 'url' => isset(endora_bridge_shop_products()[$p]) ? endora_bridge_shop_download($p) : '']);
    }

    /* Apps call this: key, product, machine (a stable id of the computer). Binds new machines up to the licence seats. */
    public function check()
    {
        $key     = strtoupper(trim((string) ($this->input->get_post('key') ?? '')));
        $product = (string) ($this->input->get_post('product') ?? '');
        $machine = mb_substr(preg_replace('/[^A-Za-z0-9:_\-.]/', '', (string) ($this->input->get_post('machine') ?? '')), 0, 80);
        $lic     = $key !== '' ? $this->db->where('lic_key', $key)->get(db_prefix() . 'endora_licenses')->row() : null;
        if (!$lic || $lic->status !== 'active' || ($product !== '' && $lic->product !== $product)) {
            $this->out(['ok' => true, 'valid' => false, 'reason' => 'This licence key is not valid for this app.']);
        }
        if ($lic->expires_at && $lic->expires_at < date('Y-m-d')) {
            $this->out(['ok' => true, 'valid' => false, 'reason' => 'This licence expired on ' . $lic->expires_at . '.']);
        }
        $ms = json_decode((string) $lic->machines, true) ?: [];
        if ($machine !== '' && !in_array($machine, $ms, true)) {
            if (count($ms) >= (int) $lic->seats) {
                $this->out(['ok' => true, 'valid' => false, 'reason' => 'This key is already used on ' . count($ms) . ' computer(s).']);
            }
            $ms[] = $machine;
            $this->db->where('id', $lic->id)->update(db_prefix() . 'endora_licenses', ['machines' => json_encode($ms)]);
        }
        $this->out(['ok' => true, 'valid' => true, 'product' => $lic->product, 'name' => $lic->name, 'seats' => (int) $lic->seats, 'expires' => $lic->expires_at,
            'updates_until' => $lic->expires_at ?: date('Y-m-d', strtotime(($lic->approved_at ?: $lic->created_at) . ' +1 year'))]);
    }
}
