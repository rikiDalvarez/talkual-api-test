export function isValidPostalCode(postalCode: string): boolean {
  const allowedPostalCodes = [
    '28005', '08001', '25250'
  ]
  return allowedPostalCodes.includes(postalCode);
}
