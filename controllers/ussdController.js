// OPTIMIZED USSD WALLET CONTROLLER FOR AFRICA'S TALKING
// Performance-first design with wallet integration

const sessions = new Map();
const SESSION_TIMEOUT = 180000; // 3 minutes (Africa's Talking standard)

// PERFORMANCE: Aggressive session cleanup - prevents memory bloat
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
    }
  }
}, 60000); // Every minute for better memory management

// OPTIMIZED DATA STRUCTURE - All lookups are O(1) for USSD speed requirements
const MZANSI_DATA = {
  // User credentials - Map for instant authentication
  users: new Map([
    ["1234567890", "123"],
    ["0987654321", "456"],
    ["5555555555", "123"],
    ["1111111111", "123"],
    ["0105305763085", "013290"],
  ]),

  // WALLET SYSTEM - Replaces separate account/airtime balances
  wallets: new Map([
    ["1234567890", { balance: 850.75, lastUpdated: Date.now() }],
    ["0987654321", { balance: 1250.3, lastUpdated: Date.now() }],
    ["5555555555", { balance: 650.5, lastUpdated: Date.now() }],
    ["1111111111", { balance: 900.0, lastUpdated: Date.now() }],
    ["0105305763085", { balance: 1500.25, lastUpdated: Date.now() }],
  ]),

  // Airtime balances - Source for wallet conversion
  airtimeBalances: new Map([
    ["1234567890", 120.5],
    ["0987654321", 85.3],
    ["5555555555", 45.75],
    ["1111111111", 200.0],
    ["0105305763085", 78.25],
  ]),

  // CONVERSION RATES - Optimized for quick calculation
  conversionRate: 0.95, // 95% conversion rate (5% fee)
  minConversion: 10.0, // Minimum R10 conversion
  maxConversion: 500.0, // Maximum R500 per transaction

  // Pre-computed delivery data for instant access
  deliveryAddresses: new Map([
    ["1234567890", "123 Main Street, Soweto, Johannesburg"],
    ["0987654321", "456 Oak Avenue, Sandton, Johannesburg"],
    ["5555555555", "789 Pine Road, Kempton Park, Gauteng"],
    ["1111111111", "321 Elm Street, Roodepoort, Johannesburg"],
    ["0105305763085", "654 Maple Drive, Midrand, Gauteng"],
  ]),

  // Pickup points by area - Fast string-based lookup
  pickupPoints: new Map([
    ["soweto", "Shoprite Pickup Point, Soweto Mall, Protea Glen"],
    ["sandton", "Pick n Pay Pickup, Sandton City Shopping Centre"],
    ["kempton", "Checkers Pickup Point, Kempton Square Mall"],
    ["roodepoort", "Spar Pickup Point, Clearwater Mall"],
    ["midrand", "Woolworths Pickup, Mall of Africa"],
    ["default", "Shoprite Pickup Point, Soweto Mall"],
  ]),

  // Store data - Optimized for iteration speed
  stores: [
    { id: 1, name: "Yusuf's Tech Stop\n - Electronics" },
    { id: 2, name: "Nomsa's Produce\n - Groceries" },
    { id: 3, name: "Zanele's Craft Market\n - Fashion" },
  ],

  departments: {
    1: [
      { id: 1, name: "Electronics" },
      { id: 2, name: "Accessories" },
    ],
    2: [
      { id: 3, name: "Groceries" },
      { id: 4, name: "Fresh Items" },
    ],
    3: [
      { id: 5, name: "Clothing" },
      { id: 6, name: "Shoes" },
    ],
  },

  products: {
    1: [
      { id: 1, name: "Samsung Phone", price: 5000 },
      { id: 2, name: "HP Laptop", price: 8500 },
      { id: 3, name: "Headphones", price: 1200 },
    ],
    2: [
      { id: 4, name: "Phone Case", price: 150 },
      { id: 5, name: "USB Cable", price: 80 },
      { id: 6, name: "Power Bank", price: 450 },
    ],
    3: [
      { id: 7, name: "Bread", price: 25 },
      { id: 8, name: "Milk 2L", price: 35 },
      { id: 9, name: "Rice 5kg", price: 120 },
    ],
    4: [
      { id: 10, name: "Bananas 1kg", price: 40 },
      { id: 11, name: "Apples 1kg", price: 60 },
      { id: 12, name: "Potatoes 2kg", price: 45 },
    ],
    5: [
      { id: 13, name: "T-Shirt", price: 180 },
      { id: 14, name: "Jeans", price: 350 },
      { id: 15, name: "Jacket", price: 450 },
    ],
    6: [
      { id: 16, name: "Sneakers", price: 800 },
      { id: 17, name: "Sandals", price: 200 },
      { id: 18, name: "Boots", price: 650 },
    ],
  },
};

// PERFORMANCE: Session management optimized for Africa's Talking
function getSession(sessionId) {
  let session = sessions.get(sessionId);

  if (!session) {
    // Minimal session object - faster creation, less memory
    session = {
      step: "welcome",
      userId: null,
      authenticated: false,
      selectedStore: null,
      selectedDepartment: null,
      selectedProduct: null,
      cart: [], // Single cart using wallet payments only
      tempData: {},
      lastActivity: Date.now(),
      created: Date.now(),
    };
    sessions.set(sessionId, session);
  } else {
    // CRITICAL: Update activity timestamp to prevent premature cleanup
    session.lastActivity = Date.now();
  }

  return session;
}

// PERFORMANCE: Batch session updates to reduce object operations
function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId);
  if (session) {
    Object.assign(session, updates, { lastActivity: Date.now() });
  }
}

// VALIDATION: Fast integer validation for USSD inputs
function isValidOption(input, min, max) {
  const num = parseInt(input, 10);
  return num >= min && num <= max && !isNaN(num);
}

// AUTHENTICATION: O(1) user authentication
function authenticateUser(userId, password) {
  return MZANSI_DATA.users.get(userId) === password;
}

// WALLET OPERATIONS - Core wallet functionality
function getWalletBalance(userId) {
  const wallet = MZANSI_DATA.wallets.get(userId);
  return wallet ? wallet.balance : 0;
}

function updateWalletBalance(userId, newBalance) {
  const wallet = MZANSI_DATA.wallets.get(userId);
  if (wallet) {
    wallet.balance = newBalance;
    wallet.lastUpdated = Date.now();
    return true;
  }
  return false;
}

function getAirtimeBalance(userId) {
  return MZANSI_DATA.airtimeBalances.get(userId) || 0;
}

// AIRTIME TO WALLET CONVERSION
function convertAirtimeToWallet(userId, airtimeAmount) {
  const currentAirtime = getAirtimeBalance(userId);
  const currentWallet = getWalletBalance(userId);

  // Validation checks
  if (airtimeAmount < MZANSI_DATA.minConversion)
    return { success: false, error: "Minimum conversion is R10" };
  if (airtimeAmount > MZANSI_DATA.maxConversion)
    return { success: false, error: "Maximum conversion is R500" };
  if (airtimeAmount > currentAirtime)
    return { success: false, error: "Insufficient airtime balance" };

  // Calculate conversion
  const walletAmount = airtimeAmount * MZANSI_DATA.conversionRate;
  const fee = airtimeAmount * (1 - MZANSI_DATA.conversionRate);

  // Update balances
  MZANSI_DATA.airtimeBalances.set(userId, currentAirtime - airtimeAmount);
  updateWalletBalance(userId, currentWallet + walletAmount);

  return {
    success: true,
    airtimeDeducted: airtimeAmount,
    walletAdded: walletAmount,
    fee: fee,
    newWalletBalance: currentWallet + walletAmount,
  };
}

// ADDRESS LOOKUP - Pre-computed for speed
function getDeliveryAddress(userId) {
  return MZANSI_DATA.deliveryAddresses.get(userId) || "123 Main Street, Soweto";
}

// PICKUP POINT - Fast area detection without regex
function getPickupPoint(userId) {
  let area = "default";
  if (userId.startsWith("098")) area = "sandton";
  else if (userId.startsWith("555")) area = "kempton";
  else if (userId.startsWith("111")) area = "roodepoort";
  else if (userId.includes("076")) area = "midrand";
  else area = "soweto";

  return (
    MZANSI_DATA.pickupPoints.get(area) ||
    MZANSI_DATA.pickupPoints.get("default")
  );
}

// CART OPERATIONS - Simplified for wallet-only payments
function addToCart(session, product, quantity) {
  // Fast duplicate check using findIndex (single pass)
  const existingIndex = session.cart.findIndex(
    (item) => item.id === product.id
  );

  if (existingIndex >= 0) {
    session.cart[existingIndex].quantity += quantity;
  } else {
    session.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
    });
  }
}

function removeFromCart(session, itemNumber) {
  const index = itemNumber - 1;
  if (index >= 0 && index < session.cart.length) {
    session.cart.splice(index, 1);
    return true;
  }
  return false;
}

// CART SUMMARY - Optimized for USSD display
function getCartSummary(cart) {
  if (cart.length === 0) return "Cart is empty.";

  let summary = "CART:\n";
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    summary += `${i + 1}. ${item.name}\n   ${item.quantity}x R${
      item.price
    } = R${itemTotal}\n`;
  }

  summary += `TOTAL: R${total}`;
  return summary;
}

function calculateCartTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// MAIN USSD HANDLER - OPTIMIZED FOR AFRICA'S TALKING
function handleUSSD(req, res) {
  // CRITICAL: Set headers immediately for Africa's Talking compatibility
  res.set({
    "Content-Type": "text/plain",
    "Cache-Control": "no-cache",
  });

  let response = "END Service temporarily unavailable.";

  try {
    // Extract and validate parameters
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    if (!sessionId) {
      return res.send("END Service unavailable. Please try again.");
    }

    const session = getSession(sessionId);
    const inputPath = text || "";
    const inputs = inputPath.split("*");
    const currentInput = inputs[inputs.length - 1] || "";

    // PERFORMANCE: Switch-based routing for O(1) handler selection
    switch (session.step) {
      case "welcome":
        response = handleWelcome(session, currentInput, sessionId);
        break;
      case "wallet_id":
        response = handleWalletId(session, currentInput, sessionId);
        break;
      case "wallet_password":
        response = handleWalletPassword(session, currentInput, sessionId);
        break;
      case "conversion_amount":
        response = handleConversionAmount(session, currentInput, sessionId);
        break;
      case "conversion_confirm":
        response = handleConversionConfirm(session, currentInput, sessionId);
        break;
      case "shopping_id":
        response = handleShoppingId(session, currentInput, sessionId);
        break;
      case "shopping_password":
        response = handleShoppingPassword(session, currentInput, sessionId);
        break;
      case "select_store":
        response = handleSelectStore(session, currentInput, sessionId);
        break;
      case "select_department":
        response = handleSelectDepartment(session, currentInput, sessionId);
        break;
      case "select_product":
        response = handleSelectProduct(session, currentInput, sessionId);
        break;
      case "enter_quantity":
        response = handleEnterQuantity(session, currentInput, sessionId);
        break;
      case "cart_menu":
        response = handleCartMenu(session, currentInput, sessionId);
        break;
      case "remove_item":
        response = handleRemoveItem(session, currentInput, sessionId);
        break;
      case "checkout_confirmation":
        response = handleCheckoutConfirmation(session, currentInput, sessionId);
        break;
      case "delivery_pickup_selection":
        response = handleDeliveryPickupSelection(
          session,
          currentInput,
          sessionId
        );
        break;
      case "final_confirmation":
        response = handleFinalConfirmation(session, currentInput, sessionId);
        break;
      default:
        response = "END Service error. Please try again.";
        sessions.delete(sessionId);
    }
  } catch (error) {
    // CRITICAL: Prevent hanging requests in Africa's Talking
    console.error("USSD Error:", error.message);
    response = "END Service temporarily unavailable.";

    if (req.body && req.body.sessionId) {
      sessions.delete(req.body.sessionId);
    }
  }

  res.send(response);
}

// HANDLER FUNCTIONS - Each optimized for <100ms response time

function handleWelcome(session, input, sessionId) {
  if (!input) {
    return "CON Welcome to MzansiMarket!\nYour digital wallet shopping platform\n\n1. Shop with Wallet\n2. Check Wallet Balance\n3. Convert Airtime to Wallet\n4. Exit";
  }

  if (!isValidOption(input, 1, 4)) {
    return "CON Invalid choice. Please select:\n\n1. Shop with Wallet\n2. Check Wallet Balance\n3. Convert Airtime to Wallet\n4. Exit";
  }

  const choice = parseInt(input, 10);

  switch (choice) {
    case 1:
      updateSession(sessionId, { step: "shopping_id" });
      return "CON MzansiWallet SHOPPING - LOGIN\nEnter your ID number:";
    case 2:
      updateSession(sessionId, { step: "wallet_id" });
      return "CON MzansiWallet Balance CHECK\nEnter your ID number:";
    case 3:
      updateSession(sessionId, {
        step: "wallet_id",
        tempData: { action: "convert" },
      });
      return "CON WALLET TOP UP\nEnter your ID number:";
    case 4:
      sessions.delete(sessionId);
      return "END Thank you for using MzansiMarket!\nHave a great day!";
    default:
      return "END System error.";
  }
}

function handleWalletId(session, input, sessionId) {
  if (!input || input.length < 8) {
    return "CON Invalid ID format.\nEnter your ID number (min 8 digits):";
  }

  const action = session.tempData?.action || "balance";
  updateSession(sessionId, {
    step: "wallet_password",
    userId: input,
    tempData: { action: action },
  });
  return "CON Enter your password:";
}

function handleWalletPassword(session, input, sessionId) {
  if (!input) {
    return "CON Password is required.\nEnter your password:";
  }

  if (!authenticateUser(session.userId, input)) {
    updateSession(sessionId, { step: "wallet_id", userId: null });
    return "CON Invalid credentials.\nEnter your ID number:";
  }

  const action = session.tempData?.action || "balance";

  if (action === "convert") {
    // Show conversion interface
    const airtimeBalance = getAirtimeBalance(session.userId);
    const walletBalance = getWalletBalance(session.userId);

    updateSession(sessionId, {
      step: "conversion_amount",
      authenticated: true,
    });

    return `CON MzansiMarket!\n Update Your Balance with Airtime\n\nCurrent Balances:\nAirtime: R${airtimeBalance.toFixed(
      2
    )}\nWallet: R${walletBalance.toFixed(
      2
    )}\n\nMin: R10, Max: R500\n\nEnter airtime amount to convert:`;
  } else {
    // Show wallet balance
    const walletBalance = getWalletBalance(session.userId);
    sessions.delete(sessionId);

    return `END WALLET BALANCE\n\nYour current wallet balance: R${walletBalance.toFixed(
      2
    )}\n\nThank you for using MzansiMarket!`;
  }
}

function handleConversionAmount(session, input, sessionId) {
  const amount = parseFloat(input);

  if (
    isNaN(amount) ||
    amount < MZANSI_DATA.minConversion ||
    amount > MZANSI_DATA.maxConversion
  ) {
    const airtimeBalance = getAirtimeBalance(session.userId);
    return `CON Invalid amount. Enter R10-R500.\n\nYour airtime balance: R${airtimeBalance.toFixed(
      2
    )}\n\nEnter amount to convert:`;
  }

  const airtimeBalance = getAirtimeBalance(session.userId);
  if (amount > airtimeBalance) {
    return `CON Insufficient airtime balance.\nYou have R${airtimeBalance.toFixed(
      2
    )}\n\nEnter valid amount:`;
  }

  const walletAmount = amount * MZANSI_DATA.conversionRate;
  const fee = amount * (1 - MZANSI_DATA.conversionRate);

  updateSession(sessionId, {
    step: "conversion_confirm",
    tempData: { ...session.tempData, conversionAmount: amount },
  });

  return `CON CONVERSION PREVIEW\n\nAirtime: R${amount.toFixed(
    2
  )}\nYou'll receive: R${walletAmount.toFixed(2)}\nFee (5%): R${fee.toFixed(
    2
  )}\n\nConfirm conversion?\n1. Yes, Convert\n2. No, Cancel`;
}

function handleConversionConfirm(session, input, sessionId) {
  if (!isValidOption(input, 1, 2)) {
    return "CON Invalid choice.\n\n1. Yes, Convert\n2. No, Cancel";
  }

  if (input === "2") {
    sessions.delete(sessionId);
    return "END Conversion cancelled.\n\nThank you for using MzansiMarket!";
  }

  // Process conversion
  const conversionAmount = session.tempData.conversionAmount;
  const result = convertAirtimeToWallet(session.userId, conversionAmount);

  sessions.delete(sessionId);

  if (result.success) {
    return `END CONVERSION SUCCESSFUL!\n\nAirtime Deducted: R${result.airtimeDeducted.toFixed(
      2
    )}\nWallet Added: R${result.walletAdded.toFixed(
      2
    )}\nFee: R${result.fee.toFixed(
      2
    )}\n\nNew Wallet Balance: R${result.newWalletBalance.toFixed(
      2
    )}\n\nThank you for using MzansiMarket!`;
  } else {
    return `END CONVERSION FAILED\n\n${result.error}\n\nPlease try again.\n\nThank you for using MzansiMarket!`;
  }
}

function handleShoppingId(session, input, sessionId) {
  if (!input || input.length < 8) {
    return "CON Invalid ID format.\nEnter your ID number (min 8 digits):";
  }

  updateSession(sessionId, { step: "shopping_password", userId: input });
  return "CON Enter your password:";
}

function handleShoppingPassword(session, input, sessionId) {
  if (!input) {
    return "CON Password is required.\nEnter your password:";
  }

  if (!authenticateUser(session.userId, input)) {
    updateSession(sessionId, { step: "shopping_id", userId: null });
    return "CON Invalid credentials.\nEnter your ID number:";
  }

  const walletBalance = getWalletBalance(session.userId);
  updateSession(sessionId, { step: "select_store", authenticated: true });

  let response = `CON Login successful!\nWallet Balance: R${walletBalance.toFixed(
    2
  )}\n\nChoose a store:\n\n`;
  for (let i = 0; i < MZANSI_DATA.stores.length; i++) {
    response += `${i + 1}. ${MZANSI_DATA.stores[i].name}\n`;
  }
  return response;
}

function handleSelectStore(session, input, sessionId) {
  if (!isValidOption(input, 1, MZANSI_DATA.stores.length)) {
    let response = "CON Invalid store selection.\nChoose a store:\n\n";
    for (let i = 0; i < MZANSI_DATA.stores.length; i++) {
      response += `${i + 1}. ${MZANSI_DATA.stores[i].name}\n`;
    }
    return response;
  }

  const storeIndex = parseInt(input, 10) - 1;
  const storeId = MZANSI_DATA.stores[storeIndex].id;

  updateSession(sessionId, {
    step: "select_department",
    selectedStore: storeId,
  });

  const departments = MZANSI_DATA.departments[storeId];
  let response = `CON ${MZANSI_DATA.stores[storeIndex].name}\nChoose department:\n\n`;
  for (let i = 0; i < departments.length; i++) {
    response += `${i + 1}. ${departments[i].name}\n`;
  }
  return response;
}

function handleSelectDepartment(session, input, sessionId) {
  const departments = MZANSI_DATA.departments[session.selectedStore];

  if (!isValidOption(input, 1, departments.length)) {
    let response = "CON Invalid department.\nChoose department:\n\n";
    for (let i = 0; i < departments.length; i++) {
      response += `${i + 1}. ${departments[i].name}\n`;
    }
    return response;
  }

  const deptIndex = parseInt(input, 10) - 1;
  const departmentId = departments[deptIndex].id;

  updateSession(sessionId, {
    step: "select_product",
    selectedDepartment: departmentId,
  });

  const products = MZANSI_DATA.products[departmentId];
  let response = `CON ${departments[deptIndex].name}\nChoose product:\n\n`;
  for (let i = 0; i < products.length; i++) {
    response += `${i + 1}. ${products[i].name}\n   R${products[i].price}\n`;
  }
  return response;
}

function handleSelectProduct(session, input, sessionId) {
  const products = MZANSI_DATA.products[session.selectedDepartment];

  if (!isValidOption(input, 1, products.length)) {
    let response = "CON Invalid product choice.\nChoose product:\n\n";
    for (let i = 0; i < products.length; i++) {
      response += `${i + 1}. ${products[i].name}\n   R${products[i].price}\n`;
    }
    return response;
  }

  const productIndex = parseInt(input, 10) - 1;
  const selectedProduct = products[productIndex];

  updateSession(sessionId, {
    step: "enter_quantity",
    selectedProduct: selectedProduct,
  });

  return `CON SELECTED PRODUCT:\n${selectedProduct.name}\nPrice: R${selectedProduct.price}\n\nEnter quantity (1-10):`;
}

function handleEnterQuantity(session, input, sessionId) {
  const quantity = parseInt(input, 10);

  if (isNaN(quantity) || quantity < 1 || quantity > 10) {
    return `CON Invalid quantity.\nEnter 1-10 for:\n${session.selectedProduct.name}`;
  }

  // Add to cart immediately (wallet-only payment)
  addToCart(session, session.selectedProduct, quantity);

  updateSession(sessionId, { step: "cart_menu" });

  const summary = getCartSummary(session.cart);
  return `CON ITEM ADDED TO CART!\n\n${summary}\n\nWhat would you like to do next?\n1. Continue Shopping\n2. Remove Item from Cart\n3. Proceed to Checkout`;
}

function handleCartMenu(session, input, sessionId) {
  if (!isValidOption(input, 1, 3)) {
    const summary = getCartSummary(session.cart);
    return `CON Invalid option.\n\n${summary}\n\nWhat would you like to do next?\n1. Continue Shopping\n2. Remove Item from Cart\n3. Proceed to Checkout`;
  }

  const choice = parseInt(input, 10);

  switch (choice) {
    case 1:
      updateSession(sessionId, { step: "select_store" });
      const currentWalletBalance = getWalletBalance(session.userId);
      let response = `CON Continue Shopping\nWallet: R${currentWalletBalance.toFixed(
        2
      )}\n\nChoose store:\n\n`;
      for (let i = 0; i < MZANSI_DATA.stores.length; i++) {
        response += `${i + 1}. ${MZANSI_DATA.stores[i].name}\n`;
      }
      return response;

    case 2:
      if (session.cart.length === 0) {
        return "CON Your cart is empty!\n\n1. Continue Shopping\n3. Proceed to Checkout";
      }

      updateSession(sessionId, { step: "remove_item" });
      const summary = getCartSummary(session.cart);
      return `CON REMOVE ITEM\n\n${summary}\n\nEnter item number to remove (1-${session.cart.length}):`;

    case 3:
      if (session.cart.length === 0) {
        updateSession(sessionId, { step: "select_store" });
        return "CON Cart is empty!\nLet's start shopping:\n\nChoose a store:";
      }

      updateSession(sessionId, { step: "checkout_confirmation" });
      const checkoutSummary = getCartSummary(session.cart);
      const currentBalance = getWalletBalance(session.userId);
      return `CON CHECKOUT REVIEW\n\n${checkoutSummary}\n\nWallet Balance: R${currentBalance.toFixed(
        2
      )}\n\nConfirm your order?\n1. Yes, Continue to Delivery\n2. No, Go Back to Cart`;

    default:
      return "END System error occurred.";
  }
}

function handleRemoveItem(session, input, sessionId) {
  const itemNumber = parseInt(input, 10);

  if (isNaN(itemNumber) || itemNumber < 1 || itemNumber > session.cart.length) {
    const summary = getCartSummary(session.cart);
    return `CON Invalid item number.\n\n${summary}\n\nEnter valid number (1-${session.cart.length}):`;
  }

  if (removeFromCart(session, itemNumber)) {
    updateSession(sessionId, { step: "cart_menu" });
    const updatedSummary = getCartSummary(session.cart);
    return `CON ITEM REMOVED SUCCESSFULLY!\n\n${updatedSummary}\n\nWhat would you like to do next?\n1. Continue Shopping\n2. Remove Another Item\n3. Proceed to Checkout`;
  } else {
    return "CON Error removing item.\nPlease try again.";
  }
}

function handleCheckoutConfirmation(session, input, sessionId) {
  if (!isValidOption(input, 1, 2)) {
    const checkoutSummary = getCartSummary(session.cart);
    const walletBalance = getWalletBalance(session.userId);
    return `CON Invalid choice.\n\n${checkoutSummary}\n\nWallet Balance: R${walletBalance.toFixed(
      2
    )}\n\nConfirm your order?\n1. Yes, Continue to Delivery\n2. No, Go Back to Cart`;
  }

  if (input === "2") {
    updateSession(sessionId, { step: "cart_menu" });
    const summary = getCartSummary(session.cart);
    return `CON Back to Cart Options\n\n${summary}\n\nWhat would you like to do next?\n1. Continue Shopping\n2. Remove Item from Cart\n3. Proceed to Checkout`;
  }

  updateSession(sessionId, { step: "delivery_pickup_selection" });

  const deliveryAddress = getDeliveryAddress(session.userId);
  const pickupPoint = getPickupPoint(session.userId);

  return `CON DELIVERY OPTIONS\n\nHow would you like to receive your order?\n\n1. Home Delivery\n   Address: ${deliveryAddress}\n\n2. Store Pickup\n   Location: ${pickupPoint}`;
}

function handleDeliveryPickupSelection(session, input, sessionId) {
  if (!isValidOption(input, 1, 2)) {
    const deliveryAddress = getDeliveryAddress(session.userId);
    const pickupPoint = getPickupPoint(session.userId);

    return `CON Invalid selection.\n\nHow would you like to receive your order?\n\n1. Home Delivery\n   Address: ${deliveryAddress}\n\n2. Store Pickup\n   Location: ${pickupPoint}`;
  }

  const isDelivery = input === "1";
  const location = isDelivery
    ? getDeliveryAddress(session.userId)
    : getPickupPoint(session.userId);

  updateSession(sessionId, {
    step: "final_confirmation",
    tempData: {
      deliveryMethod: isDelivery ? "delivery" : "pickup",
      location: location,
    },
  });

  const cartTotal = calculateCartTotal(session.cart);
  const walletBalance = getWalletBalance(session.userId);

  let confirmationText = `CON FINAL CONFIRMATION\n\n`;
  confirmationText += `${
    isDelivery ? "DELIVERY TO:" : "PICKUP FROM:"
  }\n${location}\n\n`;
  confirmationText += `ORDER TOTAL: R${cartTotal.toFixed(2)}\n`;
  confirmationText += `Wallet Balance: R${walletBalance.toFixed(2)}\n\n`;

  if (cartTotal > walletBalance) {
    confirmationText += `INSUFFICIENT WALLET BALANCE!\nShortfall: R${(
      cartTotal - walletBalance
    ).toFixed(2)}\n\n1. Convert Airtime to Wallet\n2. Cancel Order`;
  } else {
    confirmationText += `Complete your order?\n1. Yes, Process Payment\n2. No, Cancel Order`;
  }

  return confirmationText;
}

function handleFinalConfirmation(session, input, sessionId) {
  if (!isValidOption(input, 1, 2)) {
    const cartTotal = calculateCartTotal(session.cart);
    const walletBalance = getWalletBalance(session.userId);
    const location = session.tempData.location;
    const isDelivery = session.tempData.deliveryMethod === "delivery";

    let confirmationText = `CON Invalid choice.\n\n${
      isDelivery ? "DELIVERY TO:" : "PICKUP FROM:"
    }\n${location}\nORDER TOTAL: R${cartTotal.toFixed(
      2
    )}\nWallet Balance: R${walletBalance.toFixed(2)}\n\n`;

    if (cartTotal > walletBalance) {
      confirmationText += `1. Convert Airtime to Wallet\n2. Cancel Order`;
    } else {
      confirmationText += `Complete your order?\n1. Yes, Process Payment\n2. No, Cancel Order`;
    }

    return confirmationText;
  }

  const cartTotal = calculateCartTotal(session.cart);
  const walletBalance = getWalletBalance(session.userId);

  if (input === "2") {
    updateSession(sessionId, { step: "cart_menu", tempData: {} });
    const summary = getCartSummary(session.cart);
    return `CON Order cancelled.\n\n${summary}\n\nWhat would you like to do?\n1. Continue Shopping\n2. Remove Item from Cart\n3. Proceed to Checkout`;
  }

  // Handle insufficient balance case
  if (cartTotal > walletBalance) {
    if (input === "1") {
      // Redirect to airtime conversion
      const airtimeBalance = getAirtimeBalance(session.userId);
      const shortfall = cartTotal - walletBalance;
      const requiredAirtime = Math.ceil(shortfall / MZANSI_DATA.conversionRate);

      updateSession(sessionId, {
        step: "conversion_amount",
        tempData: {
          ...session.tempData,
          returnToCheckout: true,
          requiredAmount: requiredAirtime,
        },
      });

      return `CON CONVERT AIRTIME TO WALLET\n\nShortfall: R${shortfall.toFixed(
        2
      )}\nMin airtime needed: R${requiredAirtime.toFixed(
        2
      )}\n\nYour airtime: R${airtimeBalance.toFixed(
        2
      )}\n\nEnter airtime amount to convert:`;
    }
  }

  // Process successful payment
  const location = session.tempData.location;
  const isDelivery = session.tempData.deliveryMethod === "delivery";

  // Update wallet balance
  updateWalletBalance(session.userId, walletBalance - cartTotal);

  // Generate order confirmation
  const orderNumber = `ORD${Date.now().toString().slice(-6)}`;
  const deliveryTime = isDelivery ? "2-3 business days" : "Ready in 2 hours";

  sessions.delete(sessionId);

  return `END ORDER SUCCESSFUL!\n\nOrder #: ${orderNumber}\nTotal Paid: R${cartTotal.toFixed(
    2
  )}\nNew Wallet Balance: R${(walletBalance - cartTotal).toFixed(2)}\n\n${
    isDelivery ? "DELIVERY DETAILS:" : "PICKUP DETAILS:"
  }\n${location}\nETA: ${deliveryTime}\n\nThank you for shopping with MzansiMarket!`;
}

// PERFORMANCE: Health check endpoint for monitoring
function test(req, res) {
  res.set({
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  });

  try {
    const response = {
      status: "MzansiMarket Wallet USSD Service Active",
      version: "4.0 - Wallet Optimized for Africa's Talking",
      timestamp: new Date().toISOString(),
      performance: {
        activeSessions: sessions.size,
        uptime: Math.floor(process.uptime()),
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        features: ["wallet_payments", "airtime_conversion", "fast_checkout"],
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Test endpoint error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Service health check failed",
      timestamp: new Date().toISOString(),
    });
  }
}

// UTILITY FUNCTIONS for monitoring and debugging
function getSessionCount() {
  return sessions.size;
}

function clearAllSessions() {
  const count = sessions.size;
  sessions.clear();
  return count;
}

function getSessionById(sessionId) {
  return sessions.get(sessionId);
}

// PERFORMANCE: Bulk operations for testing
function bulkWalletUpdate(updates) {
  let successful = 0;
  for (const [userId, amount] of updates) {
    if (updateWalletBalance(userId, amount)) {
      successful++;
    }
  }
  return successful;
}

// Export all functions for Express routes
module.exports = {
  // MAIN EXPORTS - Required for Africa's Talking integration
  handleUSSD,
  test,

  // SESSION MANAGEMENT - For monitoring and debugging
  getSession,
  updateSession,
  clearAllSessions,
  getSessionCount,
  getSessionById,

  // WALLET OPERATIONS - Core functionality
  getWalletBalance,
  updateWalletBalance,
  getAirtimeBalance,
  convertAirtimeToWallet,
  bulkWalletUpdate,

  // DATA ACCESS - For testing and validation
  MZANSI_DATA,

  // UTILITY FUNCTIONS - For extended functionality
  authenticateUser,
  getDeliveryAddress,
  getPickupPoint,
  calculateCartTotal,

  // CART OPERATIONS - For testing cart functionality
  addToCart,
  removeFromCart,
  getCartSummary,

  // VALIDATION - For input validation
  isValidOption,
};
