# Endora Invoice

Bookings and invoices for Endora Wedding Films, on your own computer (Windows and Mac).

- Admin panel: bookings, invoices, payments, packages (add by hand or import from a price-list PDF), add-ons, settings, optional PIN
- Packages and add-ons from the 2026–2028 price guide are added on first start
- Invoice PDF (A4), print, email (Gmail app password), WhatsApp
- Data stays on the computer: `endora-invoice-data.json` in the app's data folder; PDFs in Documents › Endora Invoices
- Daily backups to any folders you choose (another drive, Google Drive folder, USB)
- Updates: every push to `main` builds a new release; Windows updates itself, Mac shows a download button

Download the latest version from [Releases](../../releases/latest).

## Installing on a Mac (no Terminal)

1. Open the `.dmg` and drag **Endora Invoice** into **Applications**.
2. Open it from Applications. macOS says it can't verify the app. Press **Done**.
3. Open **System Settings → Privacy & Security**, scroll down and press **Open Anyway** next to "Endora Invoice", then enter your Mac password.
4. From now on it opens normally.

## Packages from a PDF

Packages → **Import from PDF…** reads a price-list PDF, finds each package name, its price and what's included, and shows them for you to check before they are added. It works with PDFs that contain text. A PDF that is only a picture (for example a Canva design exported as images) has nothing to read; add those packages by hand.
