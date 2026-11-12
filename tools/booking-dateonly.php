<?php
// Adds "Book the date only" to the booking form's package step.
$f = $argv[1];
$s = file_get_contents($f);
if (strpos($s, 'bk_date_only') !== false) { echo "already\n"; exit; }
$L = explode("\n", $s);
$start = null; $hint = null; $close = null; $pick = null;
foreach ($L as $i => $l) {
    if ($start === null && strpos($l, "if ( 'px_packages' === \$f['type'] ) {") !== false) $start = $i;
    if ($start !== null && $hint === null && strpos($l, 'bk-hint') !== false && strpos($l, 'Pick one or more') !== false) $hint = $i;
    if ($hint !== null && $close === null && strpos($l, 'data-error-for') !== false) $close = $i;
    if ($pick === null && strpos($l, "\$data['packages'] = \$picked;") !== false) $pick = $i;
}
if ($hint === null || $close === null || $pick === null || strpos($L[$pick + 1], "implode( ' + ', \$picked )") === false) { echo "anchor fail $hint $close $pick\n"; exit(1); }
$ui = "\t\t// Date only: the couple reserves the date now and chooses packages later.\n"
    . "\t\techo '<label class=\"bk-dateonly\" for=\"bk_date_only\"><input type=\"checkbox\" id=\"bk_date_only\" name=\"date_only\" value=\"1\"><span><strong>' . esc_html__( 'Book the date only', 'endora' ) . '</strong> — ' . esc_html__( 'reserve my wedding date now, I will choose the packages later', 'endora' ) . '</span></label>';";
$js = "\t\techo '<style>.bk-dateonly{display:flex;gap:.7rem;align-items:flex-start;padding:.9rem 1rem;margin:0 0 1rem;border:1px solid var(--c-line-strong,rgba(245,240,232,.24));cursor:pointer}.bk-dateonly input{margin-top:.25rem;accent-color:var(--c-gold,#c8a96a);width:18px;height:18px;flex:none}.bk-dateonly strong{color:var(--c-gold,#c8a96a);font-weight:500}.bk-pkg-off{opacity:.35;pointer-events:none}</style>';\n"
    . "\t\techo '<script>(function(){var c=document.getElementById(\"bk_date_only\");if(!c)return;var f=c.closest(\"fieldset\");function u(){f.querySelectorAll(\".bk-pkg-grid,.bk-hint\").forEach(function(g){g.classList.toggle(\"bk-pkg-off\",c.checked);});f.querySelectorAll(\".bk-pkg-grid select\").forEach(function(s){if(c.checked){s.value=\"\";}s.disabled=c.checked;});var e=f.querySelector(\".bk-error\");if(e&&c.checked){e.hidden=true;}}c.addEventListener(\"change\",u);u();})();</script>';";
$val = "\t\t\t\tif ( ! empty( \$raw['date_only'] ) ) {\n\t\t\t\t\t\$picked = array(); // date only: no packages yet\n\t\t\t\t}\n"
    . "\t\t\t\t\$data['packages']  = \$picked;\n\t\t\t\t\$data['date_only'] = ! empty( \$raw['date_only'] ) ? 1 : 0;\n"
    . "\t\t\t\t\$val               = \$data['date_only'] ? __( 'Date only – packages to be chosen later', 'endora' ) : implode( ' + ', \$picked );";
// apply bottom-up so indexes stay valid
array_splice($L, $pick, 2, explode("\n", $val));
array_splice($L, $close + 1, 0, explode("\n", $js));
array_splice($L, $hint, 0, explode("\n", $ui));
file_put_contents($argv[2], implode("\n", $L));
echo "ok\n";
