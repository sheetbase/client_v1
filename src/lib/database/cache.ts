import { getItem, setItem } from 'localforage';

export async function setCache<Data>(
  key: string,
  data: Data,
  expiration?: number,
) {
  expiration = !!expiration ? expiration : 600; // default to 10 minutes
  await setItem<number>(key + '_expiration', new Date().getTime() + (expiration * 1000));
  return await setItem<Data>(key, data);
}

export async function getCache<Data>(key: string) {
  let data: Data = null;
  const cachedData = await getItem<Data>(key);
  if (!!cachedData) {
    const cacheExpiration = await getItem<number>(key + '_expiration');
    if (!cacheExpiration || cacheExpiration > new Date().getTime()) {
      data = cachedData;
    }
  }
  return data;
}

export async function getCacheAndRefresh<Data>(
  key: string,
  expiration?: number,
  refresher?: () => Promise<Data>,
) {
  let data: Data = null;
  if (expiration !== 0) {
    // get cached
    const cachedData = await getCache<Data>(key);
    if (!!cachedData) {
      data = cachedData;
    }
    // no cached or expired
    if (!data && !!refresher) {
      let freshData: any;
      try {
        freshData = await refresher();
      } catch (error) {
        // error
      }
      if (!!freshData) {
        data = freshData;
        await setCache(key, freshData, expiration);
      } else {
        data = cachedData; // use expired value anyway
      }
    }
  } else {
    // no cache
    data = await refresher();
  }
  // return data
  return data;
}