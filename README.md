# RMS Initial Stock Onboarding patch

## Mobile test checklist

1. Open the app via **HTTPS** in mobile browser (camera APIs require secure context).
2. Allow camera access when scanner opens on `/app/onboarding/initial-stock`.
3. Scan barcode and verify product is added to the cart.
4. Edit quantity and submit initial stock.
5. Verify redirect to `/app/inventory` and toast success.
