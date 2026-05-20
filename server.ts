/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// ------------------------------------------------------------------
// STATE & MOCK STORAGE (In-Memory DB)
// ------------------------------------------------------------------

// Seed Two-Factor Authentication State
let twoFactor = {
  enabled: false,
  method: null as "APP" | "SMS" | null,
  phoneNumber: "",
  totpSecret: "CLIPERSECUREKEY2026SAMSON",
  backupCodes: ["4829-1029", "8302-1191", "4401-2294", "7712-4039"],
  smsOtpCode: "",
  smsOtpExpiry: 0
};

function verifyTwoFactorCode(code: string): boolean {
  if (!twoFactor.enabled) return true;
  if (!code) return false;

  // Check backup codes
  const backupIdx = twoFactor.backupCodes.indexOf(code);
  if (backupIdx !== -1) {
    twoFactor.backupCodes.splice(backupIdx, 1); // consume code
    return true;
  }

  // Check APP code
  if (twoFactor.method === "APP" && (code === "123456" || code === "888888")) {
    return true;
  }

  // Check SMS OTP code (or sandbox 123456 / 888888 for convenience)
  if (twoFactor.method === "SMS" && (code === "123456" || code === "888888" || (code === twoFactor.smsOtpCode && Date.now() < twoFactor.smsOtpExpiry))) {
    twoFactor.smsOtpCode = ""; // consume
    return true;
  }

  return false;
}

// Seed user African bank accounts (focused on Nigeria & expanding regions)
let bankAccounts = [
  {
    id: "acc_1",
    holderName: "Samson Adebayo",
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0112345678",
    sortCode: "058-150-13",
    balance: 14250000.00, // ₦14,250,000.00
    currency: "NGN",
    symbol: "₦",
    country: "Nigeria"
  },
  {
    id: "acc_2",
    holderName: "Samson Adebayo",
    bankName: "Access Bank PLC",
    accountNumber: "1023948577",
    sortCode: "044-150-01",
    balance: 4820500.00, // ₦4,820,500.00
    currency: "NGN",
    symbol: "₦",
    country: "Nigeria"
  },
  {
    id: "acc_3",
    holderName: "Samson Adebayo",
    bankName: "MTN Mobile Money",
    accountNumber: "0244112233",
    sortCode: "MTN-GHA",
    balance: 15450.00, // GH₵15,450.00 (Ghana)
    currency: "GHS",
    symbol: "GH₵",
    country: "Ghana"
  },
  {
    id: "acc_4",
    holderName: "Samson Adebayo",
    bankName: "Standard Bank Ltd",
    accountNumber: "2087654321",
    sortCode: "051-122",
    balance: 38200.00, // R38,200.00 (South Africa)
    currency: "ZAR",
    symbol: "R",
    country: "South Africa"
  }
];

// Seed cryptocurrency balances
let cryptoBalances: { [symbol: string]: number } = {
  BTC: 0.3842,
  ETH: 2.754,
  USDT: 1450.00,
  SOL: 18.25,
};

// Seed cryptocurrency default price details (in NGN ₦)
let cryptoMarket = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    price: 95450000.00,
    change24h: 3.42,
    sparkline: [92100000, 93400000, 93200000, 93900000, 94100000, 94050000, 95450000],
    color: "amber",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    price: 4970000.00,
    change24h: -1.82,
    sparkline: [5110000, 5070000, 5020000, 5060000, 4980000, 4995000, 4970000],
    color: "indigo",
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    price: 1530.00,
    change24h: 0.05,
    sparkline: [1525, 1532, 1528, 1535, 1529, 1531, 1530],
    color: "emerald",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    price: 240000.00,
    change24h: 8.94,
    sparkline: [218000, 221000, 229000, 227000, 234050, 237800, 240000],
    color: "purple",
  }
];

// Seed Gift Card Rate details (Naira ₦ per USD $)
let giftCards = [
  { id: "apple", name: "Apple Gift Card", rate: 1250, demand: "High", icon: "Apple", change24h: 1.2 },
  { id: "amazon", name: "Amazon Gift Card", rate: 1100, demand: "Medium", icon: "Gift", change24h: -0.4 },
  { id: "steam", name: "Steam Gift Card", rate: 1350, demand: "Critical", icon: "Gamepad2", change24h: 2.1 },
  { id: "googleplay", name: "Google Play Gift Card", rate: 1150, demand: "High", icon: "Play", change24h: 0.5 },
  { id: "razer", name: "Razer Gold Gift Card", rate: 1380, demand: "High", icon: "Zap", change24h: 1.8 },
  { id: "sephora", name: "Sephora Gift Card", rate: 1220, demand: "Medium", icon: "Sparkles", change24h: -1.1 },
  { id: "nordstrom", name: "Nordstrom Gift Card", rate: 1210, demand: "Medium", icon: "Layers", change24h: 0.8 },
  { id: "ebay", name: "eBay Gift Card", rate: 1180, demand: "High", icon: "ShoppingBag", change24h: -0.2 }
];

// Simulated Transaction History with realistic African conversions
let transactions: any[] = [
  {
    id: "tx_1",
    type: "BUY",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "COMPLETED",
    assetSymbol: "BTC",
    cryptoAmount: 0.02,
    fiatAmount: 1909000.00,
    fee: 9545.00,
    sourceBankAccountId: "acc_1",
  },
  {
    id: "tx_2",
    type: "TRANSFER",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    status: "COMPLETED",
    fiatAmount: 450000.00,
    fee: 0.00,
    recipientName: "Chinedu Okafor",
    recipientBank: "Zenith Bank PLC",
    recipientAccount: "2094283100",
    recipientSortCode: "057-150-14",
    reference: "Monthly Office Lease",
    sourceBankAccountId: "acc_1",
  },
  {
    id: "tx_3",
    type: "SWAP",
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    status: "COMPLETED",
    assetSymbol: "ETH",
    toAssetSymbol: "USDT",
    cryptoAmount: 0.5,
    fiatAmount: 2485000.25,
    fee: 7455.00,
  },
  {
    id: "tx_4",
    type: "TRANSFER",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: "COMPLETED",
    fiatAmount: 8500.00,
    fee: 0.00,
    recipientName: "Ezenwa Power Grid",
    recipientBank: "United Bank for Africa (UBA)",
    recipientAccount: "1019128377",
    recipientSortCode: "033-150-10",
    reference: "Data & Utility Bill",
    sourceBankAccountId: "acc_2",
  }
];

// Internal simulation to dynamically fluctuate prices slightly to feel alive
const driftPrices = () => {
  cryptoMarket = cryptoMarket.map(coin => {
    // Tweak prices by a minor scalar -0.2% to +0.25%
    const changeFactor = 1 + (Math.random() * 0.0045 - 0.002);
    const newPrice = Number((coin.price * changeFactor).toFixed(2));
    const newSparkline = [...coin.sparkline.slice(1), newPrice];
    const prevBasePrice = coin.sparkline[0];
    const change24h = Number((((newPrice - prevBasePrice) / prevBasePrice) * 100).toFixed(2));
    return {
      ...coin,
      price: newPrice,
      sparkline: newSparkline,
      change24h,
    };
  });

  // Drift gift card rates (minor fluctuation of ±₦3 occasionally)
  giftCards = giftCards.map(gc => {
    const shift = Math.floor(Math.random() * 7) - 3; // -3 to +3
    const newRate = Math.max(500, gc.rate + shift);
    const changeShift = Number((Math.random() * 0.4 - 0.2).toFixed(2));
    return {
      ...gc,
      rate: newRate,
      change24h: Number((gc.change24h + changeShift).toFixed(2))
    };
  });
};

// Periodically drift prices slightly on the server
setInterval(driftPrices, 45000);

// ------------------------------------------------------------------
// LAZY GEMINI USER-AGENT INITIALIZATION
// ------------------------------------------------------------------
let aiClientInstance: GoogleGenAI | null = null;

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // If key is undefined, we return null and handle it gracefully
    return null;
  }
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClientInstance;
}

// ------------------------------------------------------------------
// API ENDPOINTS
// ------------------------------------------------------------------

// 1. Get market dynamics
app.get("/api/market-rates", (req, res) => {
  driftPrices(); // Apply instant subtle drift on request for live impact
  res.json({
    timestamp: new Date().toISOString(),
    rates: cryptoMarket,
  });
});

// 2. Get accounts & balances
app.get("/api/accounts", (req, res) => {
  const cryptoData = Object.keys(cryptoBalances).map(symbol => {
    const marketCoin = cryptoMarket.find(c => c.symbol === symbol);
    const price = marketCoin ? marketCoin.price : 0.0;
    const balance = cryptoBalances[symbol];
    return {
      id: marketCoin ? marketCoin.id : symbol.toLowerCase(),
      symbol,
      name: marketCoin ? marketCoin.name : symbol,
      balance,
      price,
      change24h: marketCoin ? marketCoin.change24h : 0.0,
      sparkline: marketCoin ? marketCoin.sparkline : [0, 0, 0, 0, 0, 0, 0],
      fiatValue: Number((balance * price).toFixed(2)),
      color: marketCoin ? marketCoin.color : "gray",
      exchangeFeePercentage: (symbol === "BTC" || symbol === "ETH") ? 0.3 : 0.5,
    };
  });

  res.json({
    bankAccounts,
    cryptoBalances: cryptoData,
    totalPortfolioFiat: Number((
      bankAccounts.reduce((acc, b) => acc + b.balance, 0) +
      cryptoData.reduce((acc, c) => acc + c.fiatValue, 0)
    ).toFixed(2))
  });
});

// 3. Initiate Transfer (Bank account -> external local bank account)
app.post("/api/transfer", (req, res) => {
  const {
    sourceBankAccountId,
    recipientName,
    recipientBank,
    recipientAccount,
    recipientSortCode,
    amount,
    reference,
    twoFactorCode,
  } = req.body;

  if (twoFactor.enabled) {
    if (!twoFactorCode) {
      return res.status(403).json({ error: "2FA_REQUIRED", message: "Two-factor authentication code is required to authorize this bank transfer." });
    }
    if (!verifyTwoFactorCode(twoFactorCode)) {
      return res.status(400).json({ error: "INVALID_2FA_CODE", message: "The security verification code is incorrect or has expired. For sandbox evaluation, use: 123456" });
    }
  }

  if (!sourceBankAccountId || !recipientName || !recipientAccount || !recipientSortCode || !amount) {
    return res.status(400).json({ error: "Missing required bank transfer details." });
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid transfer amount." });
  }

  const bankAccIndex = bankAccounts.findIndex(acc => acc.id === sourceBankAccountId);
  if (bankAccIndex === -1) {
    return res.status(404).json({ error: "Source bank account not found." });
  }

  const sourceAccount = bankAccounts[bankAccIndex];
  if (sourceAccount.balance < amt) {
    return res.status(400).json({ error: "Insufficient funds in your account for this transfer." });
  }

  // Process transaction
  bankAccounts[bankAccIndex].balance = Number((sourceAccount.balance - amt).toFixed(2));
  
  const newTx = {
    id: `tx_${Date.now()}`,
    type: "TRANSFER" as const,
    date: new Date().toISOString(),
    status: "COMPLETED" as const,
    fiatAmount: amt,
    fee: 0.00,
    recipientName,
    recipientBank: recipientBank || "Local Clearing House",
    recipientAccount,
    recipientSortCode,
    reference: reference || "Bank Transfer",
    sourceBankAccountId,
  };

  transactions.unshift(newTx);

  res.json({
    success: true,
    message: "Bank transfer processed successfully.",
    transaction: newTx,
    updatedSourceAccount: bankAccounts[bankAccIndex],
  });
});

// Deposit simulator API
app.post("/api/accounts/deposit", (req, res) => {
  const { accountId, amount } = req.body;
  const bankIndex = bankAccounts.findIndex(a => a.id === accountId);
  if (bankIndex === -1) {
    return res.status(404).json({ error: "Bank account not found." });
  }
  const depositAmt = parseFloat(amount);
  if (isNaN(depositAmt) || depositAmt <= 0) {
    return res.status(400).json({ error: "Invalid deposit amount." });
  }
  
  bankAccounts[bankIndex].balance = Number((bankAccounts[bankIndex].balance + depositAmt).toFixed(2));
  
  const newTx = {
    id: `tx_dep_${Date.now()}`,
    type: "GIFTCARD" as const, // Rendered smoothly
    date: new Date().toISOString(),
    status: "COMPLETED" as const,
    fiatAmount: depositAmt,
    fee: 0,
    recipientName: "Lagos Treasury Ingress",
    recipientBank: bankAccounts[bankIndex].bankName,
    recipientAccount: bankAccounts[bankIndex].accountNumber,
    sourceBankAccountId: accountId
  };
  transactions.unshift(newTx);
  return res.json({ 
    status: "ok", 
    balance: bankAccounts[bankIndex].balance, 
    message: `Successfully deposited ₦${depositAmt.toLocaleString()} directly into your ${bankAccounts[bankIndex].bankName} balance!`
  });
});

// Decryption challenge reward dispatch API
app.post("/api/sandbox/quiz-reward", (req, res) => {
  const bankIndex = 0; // GTBank
  const rewardAmt = 150000.00;
  
  bankAccounts[bankIndex].balance = Number((bankAccounts[bankIndex].balance + rewardAmt).toFixed(2));
  
  const newTx = {
    id: `tx_reward_${Date.now()}`,
    type: "GIFTCARD" as const,
    date: new Date().toISOString(),
    status: "COMPLETED" as const,
    fiatAmount: rewardAmt,
    fee: 0,
    recipientName: "Safehouse Decrypter Bonus",
    recipientBank: bankAccounts[bankIndex].bankName,
    recipientAccount: bankAccounts[bankIndex].accountNumber,
    sourceBankAccountId: bankAccounts[bankIndex].id
  };
  transactions.unshift(newTx);
  return res.json({
    status: "ok",
    balance: bankAccounts[bankIndex].balance,
    message: `Excellent! You successfully solved the puzzle of the vault and claimed ₦150,000!`
  });
});

// 4. Crypto Swap or Exchange (Buy/Sell/Crypto-to-Crypto)
app.post("/api/exchange", (req, res) => {
  const {
    type, // 'BUY' | 'SELL' | 'SWAP'
    sourceAccountId, // For BUY (fiat bank account ID) or source crypto symbol
    targetAssetSymbol, // BTC, ETH, etc.
    fiatAmount, // For BUY/SELL
    cryptoAmount, // Swapping or standard amounts
    twoFactorCode,
  } = req.body;

  if (twoFactor.enabled) {
    if (!twoFactorCode) {
      return res.status(403).json({ error: "2FA_REQUIRED", message: "Two-factor authentication code is required to authorize this asset exchange." });
    }
    if (!verifyTwoFactorCode(twoFactorCode)) {
      return res.status(400).json({ error: "INVALID_2FA_CODE", message: "The security verification code is incorrect or has expired. For sandbox evaluation, use: 123456" });
    }
  }

  if (!type || !targetAssetSymbol) {
    return res.status(400).json({ error: "Missing exchange specifications." });
  }

  const marketCoin = cryptoMarket.find(c => c.symbol === targetAssetSymbol);
  if (!marketCoin) {
    return res.status(400).json({ error: `Cryptocurrency ${targetAssetSymbol} is not supported.` });
  }

  const currentPrice = marketCoin.price;

  // 1. BUY SCENARIO: Local bank account buys crypto
  if (type === "BUY") {
    if (!sourceAccountId || !fiatAmount) {
      return res.status(400).json({ error: "To buy crypto, specify fiat account and fiat amount." });
    }
    const bankIndex = bankAccounts.findIndex(b => b.id === sourceAccountId);
    if (bankIndex === -1) {
      return res.status(404).json({ error: "Associated fiat bank account not found." });
    }

    const fiatAmt = parseFloat(fiatAmount);
    if (isNaN(fiatAmt) || fiatAmt <= 0) {
      return res.status(400).json({ error: "Invalid fiat purchase amount." });
    }

    if (bankAccounts[bankIndex].balance < fiatAmt) {
      return res.status(400).json({ error: "Insufficient bank account balance to complete this purchase." });
    }

    // Deduct fiat & Add crypto
    const fee = Number((fiatAmt * 0.005).toFixed(2)); // 0.5% exchange fee
    const netPurchaseFiat = fiatAmt - fee;
    const boughtCryptoQty = Number((netPurchaseFiat / currentPrice).toFixed(6));

    bankAccounts[bankIndex].balance = Number((bankAccounts[bankIndex].balance - fiatAmt).toFixed(2));
    cryptoBalances[targetAssetSymbol] = Number(((cryptoBalances[targetAssetSymbol] || 0) + boughtCryptoQty).toFixed(6));

    const newTx = {
      id: `tx_${Date.now()}`,
      type: "BUY" as const,
      date: new Date().toISOString(),
      status: "COMPLETED" as const,
      assetSymbol: targetAssetSymbol,
      cryptoAmount: boughtCryptoQty,
      fiatAmount: fiatAmt,
      fee,
      sourceBankAccountId: sourceAccountId,
    };

    transactions.unshift(newTx);
    return res.json({
      success: true,
      message: `Successfully purchased ${boughtCryptoQty} ${targetAssetSymbol}`,
      transaction: newTx,
    });
  }

  // 2. SELL SCENARIO: Sell crypto for local fiat bank deposit
  if (type === "SELL") {
    if (!sourceAccountId || !cryptoAmount) {
      return res.status(400).json({ error: "To sell crypto, specify bank account destination and crypto quantity." });
    }

    const bankIndex = bankAccounts.findIndex(b => b.id === sourceAccountId);
    if (bankIndex === -1) {
      return res.status(404).json({ error: "Associated destination bank account not found." });
    }

    const sellQty = parseFloat(cryptoAmount);
    if (isNaN(sellQty) || sellQty <= 0) {
      return res.status(400).json({ error: "Invalid crypto sell quantity." });
    }

    const currentHoldings = cryptoBalances[targetAssetSymbol] || 0;
    if (currentHoldings < sellQty) {
      return res.status(400).json({ error: `Insufficient ${targetAssetSymbol} balance to fulfill this sale.` });
    }

    const grossFiat = sellQty * currentPrice;
    const fee = Number((grossFiat * 0.005).toFixed(2)); // 0.5% exchange fee
    const netDepositFiat = Number((grossFiat - fee).toFixed(2));

    // Deduct crypto, Add fiat
    cryptoBalances[targetAssetSymbol] = Number((currentHoldings - sellQty).toFixed(6));
    bankAccounts[bankIndex].balance = Number((bankAccounts[bankIndex].balance + netDepositFiat).toFixed(2));

    const newTx = {
      id: `tx_${Date.now()}`,
      type: "SELL" as const,
      date: new Date().toISOString(),
      status: "COMPLETED" as const,
      assetSymbol: targetAssetSymbol,
      cryptoAmount: sellQty,
      fiatAmount: grossFiat,
      fee,
      sourceBankAccountId: sourceAccountId,
    };

    transactions.unshift(newTx);
    return res.json({
      success: true,
      message: `Successfully sold ${sellQty} ${targetAssetSymbol} to deposit £${netDepositFiat} to your ${bankAccounts[bankIndex].bankName}`,
      transaction: newTx,
    });
  }

  // 3. SWAP SCENARIO: Swap source token for target token
  if (type === "SWAP") {
    const { sourceAssetSymbol } = req.body;
    if (!sourceAssetSymbol || !cryptoAmount) {
      return res.status(400).json({ error: "To swap tokens, specify a source asset and quantity." });
    }

    const sourceQty = parseFloat(cryptoAmount);
    if (isNaN(sourceQty) || sourceQty <= 0) {
      return res.status(400).json({ error: "Invalid token swap quantity value." });
    }

    const sourceHoldings = cryptoBalances[sourceAssetSymbol] || 0;
    if (sourceHoldings < sourceQty) {
      return res.status(400).json({ error: `Insufficient ${sourceAssetSymbol} balance to make this swap.` });
    }

    const sourceCoin = cryptoMarket.find(c => c.symbol === sourceAssetSymbol);
    if (!sourceCoin) {
      return res.status(400).json({ error: `Source asset ${sourceAssetSymbol} is unsupported.` });
    }

    const sourcePrice = sourceCoin.price;
    const totalSourceFiatValue = sourceQty * sourcePrice;
    const fee = Number((totalSourceFiatValue * 0.003).toFixed(2)); // Reduced 0.3% direct swap fee
    const netExchangeFiat = totalSourceFiatValue - fee;
    const targetQtyObtained = Number((netExchangeFiat / currentPrice).toFixed(6));

    // Execute swap
    cryptoBalances[sourceAssetSymbol] = Number((sourceHoldings - sourceQty).toFixed(6));
    cryptoBalances[targetAssetSymbol] = Number(((cryptoBalances[targetAssetSymbol] || 0) + targetQtyObtained).toFixed(6));

    const newTx = {
      id: `tx_${Date.now()}`,
      type: "SWAP" as const,
      date: new Date().toISOString(),
      status: "COMPLETED" as const,
      assetSymbol: sourceAssetSymbol,
      toAssetSymbol: targetAssetSymbol,
      cryptoAmount: sourceQty,
      fiatAmount: totalSourceFiatValue,
      fee,
    };

    transactions.unshift(newTx);
    return res.json({
      success: true,
      message: `Successfully swapped ${sourceQty} ${sourceAssetSymbol} to obtain ${targetQtyObtained} ${targetAssetSymbol}`,
      transaction: newTx,
    });
  }

  res.status(400).json({ error: "Unsupported exchange operation request." });
});

// 5. Get chronological transction logs
app.get("/api/transactions", (req, res) => {
  res.json({ transactions });
});

// 5b. Gift card integration endpoints
app.get("/api/giftcards", (req, res) => {
  res.json({ giftCards });
});

app.post("/api/giftcards/trade", (req, res) => {
  const { giftCardId, amountUsd, cardCode, payoutMethod, targetBankAccountId, twoFactorCode } = req.body;

  // Verify 2FA security status
  if (twoFactor.enabled) {
    if (!twoFactorCode) {
      return res.status(403).json({ error: "2FA_REQUIRED", message: "Two-factor authentication code is required to authorize this gift card trade." });
    }
    if (!verifyTwoFactorCode(twoFactorCode)) {
      return res.status(400).json({ error: "INVALID_2FA_CODE", message: "The code is incorrect or has expired. For sandbox evaluation, use: 123456" });
    }
  }

  const numericAmount = parseFloat(amountUsd);
  if (!giftCardId || isNaN(numericAmount) || numericAmount <= 0 || !cardCode) {
    return res.status(400).json({ error: "Please provide a valid gift card brand selection, amount in USD, and gift card serial/pin code." });
  }

  const card = giftCards.find(g => g.id === giftCardId);
  if (!card) {
    return res.status(404).json({ error: "Selected gift card type is not recognized." });
  }

  const rate = card.rate;
  const grossValNGN = rate * numericAmount;
  const processingFeeNGN = Number((grossValNGN * 0.005).toFixed(2)); // 0.5% minor handling fee
  const netValNGN = grossValNGN - processingFeeNGN;

  let payoutMsg = "";

  if (payoutMethod === "BANK") {
    const acc = bankAccounts.find(a => a.id === targetBankAccountId);
    if (!acc) {
      return res.status(400).json({ error: "Requested payout bank account was not found in your profile." });
    }
    acc.balance = Number((acc.balance + netValNGN).toFixed(2));
    payoutMsg = `₦${netValNGN.toLocaleString()} (with 0.5% exchange fee applied) has been deposited directly into your ${acc.bankName} balance.`;
  } else {
    // USDT payout
    const usdtCoin = cryptoMarket.find(c => c.symbol === "USDT");
    const usdtPrice = usdtCoin ? usdtCoin.price : 1530.00;
    const usdtAmount = Number((netValNGN / usdtPrice).toFixed(6));
    cryptoBalances.USDT = Number(((cryptoBalances.USDT || 0) + usdtAmount).toFixed(6));
    payoutMsg = `${usdtAmount.toFixed(6)} USDT was deposited directly into your Web3 USDT wallet.`;
  }

  const newTx = {
    id: `tx_gc_${Date.now()}`,
    type: "GIFTCARD" as any,
    date: new Date().toISOString(),
    status: "COMPLETED" as const,
    giftCardId,
    giftCardName: card.name,
    amountUsd: numericAmount,
    rate,
    fiatAmount: grossValNGN,
    fee: processingFeeNGN,
    recipientName: payoutMethod === "BANK" ? "Direct Cash Deposit" : "USDT Web3 Wallet",
    reference: `Sold $${numericAmount} ${card.name}`
  };

  transactions.unshift(newTx);

  return res.json({
    success: true,
    message: `Gift card trade successfully settled! ${payoutMsg}`,
    transaction: newTx
  });
});

// ------------------------------------------------------------------
// TWO-FACTOR AUTHENTICATION (2FA) SECURE MANAGEMENT ENDPOINTS
// ------------------------------------------------------------------

// GET /api/2fa/status - Read current user 2FA configuration
app.get("/api/2fa/status", (req, res) => {
  res.json({
    enabled: twoFactor.enabled,
    method: twoFactor.method,
    phoneNumber: twoFactor.phoneNumber ? `+234 *******${twoFactor.phoneNumber.slice(-4)}` : "",
    totpSecret: twoFactor.totpSecret,
    backupCodes: twoFactor.backupCodes,
  });
});

// POST /api/2fa/initiate-setup - Initiate authenticator app or SMS flow
app.post("/api/2fa/initiate-setup", (req, res) => {
  const { method, phoneNumber } = req.body;
  if (!method || (method !== "APP" && method !== "SMS")) {
    return res.status(400).json({ error: "Please specify a valid 2FA method ('APP' or 'SMS')." });
  }

  if (method === "SMS") {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      return res.status(400).json({ error: "Please enter a valid mobile phone number." });
    }
    // Generate a secure, simulated 6-digit numeric OTP code
    const generatedCode = "775599"; // Let's use a standard OTP for reliable ease of sandbox testing, customizable
    twoFactor.smsOtpCode = generatedCode;
    twoFactor.smsOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 min expiry
    
    console.log(`[sms-gateway] DISPATCHED security code [${generatedCode}] to device: ${phoneNumber}`);
    return res.json({
      success: true,
      message: "SMS verification code generated successfully.",
      smsGatewayLoggedCode: generatedCode, // Exposed for sandbox testing convenience in the UI
    });
  }

  if (method === "APP") {
    return res.json({
      success: true,
      totpSecret: twoFactor.totpSecret,
      otpauthUri: `otpauth://totp/CliperExchange:samson@cliper.exchange?secret=${twoFactor.totpSecret}&issuer=CliperExchange`,
      sandboxCode: "123456", // standard emulator code
    });
  }
});

// POST /api/2fa/verify-setup - Secure verification and activation
app.post("/api/2fa/verify-setup", (req, res) => {
  const { method, code, phoneNumber } = req.body;
  if (!method || !code) {
    return res.status(400).json({ error: "Verification code and target setup method are required." });
  }

  let verified = false;
  if (method === "APP") {
    // Treat 123456 or 888888 as valid sandbox responses
    if (code === "123456" || code === "888888") {
      verified = true;
    } else {
      return res.status(400).json({ error: "Invalid authenticator verification code. Please input 123456 to verify." });
    }
  } else if (method === "SMS") {
    if (code === "123456" || code === "888888" || (code === twoFactor.smsOtpCode && Date.now() < twoFactor.smsOtpExpiry)) {
      verified = true;
      twoFactor.smsOtpCode = ""; // consume
    } else {
      return res.status(400).json({ error: "The mobile verification code entered has expired or is incorrect. Try: 775599 or 123456" });
    }
  }

  if (verified) {
    twoFactor.enabled = true;
    twoFactor.method = method;
    if (method === "SMS" && phoneNumber) {
      twoFactor.phoneNumber = phoneNumber;
    }
    return res.json({
      success: true,
      message: `Two-factor authentication successfully enabled using ${method === 'APP' ? 'Authenticator App' : 'SMS text message'}.`,
      backupCodes: twoFactor.backupCodes,
    });
  }

  res.status(400).json({ error: "Failed to verify security credentials." });
});

// POST /api/2fa/disable - Disable 2FA with verification code
app.post("/api/2fa/disable", (req, res) => {
  const { code } = req.body;
  if (!twoFactor.enabled) {
    return res.status(400).json({ error: "Two-factor authentication is not currently enabled." });
  }

  let isCodeValid = false;
  if (code === "123456" || code === "888888") {
    isCodeValid = true;
  }

  // Backup codes also disable
  if (!isCodeValid && code) {
    const backupIdx = twoFactor.backupCodes.indexOf(code);
    if (backupIdx !== -1) {
      twoFactor.backupCodes.splice(backupIdx, 1);
      isCodeValid = true;
    }
  }

  if (!isCodeValid) {
    return res.status(400).json({ error: "Incorrect verification or backup code. Enter '123456' or a valid backup code." });
  }

  twoFactor.enabled = false;
  twoFactor.method = null;
  twoFactor.phoneNumber = "";
  return res.json({
    success: true,
    message: "Two-Factor authentication has been disabled. Asset movements are now gated by standard passwords only."
  });
});

// 6. Gemini Smart Financial Helper Integration
app.post("/api/gemini/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "A sequence of messages is required to process AI queries." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Graceful smart simulated fallback when API Key is missing, so the app does not break or crash
    console.warn("GEMINI_API_KEY environment variable is not defined. Initiating intelligent local mock helper.");
    
    // Simulate smart parsing & response
    const lastUserMsg = messages[messages.length - 1];
    const text = lastUserMsg ? lastUserMsg.content.toLowerCase() : "";
    let mockResponse = "";
    let suggestedAction = undefined;

    if (text.includes("transfer") || text.includes("send") || text.includes("pay")) {
      // Intelligently parse transfer values if found
      const amountMatch = text.match(/(?:₦|₵|R|sf|ngn)?\s*(\d+(\.\d{2})?)/);
      const parsedAmount = amountMatch ? amountMatch[1] : "50000.00";
      
      let parsedName = "Jane Doe";
      const names = ["alice", "bob", "john", "charlie", "sarah", "emma", "david", "james", "chinedu", "tunde", "kwame"];
      for (const n of names) {
        if (text.includes(n)) {
          parsedName = n.charAt(0).toUpperCase() + n.slice(1);
          break;
        }
      }

      mockResponse = `I see you want to initiate a cross-border or local bank transfer on Cliper. I've automatically parsed the details:
- **Recipient**: ${parsedName}
- **Suggested Amount**: ₦${Number(parsedAmount).toLocaleString()}
- **Routing Bank**: GTBank / Account: 0112345678

Would you like me to populate the transfer form details for you? I've attached a speed-fill command to this message. Please click the button below to apply this instantly!`;

      suggestedAction = {
        type: "FILL_TRANSFER" as const,
        data: {
          recipientName: parsedName,
          recipientBank: "Guaranty Trust Bank (GTBank)",
          recipientAccount: "0112345678",
          recipientSortCode: "058-150-13",
          amount: parsedAmount,
          reference: "Settlement parsed by Cliper AI Consultant",
          sourceBankAccountId: "acc_1",
        }
      };
    } else if (text.includes("btc") || text.includes("bitcoin") || text.includes("market") || text.includes("crypto") || text.includes("rate")) {
      mockResponse = `Based on current Cliper Exchange African liquidity rates:
- **Bitcoin (BTC)** is trending strong up **+3.42%** over the last 24 hours to **₦95,450,000.00**.
- **Solana (SOL)** is outperforming with an increase of **+8.94%** back to **₦240,000.00**.
- **Tether (USDT)** is holding highly stable at **₦1,530.00** matching exact regional P2P OTC ranges.
- **Ethereum (ETH)** is currently consolidating **-1.82%** to **₦4,970,000.00**.

*Disclaimer: This is simulated AI guidance. Always trade with caution.* Let me know if you want me to pre-fill a purchase setup for BTC or any other token!`;
    } else {
      mockResponse = `Greetings! I am your Cliper Exchange smart financial advisor.
      
Here is how I can expedite your cross-border and local banking operations:
1. **Natural Language Transfer Filling**: Simply tell me: *"Transfer ₦45,000 to Tunde for hosting"* or *"Pay kwame 150 GHS from my Ghana wallet"*. I'll extract recipient, amount, reference, and provide a single-click action to fill the form.
2. **AI Market Intelligence**: Ask me about the latest Naira (₦) rates, African currency corridors (GHS, KES, ZAR), or volume comparisons.
3. **African Carrier Routing**: Let me review destination bank details or transaction notes to flag common routing anomalies before processing.

How can I help you manage your funds on Cliper today?`;
    }

    return res.json({
      text: mockResponse,
      suggestedAction,
    });
  }

  try {
    // Current user state payload to ground Gemini's contextual logic
    const clientStateDescription = `
      You are the elite AI Master Consultant of Cliper Exchange, a premier Nigerian-based Web3 liquidity and digital asset ecosystem servicing Nigeria and expanding regional corridors like South Africa, Ghana, Kenya, and other African markets.
      The current time is ${new Date().toISOString()}.
      
      User Account context (Simulated State on backend):
      - User's actual name: Samson Adebayo
      - Local Bank/Wallet accounts available for transfers or crypto purchases:
        1. ID: "acc_1", Bank: "Guaranty Trust Bank (GTBank)", Country: "Nigeria", Balance: ₦${bankAccounts[0].balance.toLocaleString()}, Account: "0112345678", Sort/Routing Code: 058-150-13
        2. ID: "acc_2", Bank: "Access Bank PLC", Country: "Nigeria", Balance: ₦${bankAccounts[1].balance.toLocaleString()}, Account: "1023948577", Sort/Routing Code: 044-150-01
        3. ID: "acc_3", Bank: "MTN Mobile Money", Country: "Ghana", Balance: GH₵${bankAccounts[2].balance.toLocaleString()}, Account: "0244112233", Sort/Routing Code: MTN-GHA
        4. ID: "acc_4", Bank: "Standard Bank Ltd", Country: "South Africa", Balance: R${bankAccounts[3].balance.toLocaleString()}, Account: "2087654321", Sort/Routing Code: 051-122
      - Cryptocurrency wallet holdings in Cliper Web3 vault:
        - BTC Balance: ${cryptoBalances.BTC} BTC (approx. ₦${(cryptoBalances.BTC * cryptoMarket[0].price).toLocaleString()})
        - ETH Balance: ${cryptoBalances.ETH} ETH (approx. ₦${(cryptoBalances.ETH * cryptoMarket[1].price).toLocaleString()})
        - USDT Balance: ${cryptoBalances.USDT} USDT (approx. ₦${(cryptoBalances.USDT * cryptoMarket[2].price).toLocaleString()})
        - SOL Balance: ${cryptoBalances.SOL} SOL (approx. ₦${(cryptoBalances.SOL * cryptoMarket[3].price).toLocaleString()})
      - Current Real-Time Cliper Naira Exchange rates:
        ${cryptoMarket.map(c => '- ' + c.name + ' (' + c.symbol + '): ₦' + c.price.toLocaleString() + ' (' + c.change24h + '% in 24h)').join('\n')}
      - Current Real-Time Gift Card Rates (to trade/sell for Naira/USDT):
        ${giftCards.map(g => '- ' + g.name + ': ₦' + g.rate + '/$ (' + g.demand + ' Demand, ' + g.change24h + '% 24h)').join('\n')}

      CRITICAL SYSTEM RULES & INSTRUCTIONS:
      1. Always speak clearly, helpfully, and objectively. Maintain professional composure with no fluff or extreme emojis.
      2. If the user asks to "transfer", "pay", "send money to", "wire", or express intent to execute a local bank/mobile wallet transfer, you MUST analyze the user's prompt, parse the details, and output a structured pre-fill suggestion.
         - You can suggest a FILL_TRANSFER action. To do this, specify a JSON block or hint that we can prefill the form.
         - For our code to automatically parse the response, we will check if you output a precise suggestedAction.
         - You do NOT write raw code; instead, always format a JSON block at the end of your response inside a block tagged with \`\`\`json-transfer-action \`\`\`.
         - The format of code-action block MUST look exactly like:
           {\n  "type": "FILL_TRANSFER",\n  "data": {\n    "recipientName": "Parsed Holder Name",\n    "recipientBank": "Parsed Bank Name or Best Guess",\n    "recipientAccount": "Numeric account identifier if found, else empty",\n    "recipientSortCode": "Sort code or routing key, else empty",\n    "amount": "parsed numerical amount string or empty",\n    "reference": "parsed transfer memo or empty",\n    "sourceBankAccountId": "acc_1" or "acc_2" based on preference\n  }\n}
      3. If the user asks for crypto market analysis, provide a helpful summary with active prices (primarily in Nigerian Naira NGN) and percentage changes based on the user data above. State that Cliper Exchange enables easy access for other Africans with local rails (e.g. MTN MoMo in Ghana, Standard Bank in South Africa, dynamic conversion details).
      4. If the user asks about gift cards or gift card rates, provide accurate rates based on the gift card rates given above and guide them to use the "Trade Gift Cards" tab for instant payouts in Cash or USDT.
      5. Always use literal human terms. Write responses in Markdown. No tech jargon about database layers or container ports.
    `;

    // Map conversation logs to standard Gemini structure
    // Translate client role list to Gemini model parts
    const contentParts = messages.map(msg => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction: clientStateDescription,
        temperature: 0.3,
      }
    });

    const replyText = response.text || "I was unable to process your request. How can I assist you with your transactions?";
    
    // Parse if there is an embedded JSON transfer action in the response
    let parsedAction = undefined;
    const actionRegex = /```json-transfer-action\s*([\s\S]*?)\s*```/;
    const match = replyText.match(actionRegex);
    if (match && match[1]) {
      try {
        parsedAction = JSON.parse(match[1].trim());
      } catch (err) {
        console.error("Failed to parse AI action payload:", err);
      }
    }

    res.json({
      text: replyText.replace(actionRegex, ""), // Clean action tag from direct chat display
      suggestedAction: parsedAction,
    });

  } catch (error: any) {
    console.error("Gemini server-side error:", error);
    res.status(500).json({ error: "Communication to the Gemini gateway failed. Please try again." });
  }
});

// Vite middleware & Production path routing handler
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server mounted as Express middleware. HMR is handled client-side.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving pre-compiled static production files from dist directory.");
  }

  // Bind to 0.0.0.0 (necessary for Cloud Run ingress route)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running and listening on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failure bootstrapping the full-stack server instance:", err);
  process.exit(1);
});
