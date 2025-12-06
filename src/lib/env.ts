export function getWebhookInsuranceUrl() {
  const url = process.env.WEBHOOK_INSURANCE_URL
  if (!url) {
    throw new Error("WEBHOOK_INSURANCE_URL is not set")
  }
  return url
}


