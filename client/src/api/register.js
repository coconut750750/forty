import { callApi } from './utils';

export async function createGame() {
  return callApi('api/create', {
    method: "POST",
  });
}

export async function checkCode(gameCode) {
  return callApi(`api/checkcode?gameCode=${gameCode}`);
}

export async function checkName(name, gameCode) {
  if (gameCode != undefined) {
    return callApi(`api/checkname?gameCode=${gameCode}&name=${name}`);
  } else {
    return callApi(`api/checkname?name=${name}`);
  }
}
