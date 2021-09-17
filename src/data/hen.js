import { TezosToolkit, OpKind } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
} from "@airgap/beacon-sdk";

const Tezos = new TezosToolkit('https://api.tez.ie/rpc/mainnet')
const wallet = new BeaconWallet({ name: "OBJKTs Batch Swap" });

Tezos.setWalletProvider(wallet);
const network = { type: NetworkType.MAINNET };

export const getAccount = async () => {
  try {
    return await wallet.client.getActiveAccount()
  } catch (err) {
    throw err
  }
}


export const connect = async () => {
  try {
    await wallet.client.requestPermissions({
      network: network,
    })
    const address = await wallet.getPKH();
    return address
  } catch (err) {
    throw err
  }
}

export const disconnect = async () => {
  try {
    await wallet.clearActiveAccount();
    return 'disconnected'
  } catch (err) {
    throw err
  }
}


export const collect = async (pieces) => {
  console.log(pieces)
  try {
    const v2Contract = 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn'
    let marketplace = await Tezos.wallet.at(v2Contract)

    let list = []
    for (let i in pieces) {
      const objkt = pieces[i]

      list.push({
        kind: OpKind.TRANSACTION,
        ...marketplace.methods.collect(parseFloat(objkt.id)).toTransferParams({
          amount: parseFloat(objkt.price),
          mutez: true,
          storageLimit: 350,
        })
      })

    }
    let batch = await Tezos.wallet.batch(list)
    const batchOp = await batch.send()
    return await batchOp.confirmation()
  } catch (err) {
    console.log(err)
    throw err
  }
}
