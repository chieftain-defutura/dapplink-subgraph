import { Address } from '@graphprotocol/graph-ts';
import { ERC20 } from '../generated/DigitalShop/ERC20';
import { Token } from '../generated/schema';

export const getTokenInfo = (tokenAddress: Address): string => {
  let token = Token.load(tokenAddress.toHexString());

  if (!token) {
    token = new Token(tokenAddress.toHexString());

    let tokenContract = ERC20.bind(tokenAddress);

    token.name = tokenContract.name();
    token.symbol = tokenContract.symbol();
    token.decimals = tokenContract.decimals().toString();

    token.save();
    return token.id;
  }

  return token.id;
};
