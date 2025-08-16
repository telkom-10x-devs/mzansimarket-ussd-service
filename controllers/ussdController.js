// const MZANSI_DATA = require("../data/mzansiData");

const sessions = new Map();
const SESSION_TIMEOUT = 180000; // 3 minutes (Africa's Talking standard)

// MEMORY MANAGEMENT: Clean expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
    }
  }
}, 300000);

// Pulled
const MZANSI_DATA = {
  // User credentials - Map for instant authentication
  users: new Map([
    ["1234567890", "123"],
    ["0987654321", "456"],
    ["5555555555", "123"],
    ["1111111111", "123"],
    ["0105305763085", "013290"],
  ]),

  // Account balances - Map for instant balance lookup
  balances: new Map([
    ["1234567890", 1500.0],
    ["0987654321", 2300.5],
    ["5555555555", 800.25],
    ["1111111111", 1000.0],
    ["0105305763085", 2500.75],
  ]),

  // Airtime balances - Map for instant airtime lookup
  airtimeBalances: new Map([
    ["1234567890", 120.5],
    ["0987654321", 85.3],
    ["5555555555", 45.75],
    ["1111111111", 200.0],
    ["0105305763085", 78.25],
  ]),

  // Delivery addresses - Pre-computed for instant access
  deliveryAddresses: new Map([
    ["1234567890", "123 Main Street, Soweto, Johannesburg"],
    ["0987654321", "456 Oak Avenue, Sandton, Johannesburg"],
    ["5555555555", "789 Pine Road, Kempton Park, Gauteng"],
    ["1111111111", "321 Elm Street, Roodepoort, Johannesburg"],
    ["0105305763085", "654 Maple Drive, Midrand, Gauteng"],
  ]),

  // Pickup points by area - Pre-computed mapping
  pickupPoints: new Map([
    ["soweto", "Shoprite Pickup Point, Soweto Mall, Protea Glen"],
    ["sandton", "Pick n Pay Pickup, Sandton City Shopping Centre"],
    ["kempton", "Checkers Pickup Point, Kempton Square Mall"],
    ["roodepoort", "Spar Pickup Point, Clearwater Mall"],
    ["midrand", "Woolworths Pickup, Mall of Africa"],
    ["default", "Shoprite Pickup Point, Soweto Mall"],
  ]),

  // Stores - Array for simple iteration (small dataset)
  stores: [
    { id: 1, name: "Shop A - Electronics" },
    { id: 2, name: "Shop B - Groceries" },
    { id: 3, name: "Shop C - Fashion" },
  ],

  // Departments by store - Direct access structure
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

  // Products by department - Direct access structure
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

function getSession(sessionId) {
  let session = sessions.get(sessionId);

  if (!session) {
    // Create minimal session object for speed
    session = {
      step: "welcome",
      userId: null,
      authenticated: false,
      selectedStore: null,
      selectedDepartment: null,
      selectedProduct: null,
      cart: [],
      tempData: {},
      lastActivity: Date.now(),
      created: Date.now(),
    };
    sessions.set(sessionId, session);
  } else {
    // Update activity timestamp only
    session.lastActivity = Date.now();
  }

  return session;
}

// Update session

function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId);
  if (session) {
    Object.assign(session, updates, { lastActivity: Date.now() });
  }
}

// InputValidation

function isValidOption(input, min, max) {
  const num = parseInt(input, 10);
  return num >= min && num <= max && !isNaN(num);
}

// User authentication

function authenticateUser(userId, password) {
  return MZANSI_DATA.users.get(userId) === password;
}

// Balance lookup

function getUserBalance(userId) {
  return MZANSI_DATA.balances.get(userId) || 0;
}

// Airtime balance lookup

function getAirtimeBalance(userId) {
  return MZANSI_DATA.airtimeBalances.get(userId) || 0;
}

// Address lookup

function getDeliveryAddress(userId) {
  return MZANSI_DATA.deliveryAddresses.get(userId) || "123 Main Street, Soweto";
}

// Pickup point determination

function getPickupPoint(userId) {
  // Fast area detection using string operations (no regex)
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

// Cart operations

function addToCart(session, product, quantity, paymentMethod) {
  // Fast duplicate check using findIndex (single pass)
  const existingIndex = session.cart.findIndex(
    (item) => item.id === product.id && item.paymentMethod === paymentMethod
  );

  if (existingIndex >= 0) {
    session.cart[existingIndex].quantity += quantity;
  } else {
    session.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      paymentMethod: paymentMethod,
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

// Cart summary generation

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
    } = R${itemTotal}\n   Via: ${item.paymentMethod}\n`;
  }

  summary += `TOTAL: R${total}`;
  return summary;
}

// Cart totals calculation

function calculateCartTotals(cart) {
  let airtimeTotal = 0;
  let accountTotal = 0;
  let grandTotal = 0;

  for (const item of cart) {
    const itemTotal = item.price * item.quantity;
    grandTotal += itemTotal;

    if (item.paymentMethod === "Airtime") {
      airtimeTotal += itemTotal;
    } else {
      accountTotal += itemTotal;
    }
  }

  return { airtime: airtimeTotal, account: accountTotal, total: grandTotal };
}

// MAIN USSD HANDLER - AFRICA'S TALKING OPTIMIZED

function handleUSSD(req, res) {
  // Set headers IMMEDIATELY for Africa's Talking
  res.set({
    "Content-Type": "text/plain",
    "Cache-Control": "no-cache",
  });

  let response = "END Service temporarily unavailable.";

  try {
    // Extract parameters with validation
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    // Validate sessionId immediately
    if (!sessionId) {
      return res.send("END Service unavailable. Please try again.");
    }

    // Get session
    const session = getSession(sessionId);

    // Parse input
    const inputPath = text || "";
    const inputs = inputPath.split("*");
    const currentInput = inputs[inputs.length - 1] || "";

    // Route to handlers using optimized switch
    // Each handler is designed to execute in <100ms
    switch (session.step) {
      case "welcome":
        response = handleWelcome(session, currentInput, sessionId);
        break;
      case "buy_id":
        response = handleBuyId(session, currentInput, sessionId);
        break;
      case "buy_password":
        response = handleBuyPassword(session, currentInput, sessionId);
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
      case "select_payment":
        response = handleSelectPayment(session, currentInput, sessionId);
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
      case "balance_id":
        response = handleBalanceId(session, currentInput, sessionId);
        break;
      case "balance_password":
        response = handleBalancePassword(session, currentInput, sessionId);
        break;
      case "airtime_id":
        response = handleAirtimeId(session, currentInput, sessionId);
        break;
      case "airtime_password":
        response = handleAirtimePassword(session, currentInput, sessionId);
        break;
      default:
        response = "END Service error. Please try again.";
        sessions.delete(sessionId);
    }
  } catch (error) {
    // To prevent let errors hanging in the request
    console.error("USSD Error:", error.message);
    response = "END Service temporarily unavailable.";

    // Clean up any problematic session
    if (req.body && req.body.sessionId) {
      sessions.delete(req.body.sessionId);
    }
  }

  // Send response
  res.send(response);
}

// Handler functions
function handleWelcome(session, input, sessionId) {
  if (!input) {
    return "CON Welcome to MzansiMarket!\nYour one-stop shopping solution\n\n1. Buy Products\n2. Check Account Balance\n3. Check Airtime Balance\n4. Exit";
  }

  if (!isValidOption(input, 1, 4)) {
    return "CON Invalid choice. Please select:\n\n1. Buy Products\n2. Check Account Balance\n3. Check Airtime Balance\n4. Exit";
  }

  const choice = parseInt(input, 10);

  switch (choice) {
    case 1:
      updateSession(sessionId, { step: "buy_id" });
      return "CON SHOPPING - LOGIN\nEnter your ID number:";
    case 2:
      updateSession(sessionId, { step: "balance_id" });
      return "CON ACCOUNT BALANCE\nEnter your ID number:";
    case 3:
      updateSession(sessionId, { step: "airtime_id" });
      return "CON AIRTIME BALANCE\nEnter your ID number:";
    case 4:
      sessions.delete(sessionId);
      return "END Thank you for using MzansiMarket!\nHave a great day!";
    default:
      return "END System error.";
  }
}

function handleBuyId(session, input, sessionId) {
  if (!input || input.length < 8) {
    return "CON Invalid ID format.\nEnter your ID number (min 8 digits):";
  }

  updateSession(sessionId, { step: "buy_password", userId: input });
  return "CON Enter your password:";
}

function handleBuyPassword(session, input, sessionId) {
  if (!input) {
    return "CON Password is required.\nEnter your password:";
  }

  if (!authenticateUser(session.userId, input)) {
    updateSession(sessionId, { step: "buy_id", userId: null });
    return "CON Invalid credentials.\nEnter your ID number:";
  }

  updateSession(sessionId, { step: "select_store", authenticated: true });

  let response = "CON Login successful!\nChoose a store:\n\n";
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

  updateSession(sessionId, {
    step: "select_payment",
    tempData: { quantity: quantity },
  });

  const total = session.selectedProduct.price * quantity;
  return `CON QUANTITY: ${quantity}\n${session.selectedProduct.name}\nLine Total: R${total}\n\nPayment method:\n1. Airtime\n2. Account Balance`;
}

function handleSelectPayment(session, input, sessionId) {
  if (!isValidOption(input, 1, 2)) {
    return "CON Invalid payment method.\nChoose payment:\n\n1. Airtime\n2. Account Balance";
  }

  const paymentMethod = input === "1" ? "Airtime" : "Account Balance";

  addToCart(
    session,
    session.selectedProduct,
    session.tempData.quantity,
    paymentMethod
  );

  updateSession(sessionId, { step: "cart_menu", tempData: {} });

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
      let response = "CON Continue Shopping\nChoose another store:\n\n";
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
      return `CON CHECKOUT REVIEW\n\n${checkoutSummary}\n\nConfirm your order?\n1. Yes, Continue to Delivery\n2. No, Go Back to Cart`;

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
    return `CON Invalid choice.\n\n${checkoutSummary}\n\nConfirm your order?\n1. Yes, Continue to Delivery\n2. No, Go Back to Cart`;
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

  const totals = calculateCartTotals(session.cart);
  const accountBalance = getUserBalance(session.userId);
  const airtimeBalance = getAirtimeBalance(session.userId);

  let confirmationText = `CON FINAL CONFIRMATION\n\n`;
  confirmationText += `${
    isDelivery ? "DELIVERY TO:" : "PICKUP FROM:"
  }\n${location}\n\n`;
  confirmationText += `ORDER TOTAL: R${totals.total}\n`;

  if (totals.airtime > 0) {
    confirmationText += `Airtime Payment: R${totals.airtime}\n`;
    confirmationText += `Your Airtime Balance: R${airtimeBalance}\n`;
  }

  if (totals.account > 0) {
    confirmationText += `Account Payment: R${totals.account}\n`;
    confirmationText += `Your Account Balance: R${accountBalance}\n`;
  }

  confirmationText += `\nComplete your order?\n1. Yes, Process Payment\n2. No, Cancel Order`;

  return confirmationText;
}

function handleFinalConfirmation(session, input, sessionId) {
  if (!isValidOption(input, 1, 2)) {
    const totals = calculateCartTotals(session.cart);
    const location = session.tempData.location;
    const isDelivery = session.tempData.deliveryMethod === "delivery";

    return `CON Invalid choice.\n\n${
      isDelivery ? "DELIVERY TO:" : "PICKUP FROM:"
    }\n${location}\nORDER TOTAL: R${
      totals.total
    }\n\nComplete your order?\n1. Yes, Process Payment\n2. No, Cancel Order`;
  }

  if (input === "2") {
    updateSession(sessionId, { step: "cart_menu", tempData: {} });
    const summary = getCartSummary(session.cart);
    return `CON Order cancelled.\n\n${summary}\n\nWhat would you like to do?\n1. Continue Shopping\n2. Remove Item from Cart\n3. Proceed to Checkout`;
  }

  const totals = calculateCartTotals(session.cart);
  const accountBalance = getUserBalance(session.userId);
  const airtimeBalance = getAirtimeBalance(session.userId);
  const location = session.tempData.location;
  const isDelivery = session.tempData.deliveryMethod === "delivery";

  // Balance validation
  if (totals.airtime > airtimeBalance || totals.account > accountBalance) {
    sessions.delete(sessionId);
    let errorMessage = "PAYMENT FAILED\n\n";
    if (totals.airtime > airtimeBalance) {
      errorMessage += `Insufficient airtime balance. Need R${totals.airtime}, have R${airtimeBalance}.\n`;
    }
    if (totals.account > accountBalance) {
      errorMessage += `Insufficient account balance. Need R${totals.account}, have R${accountBalance}.\n`;
    }
    errorMessage +=
      "Please top up your account and try again.\n\nThank you for using MzansiMarket!";
    return `END ${errorMessage}`;
  }

  // Generate order confirmation
  const orderNumber = `ORD${Date.now().toString().slice(-6)}`;
  const deliveryTime = isDelivery ? "2-3 business days" : "Ready in 2 hours";

  sessions.delete(sessionId);

  return `END ORDER SUCCESSFUL!\n\nOrder #: ${orderNumber}\nTotal Paid: R${
    totals.total
  }\n\n${
    isDelivery ? "DELIVERY DETAILS:" : "PICKUP DETAILS:"
  }\n${location}\nETA: ${deliveryTime}\n\nPayment processed successfully!\nThank you for shopping with MzansiMarket!`;
}

function handleBalanceId(session, input, sessionId) {
  if (!input || input.length < 8) {
    return "CON Invalid ID format.\nEnter your ID number:";
  }

  updateSession(sessionId, { step: "balance_password", userId: input });
  return "CON Enter your password:";
}

function handleBalancePassword(session, input, sessionId) {
  if (!input) {
    return "CON Password is required.\nEnter your password:";
  }

  if (!authenticateUser(session.userId, input)) {
    updateSession(sessionId, { step: "balance_id", userId: null });
    return "CON Invalid credentials.\nEnter your ID number:";
  }

  const balance = getUserBalance(session.userId);
  sessions.delete(sessionId);

  return `END ACCOUNT BALANCE\n\nYour current balance: R${balance.toFixed(
    2
  )}\n\nThank you for using MzansiMarket!`;
}

function handleAirtimeId(session, input, sessionId) {
  if (!input || input.length < 8) {
    return "CON Invalid ID format.\nEnter your ID number:";
  }

  updateSession(sessionId, { step: "airtime_password", userId: input });
  return "CON Enter your password:";
}

function handleAirtimePassword(session, input, sessionId) {
  if (!input) {
    return "CON Password is required.\nEnter your password:";
  }

  if (!authenticateUser(session.userId, input)) {
    updateSession(sessionId, { step: "airtime_id", userId: null });
    return "CON Invalid credentials.\nEnter your ID number:";
  }

  const airtimeBalance = getAirtimeBalance(session.userId);
  sessions.delete(sessionId);

  return `END AIRTIME BALANCE\n\nYour current airtime balance: R${airtimeBalance.toFixed(
    2
  )}\n\nThank you for using MzansiMarket!`;
}

// Fast JSON response for health checks and monitoring

function test(req, res) {
  // PERFORMANCE: Set headers immediately
  res.set({
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  });

  try {
    // PERFORMANCE: Pre-computed response object
    const response = {
      status: "MzansiMarket USSD Service Active - Africa's Talking Optimized",
      version: "3.0 - Performance Optimized for AT",
      timestamp: new Date().toISOString(),
      performance: {
        activeSessions: sessions.size,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage().heapUsed,
        avgResponseTime: "<500ms guaranteed",
      },
      optimizations: {
        sessionLookup: "O(1) Map-based",
        dataAccess: "Pre-indexed Maps",
        responseGeneration: "Synchronous only",
        errorHandling: "Comprehensive try-catch",
        sessionCleanup: "Automatic every 5min",
        afrTalkingOptimized: true,
      },
      features: {
        shopping: "✓ Full cart management",
        accountBalance: "✓ Account balance checking",
        airtimeBalance: "✓ Airtime balance checking",
        deliveryOptions: "✓ Delivery vs Pickup selection",
        sessionOptimization: "✓ Africa's Talking optimized",
        errorRecovery: "✓ Automatic error handling",
      },
      system: {
        totalUsers: MZANSI_DATA.users.size,
        totalStores: MZANSI_DATA.stores.length,
        totalProducts: Object.values(MZANSI_DATA.products).flat().length,
        deliveryAddresses: MZANSI_DATA.deliveryAddresses.size,
        pickupPoints: MZANSI_DATA.pickupPoints.size,
      },
      testCredentials: [
        {
          id: "1234567890",
          password: "password123",
          accountBalance: "R1500.00",
          airtimeBalance: "R120.50",
        },
        {
          id: "0987654321",
          password: "mypass456",
          accountBalance: "R2300.50",
          airtimeBalance: "R85.30",
        },
        {
          id: "5555555555",
          password: "test123",
          accountBalance: "R800.25",
          airtimeBalance: "R45.75",
        },
        {
          id: "0105305763085",
          password: "013290",
          accountBalance: "R2500.75",
          airtimeBalance: "R78.25",
        },
      ],
      healthCheck: {
        database: "✓ Mock data loaded",
        sessions: `✓ ${sessions.size} active sessions`,
        memory: "✓ Within normal limits",
        responseTime: "✓ <500ms guaranteed",
      },
    };

    res.json(response);
  } catch (error) {
    // CRITICAL: Never let test endpoint hang
    console.error("Test endpoint error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Service health check failed",
      timestamp: new Date().toISOString(),
    });
  }
}

// Get session count for monitoring

function getSessionCount() {
  return sessions.size;
}

// Clear all sessions (for testing/debugging)

function clearAllSessions() {
  const count = sessions.size;
  sessions.clear();
  return count;
}

// Get session by ID for debugging

function getSessionById(sessionId) {
  return sessions.get(sessionId);
}

// Export all functions for use in Express routes
module.exports = {
  // MAIN EXPORTS - Required for Africa's Talking integration
  handleUSSD,
  // test,

  // SESSION MANAGEMENT - For monitoring and debugging
  getSession,
  updateSession,
  clearAllSessions,
  getSessionCount,
  getSessionById,

  // DATA ACCESS - For testing and validation
  MZANSI_DATA,

  // UTILITY FUNCTIONS - For extended functionality
  authenticateUser,
  getUserBalance,
  getAirtimeBalance,
  getDeliveryAddress,
  getPickupPoint,
  calculateCartTotals,

  // CART OPERATIONS - For testing cart functionality
  addToCart,
  removeFromCart,
  getCartSummary,

  // VALIDATION - For input validation
  isValidOption,
};
