import Constants from 'expo-constants';

const DEFAULT_CURRENCY = 'BDT';

type CartLike = {
  id?: string;
  items?: any[];
  subtotal?: number;
  total_amount?: number;
  coupon_discount?: number;
};

type PurchasePayloadInput = {
  cart?: CartLike | null;
  dropshippingItems?: any[];
  total?: number;
  deliveryCharge?: number;
  orderId?: string;
  paymentMethod?: string;
  shippingArea?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
};

const toNumber = (value: unknown, fallback = 0): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const roundMoney = (value: unknown): number => Number(toNumber(value).toFixed(2));

const compact = <T extends Record<string, any>>(value: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== null && item !== ''
    )
  ) as Partial<T>;

const createEventId = () =>
  `purchase-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getCartItemId = (item: any): string | undefined => {
  const id =
    item?.variant?.sku ||
    item?.variant?.id ||
    item?.variant_id ||
    item?.product_id ||
    item?.product?.id ||
    item?.id;

  return id ? String(id) : undefined;
};

const getCartItemLineTotal = (item: any): number => {
  const discountedTotal = toNumber(item?.discounted_price);
  if (discountedTotal > 0) return discountedTotal;

  const totalPrice = toNumber(item?.total_price);
  if (totalPrice > 0) return totalPrice;

  const quantity = Math.max(toNumber(item?.quantity, 1), 1);
  const unitPrice = toNumber(
    item?.variant?.final_price ||
      item?.variant?.discounted_price ||
      item?.variant?.price ||
      item?.price
  );

  return unitPrice * quantity;
};

const mapCartItem = (item: any) => {
  const id = getCartItemId(item);
  if (!id) return null;

  const quantity = Math.max(toNumber(item?.quantity, 1), 1);

  return {
    id,
    quantity,
    item_price: roundMoney(getCartItemLineTotal(item) / quantity),
  };
};

const mapDropshippingItem = (item: any) => {
  const id = item?.droploo_product_id || item?.productId || item?.id;
  if (!id) return null;

  const quantity = Math.max(toNumber(item?.quantity, 1), 1);

  return {
    id: String(id),
    quantity,
    item_price: roundMoney(item?.unit_price || item?.price),
  };
};

const getMetaPurchaseEndpoint = (): string => {
  const extra = Constants.expoConfig?.extra || {};
  return extra.metaPurchaseEndpoint || '';
};

export const buildMetaPurchasePayload = ({
  cart,
  dropshippingItems = [],
  total,
  deliveryCharge,
  orderId,
  paymentMethod,
  shippingArea,
  customer,
}: PurchasePayloadInput) => {
  const contents = [
    ...(cart?.items || []).map(mapCartItem),
    ...dropshippingItems.map(mapDropshippingItem),
  ].filter(Boolean) as Array<{ id: string; quantity: number; item_price: number }>;

  const contentIds = contents.map((item) => item.id);
  const numItems = contents.reduce((sum, item) => sum + item.quantity, 0);
  const calculatedTotal = contents.reduce(
    (sum, item) => sum + item.item_price * item.quantity,
    0
  );
  const eventId = createEventId();
  const customData = compact({
    value: roundMoney(total ?? calculatedTotal),
    currency: DEFAULT_CURRENCY,
    contents,
    content_ids: contentIds,
    content_type: 'product',
    num_items: numItems,
    delivery_charge: roundMoney(deliveryCharge),
    order_id: orderId,
  });

  return compact({
    eventName: 'Purchase',
    eventId,
    params: customData,
    event_name: 'Purchase',
    event_id: eventId,
    action_source: 'app',
    event_source: 'sobarbazar-mobile-app',
    cart_id: cart?.id,
    order_id: orderId,
    payment_method: paymentMethod,
    shipping_area: shippingArea,
    customer: compact({
      name: customer?.name,
      email: customer?.email,
      phone: customer?.phone,
      address: customer?.address,
    }),
    custom_data: customData,
  });
};

export const sendMetaPurchaseEvent = async (
  payload: ReturnType<typeof buildMetaPurchasePayload>,
  token?: string | null
): Promise<boolean> => {
  const endpoint = getMetaPurchaseEndpoint();

  if (!endpoint) {
    return false;
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      __DEV__ &&
        console.log('Meta Purchase CAPI endpoint failed:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    __DEV__ && console.log('Meta Purchase CAPI request error:', error);
    return false;
  }
};
