<?php

defined('BASEPATH') or exit('No direct script access allowed');

/* Endora invoice PDF: same look as the Endora Invoice app (gold line, dark table head, maroon balance box). */
$dimensions = $pdf->getPageDimensions();
$cur   = $invoice->currency_name;
$money = function ($v) use ($cur) { return app_format_money($v, $cur); };
$gold  = '#c8a96a'; $ink = '#2a2420'; $maroon = '#7a1f2b'; $cream = '#faf6ee'; $mut = '#7d7066';
$lbl   = function ($t) use ($gold) { return '<span style="font-size:7.5pt;color:#a88a4d;">' . strtoupper($t) . '</span><br />'; };

// --- header: logo left, company right, gold rule
$pdf->writeHTML('<table cellpadding="0" cellspacing="0" width="100%"><tr><td width="50%">' . pdf_logo_url() . '</td><td width="50%" align="right" style="font-size:8.5pt;color:#5b5048;line-height:1.5;">' . format_organization_info() . '</td></tr></table>', true, false, false, false, '');
$pdf->Ln(1);
$pdf->SetDrawColor(200, 169, 106);
$pdf->SetLineWidth(0.7);
$y = $pdf->GetY();
$pdf->Line($dimensions['lm'], $y, $dimensions['wk'] - $dimensions['rm'], $y);
$pdf->Ln(4);

// --- title + status
$st = '';
if (get_option('show_status_on_pdf_ei') == 1) {
    $st = '<span style="font-size:9pt;color:rgb(' . invoice_status_color_pdf($status) . ');">&nbsp;&nbsp;' . strtoupper(format_invoice_status($status, '', false)) . '</span>';
}
$pdf->writeHTML('<span style="font-family:times;font-size:27pt;color:' . $maroon . ';">INVOICE</span>' . $st, true, false, false, false, '');
$pdf->Ln(1);

// --- three boxes: billed to / event / invoice
$ev = '';
if ($invoice->project_id && get_option('show_project_on_invoice') == 1) {
    $ev .= '<b>' . get_project_name_by_id($invoice->project_id) . '</b><br />';
}
foreach ($pdf_custom_fields as $field) {
    $value = get_custom_field_value($invoice->id, $field['id'], 'invoice');
    if ($value != '') {
        $ev .= $field['name'] . ': ' . $value . '<br />';
    }
}
$bill = $lbl(_l('invoice_bill_to')) . '<span style="color:#2a2420;">' . format_customer_info($invoice, 'invoice', 'billing') . '</span>';
$inf  = $lbl('Invoice') . 'No: <b>' . $invoice_number . '</b><br />Date: ' . _d($invoice->date) . '<br />' . (!empty($invoice->duedate) ? 'Balance due by: ' . _d($invoice->duedate) : '');
$mid  = $lbl('Event') . ($ev !== '' ? $ev : '&nbsp;');
$td   = 'style="background-color:' . $cream . ';font-size:9pt;line-height:1.55;"';
$pdf->writeHTML('<table cellpadding="7" cellspacing="5" width="100%"><tr><td width="35%" ' . $td . '>' . $bill . '</td><td width="32%" ' . $td . '>' . $mid . '</td><td width="33%" ' . $td . '>' . $inf . '</td></tr></table>', true, false, false, false, '');
$pdf->Ln(3);

// --- items
$items = get_items_table_data($invoice, 'invoice', 'pdf');
$th    = 'style="background-color:' . $ink . ';color:#f4efe6;font-size:7.5pt;font-weight:bold;"';
$rows  = '';
foreach ($invoice->items as $it) {
    $desc = '<b>' . $it['description'] . '</b>';
    if (trim((string) $it['long_description']) !== '') {
        $desc .= '<br /><span style="color:' . $mut . ';font-size:8.5pt;">' . nl2br($it['long_description']) . '</span>';
    }
    $q = (float) $it['qty'];
    $rows .= '<tr><td width="52%" style="border-bottom:1px solid #eee3d0;">' . $desc . '</td><td width="8%" align="right" style="border-bottom:1px solid #eee3d0;">' . $q . '</td><td width="19%" align="right" style="border-bottom:1px solid #eee3d0;">' . app_format_number($it['rate']) . '</td><td width="21%" align="right" style="border-bottom:1px solid #eee3d0;">' . app_format_number($q * (float) $it['rate']) . '</td></tr>';
}
$pdf->writeHTML('<table cellpadding="7" cellspacing="0" width="100%"><tr><th width="52%" ' . $th . '>DESCRIPTION</th><th width="8%" align="right" ' . $th . '>QTY</th><th width="19%" align="right" ' . $th . '>PRICE (' . $cur . ')</th><th width="21%" align="right" ' . $th . '>AMOUNT (' . $cur . ')</th></tr>' . $rows . '</table>', true, false, false, false, '');
$pdf->Ln(3);

// --- totals
$t  = '<table cellpadding="4" width="100%" style="font-size:10pt;">';
$row = function ($l, $v, $extra = '') { return '<tr><td width="54%"></td><td width="26%" ' . $extra . '>' . $l . '</td><td width="20%" align="right" ' . $extra . '>' . $v . '</td></tr>'; };
$t .= $row('Subtotal', $money($invoice->subtotal));
if (is_sale_discount_applied($invoice)) {
    $t .= $row(_l('invoice_discount') . (is_sale_discount($invoice, 'percent') ? ' (' . app_format_number($invoice->discount_percent, true) . '%)' : ''), '-' . $money($invoice->discount_total));
}
foreach ($items->taxes() as $tax) {
    $t .= $row($tax['taxname'] . ' (' . app_format_number($tax['taxrate']) . '%)', $money($tax['total_tax']));
}
if ((int) $invoice->adjustment != 0) {
    $t .= $row(_l('invoice_adjustment'), $money($invoice->adjustment));
}
$t .= $row('<b>Total</b>', '<b>' . $money($invoice->total) . '</b>', 'style="border-top:1.5px solid ' . $gold . ';font-size:11.5pt;"');
if (count($invoice->payments) > 0 && get_option('show_total_paid_on_invoice') == 1) {
    $t .= $row('Paid', '-' . $money(sum_from_table(db_prefix() . 'invoicepaymentrecords', ['field' => 'amount', 'where' => ['invoiceid' => $invoice->id]])));
}
if (get_option('show_credits_applied_on_invoice') == 1 && $credits = total_credits_applied_to_invoice($invoice->id)) {
    $t .= $row(_l('applied_credits'), '-' . $money($credits));
}
if (get_option('show_amount_due_on_invoice') == 1 && $invoice->status != Invoices_model::STATUS_CANCELLED) {
    $t .= $row('<b>Balance due</b>', '<b>' . $money($invoice->total_left_to_pay) . '</b>', 'style="background-color:' . $maroon . ';color:#ffffff;font-size:11pt;"');
}
$pdf->writeHTML($t . '</table>', true, false, false, false, '');

if (get_option('total_to_words_enabled') == 1) {
    $pdf->Ln(2);
    $pdf->SetFont($font_name, 'B', $font_size);
    $pdf->writeHTMLCell('', '', '', '', _l('num_word') . ': ' . $CI->numberword->convert($invoice->total, $invoice->currency_name), 0, 1, false, true, 'C', true);
    $pdf->SetFont($font_name, '', $font_size);
}

// --- payments received
if (count($invoice->payments) > 0 && get_option('show_transactions_on_invoice_pdf') == 1) {
    $pdf->Ln(3);
    $ph = 'style="background-color:#efe6d6;font-size:7.5pt;font-weight:bold;"';
    $p  = '<table cellpadding="5" width="100%" style="font-size:9pt;"><tr><th width="20%" ' . $ph . '>PAYMENT DATE</th><th width="50%" ' . $ph . '>METHOD</th><th width="30%" align="right" ' . $ph . '>AMOUNT</th></tr>';
    foreach ($invoice->payments as $pay) {
        $nm = $pay['name'] . (!empty($pay['paymentmethod']) ? ' - ' . $pay['paymentmethod'] : '');
        $p .= '<tr><td style="border-bottom:1px solid #eee3d0;">' . _d($pay['date']) . '</td><td style="border-bottom:1px solid #eee3d0;">' . $nm . '</td><td align="right" style="border-bottom:1px solid #eee3d0;">' . $money($pay['amount']) . '</td></tr>';
    }
    $pdf->writeHTML($p . '</table>', true, false, false, false, '');
}

// --- bank details (payment modes shown on the PDF), note, terms
$box = function ($title, $html) use ($cream, $lbl) {
    return '<table cellpadding="8" width="100%"><tr><td style="background-color:' . $cream . ';font-size:8.5pt;line-height:1.55;">' . $lbl($title) . $html . '</td></tr></table>';
};
if (found_invoice_mode($payment_modes, $invoice->id, true, true)) {
    $b = '';
    foreach ($payment_modes as $mode) {
        if (is_numeric($mode['id']) && !is_payment_mode_allowed_for_invoice($mode['id'], $invoice->id)) {
            continue;
        }
        if (isset($mode['show_on_pdf']) && $mode['show_on_pdf'] == 1) {
            $b .= '<b>' . $mode['name'] . '</b><br />' . $mode['description'] . '<br />';
        }
    }
    if ($b !== '') {
        $pdf->Ln(3);
        $pdf->writeHTML($box(_l('invoice_html_offline_payment'), $b), true, false, false, false, '');
    }
}
if (!empty($invoice->clientnote)) {
    $pdf->Ln(2);
    $pdf->writeHTML($box(_l('invoice_note'), $invoice->clientnote), true, false, false, false, '');
}
if (!empty($invoice->terms)) {
    $pdf->Ln(2);
    $pdf->writeHTML($box(_l('terms_and_conditions'), $invoice->terms), true, false, false, false, '');
}
// --- LankaQR (unpaid invoices only)
if (file_exists(FCPATH . 'uploads/endora_lankaqr.png') && (int) $invoice->status !== 2) {
    if ($pdf->GetY() > $pdf->getPageHeight() - 75) {
        $pdf->AddPage();
    }
    $pdf->Ln(3);
    $pdf->SetFont($font_name, 'B', $font_size);
    $pdf->SetTextColor(168, 138, 77);
    $pdf->Cell(0, 0, 'SCAN & PAY WITH LANKAQR (ANY BANK APP)', 0, 1, 'L', 0, '', 0);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Image(FCPATH . 'uploads/endora_lankaqr.png', '', $pdf->GetY() + 2, 36, 36, 'PNG');
    $pdf->SetY($pdf->GetY() + 40);
    $pdf->SetFont($font_name, '', $font_size - 1);
    $pdf->Cell(0, 0, 'MR E A P DILSHAN – please send the payment screenshot on WhatsApp after paying.', 0, 1, 'L', 0, '', 0);
    $pdf->SetFont($font_name, '', $font_size);
}
$pdf->Ln(4);
$pdf->writeHTML('<div style="text-align:center;font-family:times;font-style:italic;color:#a88a4d;font-size:12pt;">Thank you for choosing ' . get_option('invoice_company_name') . '.</div>', true, false, false, false, '');

// --- PAID stamp (first page, top right)
if ($status == Invoices_model::STATUS_PAID) {
    $pdf->setPage(1);
    $pdf->StartTransform();
    $pdf->Rotate(12, 160, 62);
    $pdf->SetDrawColor(31, 122, 63);
    $pdf->SetTextColor(31, 122, 63);
    $pdf->SetLineWidth(0.9);
    $pdf->SetFont($font_name, 'B', 24);
    $pdf->SetXY(138, 52);
    $pdf->Cell(44, 15, 'PAID', 1, 0, 'C');
    $pdf->StopTransform();
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetFont($font_name, '', $font_size);
}
