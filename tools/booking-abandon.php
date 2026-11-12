<?php
/**
 * Reserve Your Date: alert the owner when someone starts the form (name + phone + date)
 * but does not submit it within 20 minutes.
 *
 * @package Endora
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'endora/v1',
			'/partial',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => 'endora_bk_partial_save',
			)
		);
	}
);

/** Saves what the visitor typed so far (called by the form while they type). */
function endora_bk_partial_save( WP_REST_Request $req ) {
	$ip  = preg_replace( '/[^0-9a-f:.]/i', '', (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
	$key = 'endora_bkp_ip_' . md5( $ip );
	$n   = (int) get_transient( $key );
	if ( $n > 30 ) {
		return new WP_REST_Response( array( 'ok' => false ), 429 );
	}
	set_transient( $key, $n + 1, HOUR_IN_SECONDS );

	$phone  = preg_replace( '/[^0-9+]/', '', (string) $req->get_param( 'phone' ) );
	$digits = preg_replace( '/\D/', '', $phone );
	if ( strlen( $digits ) < 9 || strlen( $digits ) > 15 || preg_match( '/(\d)\1{6,}/', $digits ) ) {
		return array( 'ok' => true ); // not a usable number yet
	}
	$clip = function ( $v, $len ) {
		return mb_substr( sanitize_text_field( (string) $v ), 0, $len );
	};
	$date = (string) $req->get_param( 'wedding_date' );
	$row  = array(
		'p1'    => $clip( $req->get_param( 'p1' ), 60 ),
		'p2'    => $clip( $req->get_param( 'p2' ), 60 ),
		'phone' => $phone,
		'date'  => preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ? $date : '',
		'pkg'   => $clip( $req->get_param( 'pkg' ), 160 ),
		't'     => time(),
	);
	$all  = get_option( 'endora_bk_partials', array() );
	$all  = is_array( $all ) ? $all : array();
	$tail = substr( $digits, -9 );
	if ( ! empty( $all[ $tail ]['alerted'] ) && time() - (int) $all[ $tail ]['alerted'] < DAY_IN_SECONDS ) {
		$row['alerted'] = $all[ $tail ]['alerted']; // one alert per number per day
	}
	$all[ $tail ] = $row;
	// keep the list small
	foreach ( $all as $k => $v ) {
		if ( time() - (int) ( $v['t'] ?? 0 ) > 3 * DAY_IN_SECONDS ) {
			unset( $all[ $k ] );
		}
	}
	update_option( 'endora_bk_partials', $all, false );
	wp_clear_scheduled_hook( 'endora_bk_partial_check', array( $tail ) );
	wp_schedule_single_event( time() + 20 * MINUTE_IN_SECONDS, 'endora_bk_partial_check', array( $tail ) );
	return array( 'ok' => true );
}

add_action( 'endora_bk_partial_check', 'endora_bk_partial_check' );

/** 20 minutes after the last keystroke: alert the owner if no booking came in from that number. */
function endora_bk_partial_check( $tail ) {
	$all = get_option( 'endora_bk_partials', array() );
	$row = is_array( $all ) && isset( $all[ $tail ] ) ? $all[ $tail ] : null;
	if ( ! $row || ! empty( $row['alerted'] ) ) {
		return;
	}
	global $wpdb;
	$done = (int) $wpdb->get_var(
		$wpdb->prepare(
			"SELECT COUNT(*) FROM {$wpdb->postmeta} m JOIN {$wpdb->posts} p ON p.ID = m.post_id WHERE p.post_type = 'endora_booking' AND m.meta_key = '_bk_phone' AND REPLACE(REPLACE(REPLACE(m.meta_value,' ',''),'-',''),'+','') LIKE %s AND p.post_date >= %s",
			'%' . $wpdb->esc_like( $tail ),
			gmdate( 'Y-m-d H:i:s', (int) $row['t'] - HOUR_IN_SECONDS + (int) ( get_option( 'gmt_offset' ) * HOUR_IN_SECONDS ) )
		)
	);
	if ( $done ) {
		unset( $all[ $tail ] );
		update_option( 'endora_bk_partials', $all, false );
		return;
	}
	$names = trim( $row['p1'] . ( '' !== $row['p2'] ? ' & ' . $row['p2'] : '' ) );
	$text  = "*Reservation not finished* \u{23F3}\n"
		. 'Someone started the Reserve Your Date form but did not submit it.' . "\n"
		. ( '' !== $names ? 'Name: ' . $names . "\n" : '' )
		. 'Phone: ' . $row['phone'] . "\n"
		. ( '' !== $row['date'] && function_exists( 'endora_bk_nice_date' ) ? 'Date: ' . endora_bk_nice_date( $row['date'] ) . "\n" : '' )
		. ( '' !== $row['pkg'] ? 'Choice: ' . $row['pkg'] . "\n" : '' )
		. 'Give them a call or WhatsApp to help them finish.';
	if ( function_exists( 'endora_bk_whatsapp_send' ) ) {
		endora_bk_whatsapp_send( $text );
	}
	$all[ $tail ]['alerted'] = time();
	update_option( 'endora_bk_partials', $all, false );
}

/** The form script: sends the fields a few seconds after the visitor stops typing, and when they leave the page. */
add_action(
	'wp_footer',
	function () {
		if ( ! is_page_template( 'page-templates/template-reserve.php' ) ) {
			return;
		}
		$url = esc_url_raw( rest_url( 'endora/v1/partial' ) );
		?>
<script>
(function () {
	var phone = document.getElementById('bk_phone');
	if (!phone) { return; }
	var form = phone.closest('form'), timer = null, last = '', sent = false;
	function v(id) { var e = document.getElementById(id); return e ? e.value : ''; }
	function data() {
		var f = new FormData(form), pk = [];
		form.querySelectorAll('.bk-pkg-grid select').forEach(function (s) { if (s.value) { pk.push(s.value); } });
		var dOnly = document.getElementById('bk_date_only');
		var d = new FormData();
		d.append('p1', v('bk_p1')); d.append('p2', v('bk_p2')); d.append('phone', v('bk_phone'));
		d.append('wedding_date', (f.get('wedding_date') || v('bk_wedding_date') || ''));
		d.append('pkg', dOnly && dOnly.checked ? 'Date only' : pk.join(' + '));
		return d;
	}
	function send() {
		if (sent) { return; }
		var digits = (v('bk_phone') || '').replace(/\D/g, '');
		if (digits.length < 9) { return; }
		var d = data(), sig = Array.from(d.values()).join('|');
		if (sig === last) { return; }
		last = sig;
		try { fetch(<?php echo wp_json_encode( $url ); ?>, { method: 'POST', body: d, keepalive: true }); } catch (e) {}
	}
	form.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(send, 4000); });
	form.addEventListener('change', function () { clearTimeout(timer); timer = setTimeout(send, 2000); });
	document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { send(); } });
	form.addEventListener('submit', function () { sent = true; clearTimeout(timer); });
})();
</script>
		<?php
	},
	99
);
