import { callApi } from './utils';

export async function createGame() {
  return callApi('api/create', {
    method: "POST",
  });
}