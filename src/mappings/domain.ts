import { BigInt } from '@graphprotocol/graph-ts';
import {
  Transfer as TransferEvent,
  UpdateTokenUri as UpdateTokenUriEvent,
  MintNft as MintNftEvent
} from '../../generated/Domain/Domain';
import { User, DomainToken } from '../../generated/schema';

export function handleMintNft(event: MintNftEvent): void {
  let domainToken = new DomainToken(event.params.tokenId.toString());

  domainToken.domainName = event.params.domainName;
  domainToken.tokenId = event.params.tokenId;
  domainToken.tld = event.params.tld;
  domainToken.owner = event.params.user.toHexString();
  domainToken.save();

  let user = User.load(event.params.user.toHexString());

  if (!user) {
    user = new User(event.params.user.toHexString());
    user.awaitingDelivery = BigInt.zero();
    user.haveToSend = BigInt.zero();
    user.save();
  }
}

export function handleTransfer(event: TransferEvent): void {
  let domainToken = DomainToken.load(event.params.tokenId.toString());

  if (!domainToken) return;

  domainToken.owner = event.params.to.toHexString();
  domainToken.save();

  let user = User.load(event.params.to.toHexString());

  if (!user) {
    user = new User(event.params.to.toHexString());
    user.awaitingDelivery = BigInt.zero();
    user.haveToSend = BigInt.zero();
    user.save();
  }
}

export function handleUpdateTokenUri(event: UpdateTokenUriEvent): void {
  let domainToken = DomainToken.load(event.params.tokenId.toString());

  if (!domainToken) return;

  domainToken.tokenUri = event.params.tokenUri;
  domainToken.save();
}
