import { Order } from '../enums/order.enum';

export interface ISort {
  [key: string]: Order;
}

export function getSort(value: unknown): ISort | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return Object.keys(value).reduce((acc: ISort, key: string) => {
    const orderValue = (value as Record<string, unknown>)[key];
    if (typeof orderValue === 'string') {
      const orderType = orderValue.toUpperCase() as Order;
      if (Object.values(Order).includes(orderType)) {
        acc[key] = orderType;
      }
    }
    return acc;
  }, {});
}
