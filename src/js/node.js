import Web3 from 'web3'

const initClientListener = (clientWSURL, onData, onError) => {
  clientWSURL.forEach((url) => {
    const web3 = new Web3(url);
    web3.eth.subscribe('newBlockHeaders').on("data", onData).on("error", onError)
  });
}

export default {initClientListener}
