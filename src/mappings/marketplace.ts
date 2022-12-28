import {
  PutOnAuction as PutOnAuctionEvent,
  PutOnFixedSale as PutOnFixedSaleEvent,
  RemoveSale as RemoveSaleEvent,
  FinishAuction as FinishAuctionEvent,
  FinishFixedSale as FinishFixedSaleEvent,
  PlaceBid as PlaceBidEvent,
  Marketplace
} from '../../generated/Marketplace/Marketplace';
import { Auction, FixedSale, Bidders } from '../../generated/schema';
import { getTokenInfo } from '../utilities';

export function handlePutOnFixedSale(event: PutOnFixedSaleEvent): void {
  let saleItem = new FixedSale(event.params.auctionId.toString());

  saleItem.auctionId = event.params.auctionId;
  saleItem.tokenId = event.params.tokenId;
  saleItem.owner = event.params.owner;
  saleItem.erc721TokenAddress = event.params.erc721TokenAddress;
  saleItem.price = event.params.price;
  saleItem.status = 'ACTIVE';
  saleItem.buyer = null;

  saleItem.erc20Token = getTokenInfo(event.params.tokenAddress);

  saleItem.save();
}

export function handlePutOnAuction(event: PutOnAuctionEvent): void {
  let saleItem = new Auction(event.params.auctionId.toString());

  saleItem.auctionId = event.params.auctionId;
  saleItem.tokenId = event.params.tokenId;
  saleItem.owner = event.params.owner;
  saleItem.erc721TokenAddress = event.params.erc721TokenAddress;
  saleItem.price = event.params.price;
  saleItem.startTime = event.block.timestamp;
  saleItem.endTime = event.params.endTime;
  saleItem.previousBids = [];
  saleItem.status = 'ACTIVE';

  saleItem.erc20Token = getTokenInfo(event.params.tokenAddress);

  saleItem.save();
}

export function handleFinishFixedSale(event: FinishFixedSaleEvent): void {
  let item = FixedSale.load(event.params.auctionId.toString());

  if (!item) return;

  item.buyer = event.params.buyer;
  item.status = 'FINISHED';

  item.save();
}

export function handleFinishAuction(event: FinishAuctionEvent): void {
  let item = Auction.load(event.params.auctionId.toString());

  if (!item) return;

  item.status = 'FINISHED';

  item.save();
}

export function handlePlaceBid(event: PlaceBidEvent): void {
  let item = Auction.load(event.params.auctionId.toString());

  if (!item) return;

  item.highestBid = event.params.amount;
  item.highestBidder = event.params.bidder;

  let bid = new Bidders(event.transaction.hash.toHexString());
  bid.bidder = event.params.bidder;
  bid.amount = event.params.amount;
  bid.save();

  let previousBids = item.previousBids;
  previousBids.push(bid.id);
  item.previousBids = previousBids;

  item.save();
}

export function handleRemoveSale(event: RemoveSaleEvent): void {
  let item = FixedSale.load(event.params.auctionId.toString());

  if (item) {
    item.status = 'CANCELLED';
    item.save();
    return;
  }

  let auctionItem = Auction.load(event.params.auctionId.toString());

  if (auctionItem) {
    auctionItem.status = 'CANCELLED';
    auctionItem.save();
    return;
  }
}
