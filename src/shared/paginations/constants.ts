export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface ISort {
  [key: string]: Order;
}

export function getSort(value: any): ISort | null {
  if (value) {
    return Object.keys(value).reduce((acc: ISort, key: string) => {
      const orderType: Order = value[key].toUpperCase();
      // auto enum all order type
      if (Object.values(Order).includes(orderType)) {
        acc[key] = orderType;
      }
      return acc;
    }, {}) as ISort;
  }

  return null;
}
