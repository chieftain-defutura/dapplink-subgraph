import {
  CreateOrder as CreateOrderEvent,
  OrderStatus as OrderStatusEvent
} from '../../generated/Shipment/Shipment';
import {
  Shipment,
  PhysicalItem,
  PhysicalShopToken,
  User
} from '../../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleCreateOrder(event: CreateOrderEvent): void {
  let data = new Shipment(event.params.shipmentId.toString());

  data.itemId = event.params.itemId.toString();
  data.deliveryHash = event.params.deliveryHash;
  data.quantity = event.params.quantity;
  data.buyer = event.params.buyer;
  data.status = 'PREPARING';

  let item = PhysicalItem.load(event.params.itemId.toString());

  if (!item) return;
  item.quantity = item.quantity.minus(event.params.quantity);

  const shopToken = PhysicalShopToken.load(item.shopDetails);
  if (!shopToken) return;

  data.owner = shopToken.owner;
  item.save();

  data.save();

  let seller = User.load(shopToken.owner);
  if (seller) {
    seller.haveToSend.plus(BigInt.fromI32(1));
    seller.save();
  }

  let buyer = User.load(event.params.buyer.toHexString());
  if (buyer) {
    buyer.awaitingDelivery.plus(BigInt.fromI32(1));
    buyer.save();
  }
}

export function handleOrderStatus(event: OrderStatusEvent): void {
  let data = Shipment.load(event.params.shipmentId.toString());
  if (!data) return;

  if (event.params.status == 'CANCELLED') {
    let item = PhysicalItem.load(data.itemId.toString());
    if (!item) return;

    item.quantity = item.quantity.plus(data.quantity);
    item.save();

    data.quantity = BigInt.zero();
    data.status = 'CANCELLED';

    data.save();

    const shopToken = PhysicalShopToken.load(item.shopDetails);
    if (!shopToken) return;

    let seller = User.load(shopToken.owner);
    if (seller) {
      seller.haveToSend.minus(BigInt.fromI32(1));
      seller.save();
    }

    let buyer = User.load(data.buyer.toHexString());
    if (buyer) {
      buyer.awaitingDelivery.minus(BigInt.fromI32(1));
      buyer.save();
    }

    return;
  }

  if (event.params.status == 'DISPATCHED') {
    data.status = 'DISPATCHED';
    data.save();

    let item = PhysicalItem.load(data.itemId.toString());
    if (!item) return;

    const shopToken = PhysicalShopToken.load(item.shopDetails);
    if (!shopToken) return;

    shopToken.lastSale = event.params.shipmentId.toString();
    shopToken.save();

    let seller = User.load(shopToken.owner);
    if (seller) {
      seller.haveToSend.minus(BigInt.fromI32(1));
      seller.save();
    }

    let buyer = User.load(data.buyer.toHexString());
    if (buyer) {
      buyer.awaitingDelivery.minus(BigInt.fromI32(1));
      buyer.save();
    }

    return;
  }

  data.status = 'RECEIVED';
  data.save();
}
