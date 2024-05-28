import { DateTime } from 'luxon';

import type { CreateBidAttrs, Bid } from '$services/types';
import { bidHistoryKey, itemsKey, itemsByPriceKey } from '$services/keys';
import { client, withLock } from '$services/redis';
import { getItem } from './items';

const pause = (duration = 10) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};

export const createBid = async (attrs: CreateBidAttrs) => {
  return withLock(attrs.itemId, async (lockedClient: typeof client, signal: any) => {
    // 1) Fetching the item
    // 2) Doing validation
    // 3) Writing some data
    const item = await getItem(attrs.itemId);

    // await pause(5000);

    if (!item) throw new Error('Item does not exist');

    if (item.price >= attrs.amount) throw new Error('Bid too low');

    if (item.endingAt.diff(DateTime.now()).toMillis() < 0) throw new Error('Item closed to bidding');

    // if (signal.expired) throw new Error('Lock expired, cannot write anymore data');

    const serialized = serializeHistory(attrs.amount, attrs.createdAt.toMillis());
    Promise.all([
      lockedClient.rPush(bidHistoryKey(attrs.itemId), serialized),
      lockedClient.hSet(itemsKey(item.id), {
        bids: item.bids + 1,
        price: attrs.amount,
        highestBidUserId: attrs.userId
      }),
      lockedClient.zAdd(itemsByPriceKey(), {
        value: item.id,
        score: attrs.amount
      })
    ]);
  });
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;

	const range = await client.lRange(bidHistoryKey(itemId), startIndex, endIndex);

	return range.map((bid) => deserializeHistory(bid));
};

const serializeHistory = (amount: number, createdAt: number) => {
	return `${amount}:${createdAt}`;
};

const deserializeHistory = (stored: string) => {
	const [amount, createdAt] = stored.split(':');

	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt))
	};
};
