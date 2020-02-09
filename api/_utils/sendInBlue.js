const dotenv = require('dotenv');

dotenv.config();

const fetch = require('cross-fetch');

const SENDINBLUE_API_ENDPOINT = 'https://api.sendinblue.com/v3/';

const { SENDINBLUE_API_KEY, SENDINBLUE_LIST_ID } = process.env;

async function sendInBlueRequest({ uri, method, body }) {
  const params = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': SENDINBLUE_API_KEY,
    },
  };
  if (body) {
    params.body = JSON.stringify(body);
  }
  const response = await fetch(`${SENDINBLUE_API_ENDPOINT}${uri}`, params);
  const data = await response.json();
  return data;
}

async function getContactByEmail(email) {
  const response = await sendInBlueRequest({
    uri: `contacts/${email}`,
    method: 'get',
  });
  if (!response || response.code === 'document_not_found') {
    return null;
  }
  return response;
}

function createContact(email, attributes) {
  return sendInBlueRequest({
    uri: 'contacts',
    method: 'post',
    body: {
      email,
      attributes: attributes || undefined,
    },
  });
}

function updateContact(email, attributes) {
  return sendInBlueRequest({
    uri: `contacts/${email}`,
    method: 'put',
    body: {
      attributes,
    },
  });
}

async function updateOrCreateContact(email, attributes) {
  const contact = await getContactByEmail(email);

  // Nothing to update
  if (contact && !attributes) {
    return contact;
  }

  // Contact does not exist, create contact and add it to the list
  if (!contact) {
    await createContact(email, attributes);
  } else {
    // Update contact
    await updateContact(email, attributes);
  }

  return getContactByEmail(email);
}

async function addContactToList(contact, listId) {
  // Contact already in list
  if (contact.listIds.includes(Number.parseInt(SENDINBLUE_LIST_ID, 10))) {
    return;
  }

  // Add existing contact to list
  await sendInBlueRequest({
    uri: `contacts/lists/${listId}/contacts/add`,
    method: 'post',
    body: {
      emails: [contact.email],
    },
  });
}

module.exports = {
  getContactByEmail,
  updateOrCreateContact,
  addContactToList,
};
