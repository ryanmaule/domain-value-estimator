import type { ServiceFactory } from './types';
import WebContainerServiceFactory from '../webcontainer/WebContainerServiceFactory';

const isWebContainer = import.meta.env.VITE_WEBCONTAINER === 'true';

let serviceFactory: ServiceFactory | null = null;

export function getServiceFactory(): ServiceFactory {
  if (!serviceFactory) {
    if (!isWebContainer) {
      throw new Error('Only WebContainer environment is currently supported');
    }
    serviceFactory = WebContainerServiceFactory.getInstance();
  }
  return serviceFactory;
}