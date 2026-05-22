export function getProductStatus(expirationDate: string) {
  const today = new Date();
  const expiration = new Date(expirationDate);

  today.setHours(0, 0, 0, 0);
  expiration.setHours(0, 0, 0, 0);

  const differenceInMilliseconds = expiration.getTime() - today.getTime();

  const differenceInDays = Math.ceil(
    differenceInMilliseconds / (1000 * 60 * 60 * 24),
  );

  if (differenceInDays < 0) {
    return "expired";
  }

  if (differenceInDays <= 7) {
    return "critical";
  }

  if (differenceInDays <= 30) {
    return "attention";
  }

  return "safe";
}
