import {
  MintNft as MintNftEvent,
  Transfer as TransferEvent,
  UpdateTokenUri as UpdateTokenUriEvent,
  SetLink as SetLinkEvent,
  FullOnBlockchainArt
} from '../../generated/FullOnBlockchainArt/FullOnBlockchainArt';
import { Domain } from '../../generated/FullOnBlockchainArt/Domain';
import { FullOnBlockchainArtToken, User } from '../../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleMintNft(event: MintNftEvent): void {
  let token = new FullOnBlockchainArtToken(event.params.tokenId.toString());

  token.domainId = event.params.domainId;
  token.tokenId = event.params.tokenId;

  let charityContract = FullOnBlockchainArt.bind(event.address);
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
  let token = FullOnBlockchainArtToken.load(event.params.tokenId.toString());

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
  let token = FullOnBlockchainArtToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.tokenUri = event.params.tokenUri;
  token.save();
}

export function handleSetLink(event: SetLinkEvent): void {
  let token = FullOnBlockchainArtToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.link = event.params.link;
  token.save();
}
