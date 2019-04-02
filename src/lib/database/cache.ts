import { getItem, setItem } from 'localforage';

function cachePrefix(key: string) {
  return 'sheetbasecache_' + key;
}

export async function setCache<Data>(
  key: string,
  data: Data,
  expiration?: number,
) {
  key = cachePrefix(key); // add prefix
  expiration = !!expiration ? expiration : 1; // default to 10 minutes
  await setItem<number>(key + '_expiration', new Date().getTime() + (expiration * 60000));
  return await setItem<Data>(key, data);
}

export async function getCache<Data>(key: string, always = false) {
  key = cachePrefix(key); // add prefix
  let expired = true;
  const cachedData = await getItem<Data>(key);
  if (!!cachedData) {
    const cacheExpiration = await getItem<number>(key + '_expiration');
    if (!cacheExpiration || cacheExpiration > new Date().getTime()) {
      expired = false;
    }
  }
  if (always) {
    return { data: cachedData, expired };
  } else {
    return expired ? null : cachedData;
  }
}

export async function getCacheAndRefresh<Data>(
  key: string,
  expiration?: number,
  refresher?: () => Promise<Data>,
) {
  let data: Data = null;
  if (expiration === 0) {
    data = await refresher(); // always fresh
  } else {
    // get cached
    const { data: cachedData, expired } = await getCache<Data>(key, true) as {
      data: Data; expired: boolean;
    };
    if (!expired) {
      data = cachedData;
    }
    // no cached or expired
    if (!data && !!refresher) {
      try {
        data = await refresher();
      } catch (error) {
        // error
      }
      if (!!data) {
        await setCache(key, data, expiration);
      } else {
        data = cachedData; // use expired value anyway
      }
    }
  }
  // return data
  return data;
}