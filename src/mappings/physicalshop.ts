import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AddItem as AddItemEvent,
  UpdateItem as UpdateItemEvent,
  UpdateTokenUri as UpdateTokenUriEvent,
  RemoveItem as RemoveItemEvent,
  MintNft as MintNftEvent,
  Transfer as TransferEvent,
  AddReview as AddReviewEvent,
  PhysicalShop
} from '../../generated/PhysicalShop/PhysicalShop';
import { Domain } from '../../generated/PhysicalShop/Domain';
import {
  PhysicalItem,
  PhysicalShopToken,
  User,
  Review
} from '../../generated/schema';
import { getTokenInfo } from '../utilities';

export function handleMintNft(event: MintNftEvent): void {
  let token = new PhysicalShopToken(event.params.tokenId.toString());

  token.domainId = event.params.domainId;
  token.tokenId = event.params.tokenId;
  token.upVote = BigInt.zero();
  token.downVote = BigInt.zero();

  let digitalContract = PhysicalShop.bind(event.address);
  let domainContract = Domain.bind(digitalContract.domain());

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
  let token = PhysicalShopToken.load(event.params.tokenId.toString());

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
  let token = PhysicalShopToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.tokenUri = event.params.tokenUri;
  token.save();
}

export function handleAddItem(event: AddItemEvent): void {
  let item = new PhysicalItem(event.params.itemId.toString());

  item.shopDetails = event.params.shopId.toString();
  item.category = event.params.category;
  item.subcategory = event.params.subcategory;
  item.price = event.params.price;
  item.quantity = event.params.quantity;
  item.metadata = event.params.metadata;
  item.itemName = event.params.itemName;
  item.status = 'ACTIVE';
  item.listedAt = event.block.timestamp;

  item.erc20Token = getTokenInfo(event.params.tokenaddress);

  item.save();
}

export function handleUpdateItem(event: UpdateItemEvent): void {}

export function handleRemoveItem(event: RemoveItemEvent): void {
  let item = new PhysicalItem(event.params.itemId.toString());

  if (!item) return;

  item.quantity = BigInt.zero();
  item.metadata = '';
  item.status = 'REMOVED';
  item.save();
}

export function handleAddReview(event: AddReviewEvent): void {
  let review = new Review(event.transaction.hash.toHexString());

  review.itemId = event.params.itemId.toString();
  review.shipment = event.params.shipmentId.toString();
  review.user = event.params.user;
  review.review = event.params.review;

  if (event.params.status == 'good') review.status = 'GOOD';
  else review.status = 'BAD';

  review.save();
}
