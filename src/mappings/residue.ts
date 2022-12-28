import {
  AddBenificiary as AddBenificiaryEvent,
  RemoveBenificiary as RemoveBenificiaryEvent
} from '../../generated/Residue/Residue';
import { Benificiary } from '../../generated/schema';

export function handleAddBenificiary(event: AddBenificiaryEvent): void {
  let item = Benificiary.load(
    event.params.contractAddress.toHexString() +
      '-' +
      event.params.tokenid.toString() +
      '-' +
      event.params.shareOwner.toHexString()
  );

  if (item) {
    item.sharePercent = item.sharePercent.plus(event.params.sharePercent);
  }

  item = new Benificiary(
    event.params.contractAddress.toHexString() +
      '-' +
      event.params.tokenid.toString() +
      '-' +
      event.params.shareOwner.toHexString()
  );

  item.contractAddress = event.params.contractAddress;
  item.tokenId = event.params.tokenid;
  item.shareOwner = event.params.shareOwner;
  item.sharePercent = event.params.sharePercent;
  item.isActive = true;

  item.save();
}

export function handleRemoveBenificiary(event: RemoveBenificiaryEvent): void {
  let item = Benificiary.load(
    event.params.contractAddress.toHexString() +
      '-' +
      event.params.tokenid.toString() +
      '-' +
      event.params.shareOwner.toHexString()
  );

  if (item) {
    item.isActive = false;
    item.save();
  }
}
