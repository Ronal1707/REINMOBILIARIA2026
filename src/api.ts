// src/apiConfig.ts

const TOKEN = '6kwdZqPVaOs6IIVwC1VLpgrf72JCKLXB9dvuVSxK-861';

export const headers = new Headers({
  Authorization: 'Basic ' + btoa(':' + TOKEN)
});
