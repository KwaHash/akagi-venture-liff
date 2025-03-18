'use strict';

/**
 * コールバック(Webhook)URLの登録
 */

const ngrok = require('ngrok');
const axios = require('axios');
const FormData = require('form-data')

/**
 * ngrokを使ってlocalhost:${PORT}をトンネリング
 * @returns https URL
 */
const getNgrokURL = async () => {
  return await ngrok.connect({
    proto: 'http',
    addr: process.env.LIFF_RESERVE_PORT,
    configPath: '/root/.ngrok2/ngrok.yml',
    region: 'jp',
  });
};


const getChannelToken = async () => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.CLIENT_ID);
  params.append('client_secret', process.env.CLIENT_SECRET);
  try {
    const result = await axios({
      method: 'POST',
      url: 'https://api.line.me/v2/oauth/accessToken',
      params,
    })
    return `${result.data.token_type} ${result.data.access_token}`;
  } catch (e) {
    return e.response.data;
  }
};


const registEndpointURL = async () => {
  try {
    const url = await getNgrokURL();
    const token = await getChannelToken();

    axios({
      method: 'PUT',
      url: `https://api.line.me/liff/v1/apps/${process.env.VITE_LIFF_ID}`,
      headers: {
        'Authorization': token,
        'Content-type': 'application/json',
      },
      data: {
        view: {
          url,
        },
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(url);
        }
      })
      .catch((error) => {
        console.log('----- API error -----')
        if (error.response) console.log(error.response.data);
        else console.log(error);
        console.log('---------------------')
      });
  } catch (e) {
    console.log('---------- error ----------')
    if (e.response) console.log(e.response.body);
    else console.log(e);
    console.log('---------------------------')
  }
};


registEndpointURL();
