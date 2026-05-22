export function getDaysToExpire(expirationDate: string) {
  const today = new Date();
  const expiration = new Date(expirationDate);

  today.setHours(0, 0, 0, 0);
  expiration.setHours(0, 0, 0, 0);

  const differenceInMilliseconds = expiration.getTime() - today.getTime();

  const differenceInDays = Math.ceil(
    differenceInMilliseconds / (1000 * 60 * 60 * 24),
  );

  return differenceInDays;
}
