import { client } from '$services/redis';

export const incrementView = async (itemId: string, userId: string) => {
  return client.incrementView(itemId, userId);
}

// import { itemsKey, itemsByViewsKey, itemsViewsKey } from '$services/keys';

// export const incrementView = async (itemId: string, userId: string) => {
//   const inserted = await client.pfAdd(itemsViewsKey(itemId), userId);

//   if (inserted) {
//     return Promise.all([
//       client.hIncrBy(itemsKey(itemId), 'views', 1),
//       client.zIncrBy(itemsByViewsKey(), 1, itemId)
//     ]);
//   }  
// };

// Keys  I need to access
// 1) itemsViewsKey 
// 2) itemsKey -> items#alsdfase
// 3) itemsByViewKey


// Arguments I need to accept
// 1) itemId
// 2) userId