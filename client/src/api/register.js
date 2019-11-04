import { callApi } from './utils';

export async function createGame(options) {
  return callApi('api/create', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });
}

export async function checkCode(gameCode) {
  return callApi(`api/checkcode?gameCode=${gameCode}`);
}

export async function checkName(name, gameCode) {
  if (gameCode !== undefined) {
    return callApi(`api/checkname?gameCode=${gameCode}&name=${name}`);
  } else {
    return callApi(`api/checkname?name=${name}`);
  }
}
