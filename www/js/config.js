// Things you will want to change when Swagatam goes live.
export const APP_NAME = 'Swagatam';
export const TAGLINE = 'Schedule once, celebrate forever';

// DEMO sign-in: no SMS is sent. Replace sendOtp/verifyOtp in js/auth.js with a real provider (Firebase Auth, MSG91, ...) and set to false.
export const DEMO_OTP = '123456';
export const DEMO_AUTH = true;

// DEMO billing: "Unlock" just grants the plan locally. Hook js/main.js buyPlan() up to Google Play Billing / Razorpay.
export const PLANS = [
  { id: 'month', name: 'Monthly', sub: 'Billed every month', price: 99, days: 30 },
  { id: 'year', name: 'Yearly', sub: 'Best value - save 33%', price: 799, days: 365 },
];
export const DEMO_BILLING = true;
