import { orderBy as _orderBy } from '../utils';

import {
  Filter,
  AdvancedFilter,
  ShorthandQuery,
  SingleQuery,
  MultiQuery,
  DataSegment,
  ListingFilter,
} from './types';

export function buildAdvancedFilter<Item>(filter: Filter<Item>) {
  let advancedFilter: AdvancedFilter<Item>;
  // advanced filter
  if (filter instanceof Function) {
    advancedFilter = filter;
  } else {
    // multi query
    if (!!filter['and'] || !!filter['or']) {
      advancedFilter = convertMultiQueryToAdvancedFilter(filter as MultiQuery);
    }
    // ShorthandQuery or SingleQuery
    else {
      if (!filter['where']) { // shorthand
        filter = convertShorthandQueryToSingleQuery(filter);
      }
      advancedFilter = convertSingleQueryToAdvancedFilter(filter as SingleQuery);
    }
  }
  return advancedFilter;
}

export function convertShorthandQueryToSingleQuery(shorthandQuery: ShorthandQuery) {
  const where = Object.keys(shorthandQuery)[0];
  const equal = shorthandQuery[where];
  return { where, equal } as SingleQuery;
}

export function convertSingleQueryToAdvancedFilter<Item>(singleQuery: SingleQuery) {
  let advancedFilter: AdvancedFilter<Item>;
  // build advanced filter
  const {
    where,
    equal,
    exists,
    contains,
    lt, lte,
    gt, gte,
    childExists,
    childEqual,
  } = singleQuery;
  if (!!equal) { // where/equal
    advancedFilter = item => (!!item[where] && item[where] === equal);
  } else if (typeof exists === 'boolean') { // where/exists/not exists
    advancedFilter = item => (!!exists ? !!item[where] : !item[where]);
  } else if (!!contains) { // where/contains
    advancedFilter = item => (
      typeof item[where] === 'string' &&
      item[where].indexOf(contains) > -1
    );
  } else if (!!lt) { // where/less than
    advancedFilter = item => (
      typeof item[where] === 'number' &&
      item[where] < lt
    );
  } else if (!!lte) { // where/less than or equal
    advancedFilter = item => (
      typeof item[where] === 'number' &&
      item[where] <= lte
    );
  } else if (!!gt) { // where/greater than
    advancedFilter = item => (
      typeof item[where] === 'number' &&
      item[where] > gt
    );
  } else if (!!gte) { // where/greater than or equal
    advancedFilter = item => (
      typeof item[where] === 'number' &&
      item[where] >= gte
    );
  } else if (!!childExists) { // where/child exists, not exists
    const notExists = childExists.substr(0, 1) === '!';
    const child = notExists ? childExists.replace('!', '') : childExists;
    advancedFilter = item => {
      if (!item[where] && notExists) {
        return true; // child always not exists
      } else if (!!item[where]) {
        if (item[where] instanceof Array) {
          return notExists ?
            (item[where].indexOf(child) < 0) :
            (item[where].indexOf(child) > -1);
        } else if (item[where] instanceof Object) {
          return notExists ? !item[where][child] : !!item[where][child];
        }
      }
      return false;
    };
  } else if (!!childEqual) { // where/child equal, not equal
    let notEqual: boolean;
    let childKey: string;
    let childValue: any;
    if (childEqual.indexOf('!=') > -1) {
      notEqual = true;
      const keyValue = childEqual.split('!=').filter(Boolean);
      childKey = keyValue[0];
      childValue = keyValue[1];
    } else {
      const keyValue = childEqual.split('=').filter(Boolean);
      childKey = keyValue[0];
      childValue = keyValue[1];
    }
    if (!isNaN(childValue)) {
      childValue = Number(childValue);
    }
    advancedFilter = item => {
      if (!item[where] && notEqual) {
        return true; // always not equal
      } else if (!!item[where]) {
        return  (
          item[where] instanceof Object &&
          (notEqual ?
            (!item[where][childKey] || item[where][childKey] !== childValue) :
            (!!item[where][childKey] && item[where][childKey] === childValue)
          )
        );
      }
      return false;
    };
  }
  return advancedFilter;
}

export function convertMultiQueryToAdvancedFilter<Item>(multiQuery: MultiQuery) {
  const { and = [], or = [] } = multiQuery;
  // and filters
  const andFilters: Array<AdvancedFilter<Item>> = [];
  if (!!and.length) {
    for (const query of and) {
      andFilters.push(
        convertSingleQueryToAdvancedFilter(query),
      );
    }
  }
  // or filters
  const orFilters: Array<AdvancedFilter<Item>> = [];
  if (!!or.length) {
    for (const query of or) {
      orFilters.push(
        convertSingleQueryToAdvancedFilter(query),
      );
    }
  }
  const advancedFilter: AdvancedFilter<Item> = item => {
    let andMatched = true;
    for (const advancedFilter of andFilters) {
      if (!advancedFilter(item)) {
        andMatched = false;
        break;
      }
    }
    let orMatched = false;
    for (const advancedFilter of orFilters) {
      if (advancedFilter(item)) {
        orMatched = true;
        break;
      }
    }
    return andMatched || orMatched;
  };
  return advancedFilter;
}

export function buildSegmentFilter<Item>(segment: DataSegment) {
  const segmentFilter: AdvancedFilter<Item> = item => {
    let result = false;
    const segmentArr = Object.keys(segment || {});
    if (!segmentArr.length) {
      result = true;
    }
    // from 1-3
    else if (segmentArr.length < 4) {
      const [ first, second, third ] = segmentArr;
      result = (
        // 1st
        (
          !item[first] ||
          item[first] === segment[first]
        ) &&
        // 2nd
        (
          !second ||
          !item[second] ||
          item[second] === segment[second]
        ) &&
        // 3rd
        (
          !third ||
          !item[third] ||
          item[third] === segment[third]
        )
      );
    }
    // over 3
    else {
      result = true; // assumpt
      for (let i = 0; i < segmentArr.length; i++) {
        const seg = segmentArr[i];
        // any not matched
        if (
          !!item[seg] &&
          item[seg] !== segment[seg]
        ) {
          result = false;
          break;
        }
      }
    }
    return result;
  };
  return segmentFilter;
}

export function applyListingFilter<Item>(items: Item[], listingFilter?: ListingFilter) {
  // ordering
  let { order, orderBy } = listingFilter;
  if (!orderBy && !!order) {
    orderBy = ['#'];
  }
  if (!!orderBy) {
    orderBy = (typeof orderBy === 'string') ? [orderBy] : orderBy;
    if (!!order) {
      order = (typeof order === 'string') ? [order] : order;
    } else {
      order = new Array(orderBy.length).fill('asc');
    }
    items = _orderBy(items, orderBy, order);
  }
  // limitation
  const { limit = 0, offset = 0 } = listingFilter;
  if (!!offset) {
    if (offset < 0) {
      items = items.slice(0, items.length + offset);
    } else {
      items = items.slice(offset, items.length);
    }
  }
  if (!!limit) {
    if (limit < 0) {
      items = items.slice(items.length + limit, items.length);
    } else {
      items = items.slice(0, limit);
    }
  }
  return items;
}