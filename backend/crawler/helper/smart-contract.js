var helper = require('./utils');
var Logger = require('./logger');
var { get } = require('lodash');
var { zeroTxAddress } = require('./constants');
var { getHex } = require('./utils');
var { ethers } = require("ethers");

exports.updateToken = async function (tx, smartContractDao, tokenDao) {
  let contractAddress = get(tx, 'receipt.ContractAddress');
  if (contractAddress === undefined || contractAddress === zeroTxAddress) {
    return;
  }

  const abi = await smartContractDao.getAbi(contractAddress);
  if (!abi) {
    return;
  }

  const isTnt721 = checkTnt721(abi);
  const isTnt20 = checkTnt20(abi);
  if (!isTnt721 && !isTnt20) {
    return;
  }

  let logs = get(tx, 'receipt.Logs');
  logs = JSON.parse(JSON.stringify(logs));
  logs = logs.map(obj => {
    obj.data = getHex(obj.data)
    return obj;
  })
  logs = decodeLogs(logs, abi);
  const arr = abi.filter(obj => (obj.name == "tokenURI" && obj.type === 'function')
    || (obj.name === 'Transfer' && obj.type === 'event'));
  const tokenArr = [];
  if (arr.length === 0) return;
  logs.forEach(log => {
    const tokenId = get(log, 'decode.result.tokenId');
    const eventName = get(log, 'decode.eventName');
    if (tokenId === undefined && eventName !== 'Transfer') return;
    tokenArr.push({
      from: get(log, 'decode.result.from'),
      to: get(log, 'decode.result.to'),
      tokenId: get(log, 'decode.result.tokenId'),
      value: get(log, 'decode.result.value')
    })
  })

  const upsertList = [];
  tokenArr.forEach(token => {
    const newToken = {
      hash: tx.hash,
      token_type: isTnt20 ? 'TNT-20' : 'TNT-721',
      token_id: token.tokenId,
      from: token.from,
      to: token.to,
      value: token.value,
      timestamp: tx.timestamp
      //TODOs: add method field from decoded data
    }
    upsertList.push(tokenDao.insertAsync(newToken))
  })
  return Promise.all(upsertList);
}


function decodeLogs(logs, abi) {
  const iface = new ethers.utils.Interface(abi || []);
  return logs.map(log => {
    try {
      let event = null;
      for (let i = 0; i < abi.length; i++) {
        let item = abi[i];
        if (item.type != "event") continue;
        const hash = iface.getEventTopic(item.name)
        if (hash == log.topics[0]) {
          event = item;
          break;
        }
      }
      if (event != null) {
        let bigNumberData = iface.decodeEventLog(event.name, log.data, log.topics);
        let data = {};
        Object.keys(bigNumberData).forEach(k => {
          data[k] = bigNumberData[k].toString();
        })
        log.decode = {
          result: data,
          eventName: event.name,
          event: event
        }
      } else {
        log.decode = 'No matched event or the smart contract source code has not been verified.';
      }
      return log;
    } catch (e) {
      log.decode = 'Something wrong while decoding, met error: ' + e;
      return log;
    }
  })
}

function checkTnt721(abi) {
  const obj = {
    'balanceOf': { contains: false, type: 'function' },
    'ownerOf': { contains: false, type: 'function' },
    'safeTransferFrom': { contains: false, type: 'function' },
    'transferFrom': { contains: false, type: 'function' },
    'approve': { contains: false, type: 'function' },
    'setApprovalForAll': { contains: false, type: 'function' },
    'getApproved': { contains: false, type: 'function' },
    'isApprovedForAll': { contains: false, type: 'function' },
    'Transfer': { contains: false, type: 'event' },
    'Approval': { contains: false, type: 'event' },
    'ApprovalForAll': { contains: false, type: 'event' },
  }

  return _check(obj, abi);
}

function checkTnt20(abi) {
  const obj = {
    'name': { contains: false, type: 'function' },
    'symbol': { contains: false, type: 'function' },
    'decimals': { contains: false, type: 'function' },
    'totalSupply': { contains: false, type: 'function' },
    'balanceOf': { contains: false, type: 'function' },
    'transfer': { contains: false, type: 'function' },
    'transferFrom': { contains: false, type: 'function' },
    'approve': { contains: false, type: 'function' },
    'allowance': { contains: false, type: 'function' },
    'Transfer': { contains: false, type: 'event' },
    'Approval': { contains: false, type: 'event' },
  }

  return _check(obj, abi);
}

function _check(obj, abi) {
  abi.forEach(o => {
    if (obj[o.name] !== undefined) {
      if (obj[o.name].type === o.type) {
        obj[o.name].contains = true
      }
    }
  })
  let res = true;
  for (let key in obj) {
    res = res && obj[key].contains
  }
  return res;
}