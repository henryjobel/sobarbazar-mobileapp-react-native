import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.hetdcl.com';
const PRODUCT_FALLBACK_IMAGE = 'https://via.placeholder.com/120/299e60/FFFFFF?text=Product';

const asRecord = (value: unknown): Record<string, any> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : null;

const firstText = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
};

const firstNumber = (...values: unknown[]): number => {
  for (const value of values) {
    const numberValue = typeof value === 'string' ? Number(value) : value;
    if (typeof numberValue === 'number' && Number.isFinite(numberValue)) {
      return numberValue;
    }
  }
  return 0;
};

export const normalizeCartImageUrl = (url?: string | null, fallback = PRODUCT_FALLBACK_IMAGE): string => {
  if (!url) return fallback;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getProductImageFromRecord = (product: Record<string, any> | null): string | undefined => {
  if (!product) return undefined;

  const imageFromArray =
    Array.isArray(product.images) && product.images.length > 0
      ? firstText(product.images[0]?.image, product.images[0]?.image_url, product.images[0]?.url)
      : undefined;

  return firstText(
    product.image,
    product.feature_image,
    product.thumbnail,
    product.image_url,
    product.product_image,
    product.product_image_url,
    imageFromArray,
  );
};

export const getCartItemImage = (item: any, fallback = PRODUCT_FALLBACK_IMAGE): string => {
  const product = asRecord(item?.product);
  const variant = asRecord(item?.variant);
  const variantProduct = asRecord(variant?.product);

  const imageUrl = firstText(
    getProductImageFromRecord(product),
    getProductImageFromRecord(asRecord(item?.product_data)),
    getProductImageFromRecord(asRecord(item?.product_detail)),
    getProductImageFromRecord(variantProduct),
    item?.product_image,
    item?.product_image_url,
    item?.image,
    item?.image_url,
    item?.thumbnail,
    variant?.image,
    variant?.image_url,
    variant?.product_image,
    variant?.product_image_url,
  );

  return normalizeCartImageUrl(imageUrl, fallback);
};

export const getCartItemName = (item: any): string => {
  const product = asRecord(item?.product);
  const variant = asRecord(item?.variant);
  const variantProduct = asRecord(variant?.product);

  return (
    firstText(
      product?.name,
      product?.title,
      asRecord(item?.product_data)?.name,
      asRecord(item?.product_detail)?.name,
      variantProduct?.name,
      variantProduct?.title,
      variant?.product_name,
      item?.product_name,
      item?.product_title,
      item?.name,
      item?.title,
      variant?.name,
    ) || 'Product'
  );
};

export const getCartItemUnitPrice = (item: any): number => {
  const variant = asRecord(item?.variant);

  return firstNumber(
    variant?.final_price,
    variant?.price,
    item?.final_unit_price,
    item?.unit_price,
    item?.price,
    item?.discounted_price,
  );
};

export const getCartItemTotalPrice = (item: any): number => {
  const quantity = firstNumber(item?.quantity) || 1;

  return firstNumber(
    item?.total_price,
    item?.subtotal,
    item?.net_price,
    getCartItemUnitPrice(item) * quantity,
  );
};

export const formatCartVariantAttributes = (attributes: any): string => {
  if (!attributes) return '';

  if (typeof attributes === 'object' && !Array.isArray(attributes)) {
    return Object.entries(attributes)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  if (typeof attributes !== 'string') {
    return String(attributes).replace(/[{}'"\[\]]/g, '').trim();
  }

  if (!attributes.includes('{') || !attributes.includes(':')) {
    return attributes.trim();
  }

  try {
    const parsed = JSON.parse(
      attributes
        .replace(/'/g, '"')
        .replace(/None/g, 'null')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false'),
    );

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
  } catch {
    // Fall through to a readable plain-text cleanup.
  }

  return attributes
    .replace(/[{}'"\[\]]/g, '')
    .replace(/:/g, ': ')
    .replace(/\s+/g, ' ')
    .trim();
};
