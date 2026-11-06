'use strict';
// First-run data. Company details are filled in on the first start; the sample packages (Endora's 2026–2028 price guide) are optional.
// Everything here can be changed later in the app (Settings / Packages).

const L = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
let n = 0;
const pkg = (group, name, tagline, hours, moments, includes, delivery, priceHD, price4K, note = '') => ({
  id: 'p' + (++n), group, name, tagline, hours,
  moments: L(moments), includes: L(includes), delivery: L(delivery),
  priceHD, price4K, note, active: true,
});
const STD = 'Full HD 1080p or 4K\nOnline web delivery';
const LOC = 'Location booking charges are not included.';

const packages = [
  pkg('Wedding', 'Essential Moments', 'The beginning of your forever, beautifully captured.', '10 hours of wedding day coverage',
    'Couple portrait session\nWedding ceremony\nReception & celebrations',
    '1 professional cinematographer\nProfessional audio recording\nUp to 3-minute standard highlight film\nUp to 60-minute full wedding film',
    STD, 80000, 100000),
  pkg('Wedding', 'Elegant Vows', 'Your day. Your story. Beautifully preserved.', '12 hours of wedding day coverage',
    'Bride & groom getting ready\nCouple portrait session\nWedding ceremony\nReception & celebrations',
    '2 professional cinematographers\nDedicated audio recording\nProfessional field recorders\n4–6 minute cinematic story film\nUp to 90-minute full wedding film',
    STD, 110000, 160000, LOC),
  pkg('Wedding', 'Epic Story', 'Every moment. Every emotion. One unforgettable story.', '12 hours of wedding day coverage',
    'Bride & groom getting ready\nBridal details & wedding preparations\nCouple portraits & romantic moments\nWedding ceremony & vows\nFamily, friends & loved ones\nReception & celebrations\nFirst dance & special moments\nToasts & emotional moments',
    '3 professional cinematographers\nDedicated audio recording\nWireless microphones\nProfessional field recorders\n6–8 minute cinematic story film\nUp to 90-minute full wedding film\nProfessional cinematic editing & storytelling\nTransport included up to 200 km (up & down)',
    'Full HD 1080p or 4K\n32GB flash drive\nOnline web delivery', 150000, 220000, LOC),
  pkg('Wedding', 'The Endora Signature', 'The finest way to preserve your once-in-a-lifetime celebration.', '14 hours of signature wedding coverage',
    'Bride & groom getting ready moments\nBridal details & wedding preparations\nExclusive couple portrait session\nWedding ceremony & vows\nFamily, friends & loved ones\nReception & grand celebrations\nFirst dance & special moments\nToasts & emotional moments',
    '4 professional cinematographers\nDedicated professional audio recording\nWireless microphones & professional field recorders\n6–10 minute cinematic story film\nUp to 90-minute full wedding film\nProfessional cinematic editing & storytelling\nAerial drone coverage\nSame-day Instagram reel\nTransport included up to 200 km (up & down)',
    'Full HD 1080p\n32GB flash drive\nOnline web delivery\nAll final deliverables within 30 days (guaranteed)', 260000, 380000, LOC),
  pkg('Social', 'Endora Highlight', 'Your wedding day, beautifully crafted into a cinematic story.', '12 hours of wedding day coverage', '',
    'Professional cinema camera coverage\nCinematic storytelling of your wedding day\nWedding ceremony highlights\nCouple moments & creative portraits\nCandid emotions & special moments\nReception & celebration coverage\n4–6 minute cinematic highlight film\nProfessional color grading\nCinematic sound design',
    STD, 65000, 90000, LOC),
  pkg('Social', 'Endora Reels', 'Professionally filmed wedding reels using cinema cameras, created for Instagram, Facebook & TikTok.', '', '',
    'Professional cinema camera coverage\nCreative & cinematic wedding-day reels\nCandid moments & natural emotions\nProfessionally edited vertical reels\n3–5 cinematic reels for Instagram, Facebook & TikTok\nMusic-synced editing',
    STD, 55000, 70000, LOC),
  pkg('Social', 'Endora Social', 'Your wedding day, captured for social media on iPhone.', '12 hours of wedding day coverage', '',
    'Professional iPhone wedding-day coverage\nCandid & behind-the-scenes moments\nCeremony & key wedding moments\nCreative vertical video content\n3–5 edited wedding reels\nTrending & music-synced editing\nFast social media delivery',
    STD, 15000, 25000, LOC),
  pkg('Homecoming', 'Sweet Homecoming', 'A beautifully refined cinematic keepsake of your homecoming celebration.', '', '',
    'Couple portrait session\n1 professional cinematographer\nUp to 4-minute cinematic trailer\nCinematic editing & storytelling',
    STD, 50000, 70000),
  pkg('Homecoming', 'Homebound Memories', 'A refined cinematic collection of the moments that bring your celebration home.', '',
    'Couple portrait session\nWedding ceremony & vows\nReception & celebrations',
    '1 professional cinematographer\nProfessional audio recording\nUp to 4-minute cinematic trailer\n30–40 minute full wedding film\nCinematic editing & storytelling',
    STD, 70000, 110000),
  pkg('Pre-wedding', 'Enchanting Pre-Wedding', 'A beautifully crafted cinematic chapter before the beginning of forever.', '3 hours of pre-wedding coverage', '',
    '1 professional cinematographer\nCouple portraits & romantic moments\nUp to 3–4 min cinematic pre-wedding film\nCinematic editing & storytelling',
    STD, 55000, 85000),
  pkg('Pre-wedding', 'Romantic Pre-Wedding', 'An intimate cinematic experience to celebrate your connection.', '6 hours of pre-wedding coverage', '',
    '2 professional cinematographers\nCouple portraits & romantic moments\nMultiple locations & beautifully crafted sequences\nUp to 4-minute cinematic pre-wedding film\nCinematic editing & storytelling',
    STD, 80000, 120000),
  pkg('Engagement', 'Love Sparks', 'Engagement shoot coverage.', '', '',
    '1 professional cinematographer\nCouple portraits & candid moments\nUp to 4-minute cinematic film trailer\nCinematic editing & storytelling',
    STD, 50000, 70000),
  pkg('Engagement', 'Blissful Promise', 'Six hours of premium engagement coverage.', '6 hours of premium coverage', '',
    '1 professional cinematographer\nProfessional audio recording\nCouple portraits & beautiful candid moments\nCeremony & special moments\nUp to 4-minute cinematic film trailer\n20–30 minute complete film\nProfessional cinematic editing & storytelling',
    STD, 70000, 105000),
];

const addons = [
  { id: 'a1', name: 'Normal drone', price: 25000 },
  { id: 'a2', name: 'FPV drone', price: 20000 },
  { id: 'a3', name: 'Same-day Facebook story reel', price: 20000 },
  { id: 'a4', name: 'Extra hour – wedding', price: 20000 },
  { id: 'a5', name: 'Extra hour – homecoming', price: 12000 },
  { id: 'a6', name: 'Extra hour – engagement / pre-shoot', price: 10000 },
  { id: 'a7', name: '32GB flash drive (couriered in Sri Lanka)', price: 10000 },
  { id: 'a8', name: 'Additional revision', price: 5000 },
];

const settings = {
  company: { name: '', tagline: '', phone: '', email: '', website: '', address: '' },
  bank: { bank: '', branch: '', accName: '', accNo: '' },
  currency: 'LKR',
  invoicePrefix: 'INV-',
  nextInvoiceNo: 1,
  advance: 20000,
  terms: [
    'An advance payment confirms your date. The advance is non-refundable.',
    'The balance must be settled one week before the event.',
    'Travel and lodging beyond the package are charged separately.',
  ],
  smtp: { host: 'smtp.gmail.com', port: 465, secure: true, user: '', pass: '', from: '' },
  backupDirs: [],
  backupKeep: 30,
  lastBackup: '',
  pin: '',
  logo: '',
  setupDone: false,
  wa: { app: 'app', country: '94' },
};

module.exports = { packages, addons, settings };
