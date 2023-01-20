import { BigInt } from '@graphprotocol/graph-ts';
import {
  AddItem as AddItemEvent,
  UpdateItem as UpdateItemEvent,
  UpdateTokenUri as UpdateTokenUriEvent,
  BuyItem as BuyItemEvent,
  RemoveItem as RemoveItemEvent,
  MintNft as MintNftEvent,
  Transfer as TransferEvent,
  DigitalShop
} from '../../generated/DigitalShop/DigitalShop';
import { Domain } from '../../generated/DigitalShop/Domain';
import {
  DigitalItem,
  DigitalShopToken,
  User,
  UserCollection
} from '../../generated/schema';
import { getTokenInfo } from '../utilities';

export function handleMintNft(event: MintNftEvent): void {
  let token = new DigitalShopToken(event.params.tokenId.toString());

  token.domainId = event.params.domainId;
  token.tokenId = event.params.tokenId;
  token.upVote = BigInt.zero();
  token.downVote = BigInt.zero();

  let digitalContract = DigitalShop.bind(event.address);
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
  let token = DigitalShopToken.load(event.params.tokenId.toString());

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
  let token = DigitalShopToken.load(event.params.tokenId.toString());

  if (!token) return;

  token.tokenUri = event.params.tokenUri;
  token.save();
}

export function handleAddItem(event: AddItemEvent): void {
  let item = new DigitalItem(event.params.itemId.toString());

  item.shopDetails = event.params.shopId.toString();
  item.category = event.params.category;
  item.subcategory = event.params.subcategory;
  item.fullproduct = event.params.fullproduct;
  item.price = event.params.price;
  item.metadata = event.params.metadata;
  item.itemName = event.params.itemName;
  item.status = 'ACTIVE';
  item.listedAt = event.block.timestamp;
  item.owner = [];

  item.erc20Token = getTokenInfo(event.params.tokenAddress);

  item.save();
}

export function handleUpdateItem(event: UpdateItemEvent): void {
  let item = DigitalItem.load(event.params.itemid.toString());

  if (!item) return;

  item.category = event.params.category;
  item.subcategory = event.params.subcategory;
  item.fullproduct = event.params.fullproduct;
  item.price = event.params.price;
  item.metadata = event.params.metadata;

  item.save();
}

export function handleRemoveItem(event: RemoveItemEvent): void {
  let item = DigitalItem.load(event.params.itemId.toString());

  if (!item) return;

  item.fullproduct = '';
  item.metadata = '';
  item.status = 'REMOVED';
  item.save();
}

export function handleBuyItem(event: BuyItemEvent): void {
  let item = DigitalItem.load(event.params.itemId.toString());

  if (!item) return;

  item.owner.push(event.params.buyer.toHexString());
  item.status = 'PURCHASED';
  item.save();

  let shop = DigitalShopToken.load(item.shopDetails);

  if (shop) {
    shop.lastSale = event.params.itemId.toString();
    shop.save();
  }

  let id = item.category + '-' + event.params.buyer.toHexString();

  let collection = UserCollection.load(id);

  if (!collection) {
    collection = new UserCollection(id);
    collection.user = event.params.buyer;
    collection.category = item.category;
    collection.totalItems = BigInt.fromI32(1);
    collection.save();
    return;
  }

  collection.totalItems = collection.totalItems.plus(BigInt.fromI32(1));
  collection.save();
}
