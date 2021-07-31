import {BigInt} from "@graphprotocol/graph-ts"
import {
  Swap
} from "../generated/RewardTrading/RewardTrading"
import {TradingAmountEntity} from "../generated/schema"

function addVolumeOfSynth(time: BigInt, pid: BigInt, amount: BigInt): void {
  let newTime = (time / BigInt.fromI32(1800)) * BigInt.fromI32(1800);
  let key = pid.toString() + '_' + newTime.toString();
  let entity = TradingAmountEntity.load(key);

  if (entity == null){
    entity = new TradingAmountEntity(key);
    entity.pid = pid;
    entity.time = newTime;
    entity.amount = amount;
    entity.save();

  } else{
    entity.amount = entity.amount + amount;
    entity.save();
  }
}

export function handleSwap(event: Swap): void {
  addVolumeOfSynth(event.block.timestamp,event.params.pid,event.params.amount,);
}
