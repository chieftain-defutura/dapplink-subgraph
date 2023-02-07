import {
  MintNft as MintNftEvent,
  Transfer as TransferEvent,
  UpdateTokenUri as UpdateTokenUriEvent,
  SetLink as SetLinkEvent,
  UpdateCategory as UpdateCategoryEvent,
  UploadChunk as UploadChunkEvent,
  Website
} from '../../generated/Website/Website';
import { Domain } from '../../generated/Website/Domain';
import { WebsiteToken, User, Chunk } from '../../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleMintNft(event: MintNftEvent): void {
  let token = new WebsiteToken(event.params.tokenId.toString());

  token.domainId = event.params.domainId;
  token.tokenId = event.params.tokenId;

  let websiteContract = Website.bind(event.address);
  let domainContract = Domain.bind(websiteContract.domain());

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
  let token = WebsiteToken.load(event.params.tokenId.toString());

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
  let token = WebsiteToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.tokenUri = event.params.tokenUri;
  token.save();
}

export function handleSetLink(event: SetLinkEvent): void {
  let token = WebsiteToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.mimeType = event.params.mimeType;
  token.totalChunks = event.params.totalChunks;
  token.save();
}

export function handleUploadChunk(event: UploadChunkEvent): void {
  let token = WebsiteToken.load(event.params.tokenId.toString());
  if (!token) return;

  let chunkId =
    event.params.tokenId.toString() +
    '-' +
    event.params.chunkIndex.toString() +
    '-' +
    event.address.toHexString();

  let chunk = Chunk.load(chunkId);

  if (!chunk) {
    chunk = new Chunk(chunkId);

    chunk.tokenId = event.params.tokenId;
    chunk.chunkData = event.params.chunkData;
    chunk.chunkIndex = event.params.chunkIndex;
    chunk.erc721TokenAddress = event.address.toHexString();
    chunk.save();
    return;
  }

  chunk.chunkData = event.params.chunkData;
  chunk.save();
}

export function handleUpdateCategory(event: UpdateCategoryEvent): void {
  let token = WebsiteToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.category = event.params.category;
  token.save();
}
