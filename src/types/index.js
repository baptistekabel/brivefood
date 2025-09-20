// Types pour l'authentification
export const UserRole = {
  CUSTOMER: 'customer',
  RESTAURANT_ADMIN: 'restaurant_admin',
  DELIVERY: 'delivery'
};

// Types pour les commandes
export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  IN_DELIVERY: 'in_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const OrderMode = {
  DINE_IN: 'dine_in',
  TAKEOUT: 'takeout',
  DELIVERY: 'delivery'
};

// Types pour les paiements
export const PaymentMethod = {
  CARD: 'card',
  CASH: 'cash',
  DIGITAL_WALLET: 'digital_wallet'
};

export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Types pour les produits
export const ProductCategory = {
  FORMULES_PIZZA_DUO: 'formules_pizza_duo',
  FORMULES_PIZZA_TRIO: 'formules_pizza_trio',
  PIZZA: 'pizza',
  PATES: 'pates',
  LASAGNES: 'lasagnes',
  BURGER: 'burger',
  TACOS: 'tacos',
  SANDWICH_AMERICAIN: 'sandwich_americain',
  MENU_KIDS: 'menu_kids',
  TEX_MEX: 'tex_mex',
  FRITES_GARNIES: 'frites_garnies',
  SALADES: 'salades',
  PETIT_FAIM_BRUSCHETTA: 'petit_faim_bruschetta',
  PETITES_FAIM: 'petites_faim',
  BOWLS: 'bowls',
  DESSERTS: 'desserts',
  BOISSONS: 'boissons'
};

// Types pour les notifications
export const NotificationType = {
  ORDER_UPDATE: 'order_update',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
  DELIVERY_UPDATE: 'delivery_update'
};