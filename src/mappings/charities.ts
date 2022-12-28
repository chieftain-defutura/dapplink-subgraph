import { BigInt } from '@graphprotocol/graph-ts';
import {
  MintNft as MintNftEvent,
  Transfer as TransferEvent,
  UpdateTokenUri as UpdateTokenUriEvent,
  Charities
} from '../../generated/Charities/Charities';
import { Domain } from '../../generated/Charities/Domain';
import { CharityToken, User } from '../../generated/schema';

export function handleMintNft(event: MintNftEvent): void {
  let token = new CharityToken(event.params.tokenId.toString());

  token.domainId = event.params.domainId;
  token.tokenId = event.params.tokenId;

  let charityContract = Charities.bind(event.address);
  let domainContract = Domain.bind(charityContract.domain());

  token.domainName = domainContract.getDomainName(token.domainId);

  token.owner = event.params.user.toHexString();
  token.save();

  let user = User.load(event.params.user.toHexString());

  if (!user) {
    user = new User(event.params.user.toHexString());
    user.awaitingDelivery = BigInt.zero();
    user.haveToSend = BigInt.zero();
    user.save();
  }
}

export function handleTransfer(event: TransferEvent): void {
  let token = CharityToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.owner = event.params.to.toHexString();
  token.save();

  let user = User.load(event.params.to.toHexString());

  if (!user) {
    user = new User(event.params.to.toHexString());
    user.awaitingDelivery = BigInt.zero();
    user.haveToSend = BigInt.zero();
    user.save();
  }
}

export function handleUpdateTokenUri(event: UpdateTokenUriEvent): void {
  let token = CharityToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.tokenUri = event.params.tokenUri;
  token.save();
}
