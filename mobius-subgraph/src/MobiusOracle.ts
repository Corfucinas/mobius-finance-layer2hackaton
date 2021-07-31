import {BigInt, Entity} from "@graphprotocol/graph-ts"
import {
  AssetPriceChanged
} from "../generated/MobiusOracle/MobiusOracle"
import {
  IERC20
} from "../generated/MobiusOracle/IERC20"
import {PriceEntity} from "../generated/schema"
import {MOT_ADDR} from "./cfg";

export function handleAssetPriceChanged(event: AssetPriceChanged): void {
  let asset = event.params.asset.toString();
  if (asset != "MOT") {
    return;
  }
  let entity = new PriceEntity(asset + '_' + event.block.timestamp.toString());
  entity.name = asset;
  entity.time = event.block.timestamp;
  entity.price = event.params.newValue;

  let MOTContract = IERC20.bind(MOT_ADDR);
  let totalSupply = MOTContract.totalSupply();
  entity.marketCap = entity.price.times(totalSupply).div(BigInt.fromI32(10).pow(18));
  entity.save();
}
