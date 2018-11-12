import 'babel-polyfill';
import Web3 from 'web3'
import rlp from 'rlp'

const sigHash = (web3,header) => {
	const encodedHeader = rlp.encode([
		header.parentHash,
		header.sha3Uncles,
		header.miner,
		header.stateRoot,
		header.transactionsRoot,
		header.receiptsRoot,
		header.logsBloom,
		web3.utils.toBN(header.difficulty),
		web3.utils.toBN(header.number),
		header.gasLimit,
		header.gasUsed,
		web3.utils.toBN(header.timestamp),
		header.extraData,
		header.mixHash,
		header.nonce,
	]);
	return web3.utils.sha3(encodedHeader);
};

const getBlockSignerAddress = async (web3,header) => {
  const extraVanity = 32
  const extraSeal = 65 // r(32 bytes) + s(32 bytes) + v(1 byte)

  const signature = '0x' + header.extraData.slice(-(extraSeal*2))
  const extraDataUnsigned = header.extraData.slice(0,header.extraData.length-(extraSeal*2))//.padEnd(header.extraData.length,0)

  const blockHeaderNoSignature = Object.assign({},header, {extraData: extraDataUnsigned})
  const blockHashNoSignature = sigHash(web3, blockHeaderNoSignature)

  const unsignedBlockBuffer = Buffer.from(blockHashNoSignature.slice(2),'hex')

  const signerAddress = await web3.eth.accounts.recover(blockHashNoSignature, signature, true)
  return signerAddress
}

const initClientListener = (clientWSURL, onData, onError) => {
  const clients = clientWSURL.map((url) => {
    const web3 = new Web3(url);
    web3.eth.subscribe('newBlockHeaders').on("data", onData).on("error", onError)
    return web3
  });
  return clients
}

let defaultClient = undefined
const setDefaultClient = (client) => (defaultClient = client)
const getDefaultClient = () => defaultClient

export default {initClientListener, getBlockSignerAddress, getDefaultClient, setDefaultClient}
