import {Address, BigInt, Bytes ,ByteArray} from "@graphprotocol/graph-ts";

export let ISSUER_ADDR = Address.fromString('');
export let STAKER_ADDR = Address.fromString('');
export let MOT_ADDR = Address.fromString('');

export let BIG_INT_ZERO = BigInt.fromI32(0);
export function strToBytes(str: string, length: i32 = 32): Bytes {

    let bytes = new ByteArray(length);
    let bytes1 = ByteArray.fromUTF8(str)

    for (let i: i32 = 0; i < length; i++) {
      if (i >= bytes1.length) {
        break;
      } 
      bytes[i] = bytes1[i];
    }
    return bytes as Bytes;
}