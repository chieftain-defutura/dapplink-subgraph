import {
  AddItem as AddItemEvent,
  AddReview as AddReviewEvent,
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  MintNFT as MintNFTEvent,
  RemoveItem as RemoveItemEvent,
  Transfer as TransferEvent,
  UpdateItem as UpdateItemEvent
} from "../generated/DigitalShop/DigitalShop"
import {
  AddItem,
  AddReview,
  Approval,
  ApprovalForAll,
  MintNFT,
  RemoveItem,
  Transfer,
  UpdateItem
} from "../generated/schema"

export function handleAddItem(event: AddItemEvent): void {
  let entity = new AddItem(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.shopId = event.params.shopId
  entity.preview = event.params.preview
  entity.fullproduct = event.params.fullproduct
  entity.price = event.params.price
  entity.tokenaddress = event.params.tokenaddress
  entity.productDetails = event.params.productDetails
  entity.save()
}

export function handleAddReview(event: AddReviewEvent): void {
  let entity = new AddReview(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenAddress = event.params.tokenAddress
  entity.review = event.params.review
  entity.itemid = event.params.itemid
  entity.save()
}

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId
  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved
  entity.save()
}

export function handleMintNFT(event: MintNFTEvent): void {
  let entity = new MintNFT(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.token = event.params.token
  entity.value = event.params.value
  entity.save()
}

export function handleRemoveItem(event: RemoveItemEvent): void {
  let entity = new RemoveItem(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.index = event.params.index
  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId
  entity.save()
}

export function handleUpdateItem(event: UpdateItemEvent): void {
  let entity = new UpdateItem(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.itemid = event.params.itemid
  entity.preview = event.params.preview
  entity.fullproduct = event.params.fullproduct
  entity.price = event.params.price
  entity.tokenAddress = event.params.tokenAddress
  entity.productDetails = event.params.productDetails
  entity.save()
}
