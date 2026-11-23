# Google Play IAP Setup Guide

Follow these steps to configure your In-App Products in the Google Play Console so that real purchases work in your app.

## Prerequisites
- Your app must be uploaded to the Google Play Console (at least as an Internal Testing track).
- You must have a **Google Merchant Account** linked to your Play Console (it will prompt you when you try to add products).

## Step 1: Navigate to In-App Products

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your **Word Scrambl** app.
3. In the left sidebar, go to **Monetize > Products > In-app products**.
4. Click **Create product**.

## Step 2: Create Product — Remove Ads

| Field | Value |
|-------|-------|
| **Product ID** | `scrambl_remove_ads` |
| **Name** | Remove Ads |
| **Description** | Enjoy a clean, ad-free Scrambl experience forever. |
| **Default price** | $2.99 USD |

- Click **Save** and then **Activate**.

## Step 3: Create Product — 100 Coins

| Field | Value |
|-------|-------|
| **Product ID** | `scrambl_coins_100` |
| **Name** | 100 Coins |
| **Description** | A quick boost of 100 coins for hints. |
| **Default price** | $0.99 USD |

- Click **Save** and then **Activate**.

## Step 4: Create Product — 500 Coins

| Field | Value |
|-------|-------|
| **Product ID** | `scrambl_coins_500` |
| **Name** | 500 Coins |
| **Description** | A pocket full of 500 coins. |
| **Default price** | $2.99 USD |

- Click **Save** and then **Activate**.

## Step 5: Create Product — 1000 Coins

| Field | Value |
|-------|-------|
| **Product ID** | `scrambl_coins_1000` |
| **Name** | 1000 Coins |
| **Description** | The ultimate treasure chest of 1000 coins. |
| **Default price** | $4.99 USD |

- Click **Save** and then **Activate**.

## Step 6: Set Up License Testing

1. In the left sidebar, go to **Settings > License testing**.
2. Add your Gmail email address to the list of testers.
3. Set **License response** to `RESPOND_NORMALLY`.

This allows you to make test purchases without being charged real money!

## Step 7: Build & Test

1. In your Scrambl terminal, run:
   ```bash
   npm run build:android
   npx cap sync android
   ```
2. In Android Studio, build and install the app on your phone.
3. Open the Shop and tap a product — Google Play's purchase dialog should appear.

## Important Notes

- **Product IDs are permanent.** Once created, they cannot be reused even if deleted. Make sure you type them exactly as shown above.
- **Prices are in USD.** Google will automatically convert to local currencies for users in other countries.
- **The app must be published** (even just to Internal Testing) before IAP products will load on a device.
