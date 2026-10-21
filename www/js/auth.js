// Mobile-number sign-in. DEMO implementation: nothing is sent; the fixed code from config.js is accepted.
// For production swap these two functions for a real OTP provider - the rest of the app only calls them.
import { DEMO_OTP } from './config.js';

export const validMobile = (m) => /^[6-9]\d{9}$/.test(m);

export async function sendOtp(mobile) {
  await new Promise((r) => setTimeout(r, 500));
  return { ok: true };
}

export async function verifyOtp(mobile, code) {
  await new Promise((r) => setTimeout(r, 350));
  return code === DEMO_OTP;
}
