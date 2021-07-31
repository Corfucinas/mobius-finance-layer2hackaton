import {Address, BigInt, Bytes, store} from "@graphprotocol/graph-ts";
import {ISSUER_ADDR,STAKER_ADDR,BIG_INT_ZERO,strToBytes} from "./cfg";
import {
  Mobius,
  Burned,
  Claimed,
  Liquidated,
  ManagerChanged,
  Minted,
  OwnerChanged,
  PauseChanged,
  Shorted,
  Staked,
  Traded
} from "../generated/Mobius/Mobius";
import {Issuer} from "../generated/Mobius/Issuer";
import {Staker} from "../generated/Mobius/Staker";
import {
  TransactionCountsEntity,
  VolumeEntity,
  VolumeOfSynthEntity, 
  FeeEntity, 
  OperationEntity,
  StakesAndDebtsEntity,
  TxCountsDailyEntity,
  VolumeDailyEntity
} from "../generated/schema";

function addTxCount(id: BigInt): void {
  // every 15 min
  let newID = (id / BigInt.fromI32(1800)) * BigInt.fromI32(1800);
  let entity = TransactionCountsEntity.load(newID.toString());

  if (entity == null){
    entity = new TransactionCountsEntity(newID.toString());
    entity.count = BigInt.fromI32(1);
    entity.save();
  } else{
    entity.count = entity.count + BigInt.fromI32(1);
    entity.save();
  }


  // daily
  let newID2 = (id / BigInt.fromI32(86400)) * BigInt.fromI32(86400);
  let entity2 = TxCountsDailyEntity.load(newID2.toString());

  if (entity2 == null){
    entity2 = new TxCountsDailyEntity(newID2.toString());
    entity2.count = BigInt.fromI32(1);
    entity2.save();
  } else{
    entity2.count = entity2.count + BigInt.fromI32(1);
    entity2.save();
  }

}

function addVolume(id: BigInt, amount: BigInt): void {
  // every 15 min
  let newID = (id / BigInt.fromI32(1800)) * BigInt.fromI32(1800);
  let entity = VolumeEntity.load(newID.toString());

  if (entity == null){
    entity = new VolumeEntity(newID.toString());
    entity.amount = amount;
    entity.save();

  } else{
    entity.amount = entity.amount + amount;
    entity.save();
  }

  // daily
  let newID2 = (id / BigInt.fromI32(86400)) * BigInt.fromI32(86400);
  let entity2 = VolumeDailyEntity.load(newID2.toString());

  if (entity2 == null){
    entity2= new VolumeDailyEntity(newID2.toString());
    entity2.amount = amount;
    entity2.save();

  } else{
    entity2.amount = entity2.amount + amount;
    entity2.save();
  }
}

function addVolumeOfSynth(time: BigInt, synth: string, amount: BigInt, fee: BigInt): void {
  let newTime = (time / BigInt.fromI32(1800)) * BigInt.fromI32(1800);
  let key = synth + '_' + newTime.toString();
  let entity = VolumeOfSynthEntity.load(key);

  if (entity == null){
    entity = new VolumeOfSynthEntity(key);
    entity.synth = synth;
    entity.time = newTime;
    entity.amount = amount;
    entity.fee = fee;
    entity.save();

  } else{
    entity.amount = entity.amount + amount;
    entity.fee = entity.fee + fee;
    entity.save();
  }
}

function addOperation(id: string,addr: string,op: string,type: string,value: BigInt,time: BigInt): void {
  let entity = new OperationEntity(id);
  entity.addr = addr;
  entity.op = op;
  entity.type = type;
  entity.value = value;
  entity.time = time;
  entity.save()
}

function addFee(id: string, amount: BigInt): void {
  let entity = FeeEntity.load(id);

  if (entity == null){
    entity = new FeeEntity(id);
    entity.tradeFee = amount;
    entity.save();
  } else {
    entity.tradeFee = entity.tradeFee + amount;
    entity.save();
  }
}

function updateStakesAndDebts(addr: Address, stake: Bytes, debt: Bytes, time: BigInt): void {
  let id = addr.toHexString() + '_' + stake.toString() + '_' + debt.toString();
  let issuerContract = Issuer.bind(ISSUER_ADDR);
  let debtAmt = issuerContract.getDebt(stake,addr,debt);

  let stakerContract = Staker.bind(STAKER_ADDR);
  let stakeAmt = stakerContract.getStaked(stake,addr,debt);

  let SAD = new StakesAndDebtsEntity(id);
  SAD.addr = addr.toHexString();
  SAD.stake = stake.toString();
  SAD.stakeAmt = stakeAmt;
  SAD.debt = debt.toString();
  SAD.debtAmt = debtAmt;
  SAD.ratio = debtAmt.equals(BIG_INT_ZERO)? BIG_INT_ZERO :stakeAmt.times(BigInt.fromI32(10).pow(18)).div(debtAmt);
  SAD.time = time;
  SAD.save();
}
//////////////////////////////////////////////////////////////////////////////////

export function handleBurned(event: Burned): void {
  addTxCount(event.block.timestamp);

  addOperation(event.transaction.hash.toHexString() + '_' + event.logIndex.toString()
  ,event.params.account.toHexString()
  ,"Burn"
  ,event.params.stake.toString() + '_' + event.params.debtType.toString()
  ,event.params.amount
  ,event.block.timestamp);

  updateStakesAndDebts(event.params.account,event.params.stake,event.params.debtType,event.block.timestamp);
}

export function handleClaimed(event: Claimed): void {
  addTxCount(event.block.timestamp);

  addOperation(event.transaction.hash.toHexString() + '_' + event.logIndex.toString()
  ,event.params.account.toHexString()
  ,"Claim"
  ,event.params.stake.toString() + '_' +event.params.debtType.toString()
  ,event.params.amount
  ,event.block.timestamp);

  updateStakesAndDebts(event.params.account,event.params.stake,event.params.debtType,event.block.timestamp);
}

export function handleLiquidated(event: Liquidated): void {
  addTxCount(event.block.timestamp);

  addOperation(event.transaction.hash.toHexString() + '_' + event.logIndex.toString()
  ,event.params.account.toHexString()
  ,"Liquidated"
  ,event.params.stake.toString() + '_' + event.params.debtType.toString()
  ,event.params.burnAmount
  ,event.block.timestamp);

  updateStakesAndDebts(event.params.account,event.params.stake,event.params.debtType,event.block.timestamp);
}

export function handleManagerChanged(event: ManagerChanged): void {
  addTxCount(event.block.timestamp);
}

export function handleMinted(event: Minted): void {
  addTxCount(event.block.timestamp);

  addOperation(event.transaction.hash.toHexString() + '_' + event.logIndex.toString()
  ,event.params.account.toHexString()
  ,"Mint"
  ,event.params.stake.toString() + '_' + 'moUSD'
  ,event.params.issuerAmount
  ,event.block.timestamp);

  updateStakesAndDebts(event.params.account,event.params.stake,strToBytes('moUSD',32),event.block.timestamp);
}

export function handleOwnerChanged(event: OwnerChanged): void {}

export function handlePauseChanged(event: PauseChanged): void {}

export function handleShorted(event: Shorted): void {
  addTxCount(event.block.timestamp);

  addOperation(event.transaction.hash.toHexString() + '_' + event.logIndex.toString()
  ,event.params.param0.toHexString()
  ,"Short"
  ,event.params.stake.toString() + '_' + event.params.synth.toString()
  ,event.params.debtAmount
  ,event.block.timestamp);

  updateStakesAndDebts(event.params.param0,event.params.stake,event.params.synth,event.block.timestamp);
}

export function handleStaked(event: Staked): void {
  addTxCount(event.block.timestamp);

  addOperation(event.transaction.hash.toHexString() + '_' + event.logIndex.toString()
  ,event.params.account.toHexString()
  ,"Stake"
  ,event.params.stake.toString() + '_' + event.params.debtType.toString()
  ,event.params.stakeAmount
  ,event.block.timestamp);

  updateStakesAndDebts(event.params.account,event.params.stake,event.params.debtType,event.block.timestamp);
}

export function handleTraded(event: Traded): void {
  addTxCount(event.block.timestamp);

  let amount = event.params.fromAmount * event.params.fromSynthPrice / (BigInt.fromI32(10).pow(18));
  addVolume(event.block.timestamp,amount);
  addVolumeOfSynth(event.block.timestamp,event.params.fromSynth.toString(),amount,event.params.tradingFee);
  addVolumeOfSynth(event.block.timestamp,event.params.toSynth.toString(),amount,event.params.tradingFee);
  addFee(event.params.toSynth.toString(),event.params.tradingFee);

  addOperation(event.transaction.hash.toHexString() + '_' + event.logIndex.toString()
  ,event.params.account.toHexString()
  ,"Trade"
  ,event.params.fromSynth.toString() + '_' + event.params.toSynth.toString()
  ,event.params.fromAmount
  ,event.block.timestamp);
}
