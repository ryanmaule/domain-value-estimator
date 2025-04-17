import type { ServiceFactory } from './types';
import ProdServiceFactory from './ProdServiceFactory'; // Assuming you'll name it this

let serviceFactory: ServiceFactory | null = null;

export function getServiceFactory(): ServiceFactory {
  if (!serviceFactory) {
    serviceFactory = ProdServiceFactory.getInstance();
  }
  return serviceFactory;
}