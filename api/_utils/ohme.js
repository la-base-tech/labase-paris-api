import fetch from 'cross-fetch';
import { utcToZonedTime, format } from 'date-fns-tz';

const API_ENDPOINT = 'https://api-ohme.oneheart.fr/api/v1/';

export async function createPayment(auth, params, customParams) {
  const url = `${API_ENDPOINT}payments`;
  const response = await fetch(url, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'client-name': auth.clientName,
      'client-secret': auth.clientSecret,
    },
    body: JSON.stringify({ ...params, ...customParams }),
  });
  return response.json();
}

export function formatDate(utcDate) {
  const timeZone = 'Europe/Paris';
  // Convert UTC Date to Zoned Date
  const zonedDate = utcToZonedTime(utcDate, timeZone);

  // Format date to Ohme format
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssxxx", { timeZone });
}
