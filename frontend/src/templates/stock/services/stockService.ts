import * as stockApi from '../../../lib/api/stock';
import { 
  Product, 
  ProductCreateInput, 
  ProductUpdateInput,
  StockLocation,
  StockLocationCreateInput,
  StockLocationUpdateInput,
  StockMovement,
  StockMovementCreateInput,
  StockMovementUpdateInput,
  RequestParams
} from '../types';

export const getProducts = async (params: RequestParams = {}) => {
  return await stockApi.getProducts(params);
};

export const getProductById = async (id: string) => {
  return await stockApi.getProductById(id);
};

export const getProductByBarcode = async (barcode: string) => {
  return await stockApi.getProductByBarcode(barcode);
};

export const getProductBySku = async (sku: string) => {
  return await stockApi.getProductBySku(sku);
};

export const getLowStockProducts = async (params: RequestParams = {}) => {
  return await stockApi.getLowStockProducts(params);
};

export const getProductCategories = async () => {
  return await stockApi.getProductCategories();
};

export const getProductBrands = async () => {
  return await stockApi.getProductBrands();
};

export const createProduct = async (product: ProductCreateInput) => {
  return await stockApi.createProduct(product);
};

export const updateProduct = async (id: string, product: ProductUpdateInput) => {
  return await stockApi.updateProduct(id, product);
};

export const toggleProductStatus = async (id: string) => {
  return await stockApi.toggleProductStatus(id);
};

export const getStockLocations = async (params: RequestParams = {}) => {
  return await stockApi.getStockLocations(params);
};

export const getStockLocationById = async (id: string) => {
  return await stockApi.getStockLocationById(id);
};

export const createStockLocation = async (location: StockLocationCreateInput) => {
  return await stockApi.createStockLocation(location);
};

export const updateStockLocation = async (id: string, location: StockLocationUpdateInput) => {
  return await stockApi.updateStockLocation(id, location);
};

export const toggleStockLocationStatus = async (id: string) => {
  return await stockApi.toggleStockLocationStatus(id);
};

export const getStockMovements = async (params: RequestParams = {}) => {
  return await stockApi.getStockMovements(params);
};

export const getStockMovementById = async (id: string) => {
  return await stockApi.getStockMovementById(id);
};

export const createStockMovement = async (movement: StockMovementCreateInput) => {
  return await stockApi.createStockMovement(movement);
};

export const updateStockMovement = async (id: string, movement: StockMovementUpdateInput) => {
  return await stockApi.updateStockMovement(id, movement);
};

export const getStockMovementTypes = async () => {
  return await stockApi.getStockMovementTypes();
};