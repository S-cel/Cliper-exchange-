/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  RefreshCcw, 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  Bot, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Wallet, 
  History, 
  Sparkles, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Check,
  Info,
  Lock,
  Fingerprint,
  Phone,
  ShieldAlert,
  QrCode,
  KeyRound,
  X,
  Shield,
  Gift,
  Eye,
  EyeOff,
  Bell,
  Search,
  Star,
  Award,
  Trophy,
  Play,
  Cpu,
  ChevronRight
} from "lucide-react";
import Header from "./components/Header";
import { Cryptocurrency, BankAccount, Transaction, ChatMessage, GiftCard } from "./types";

export default function App() {
  // Navigation & tabs state
  const [activeTab, setActiveTab] = useState<string>("market");

  // Persistent Dark / Light Mode state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("cliper-theme");
      return (saved as "light" | "dark") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cliper-theme", theme);
    } catch {}
    
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
      document.body.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
      document.body.classList.remove("light-mode");
    }
  }, [theme]);

  // Server state data
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<Cryptocurrency[]>([]);
  const [totalPortfolioFiat, setTotalPortfolioFiat] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingMainData, setIsLoadingMainData] = useState<boolean>(true);

  // Active form trades state
  const [selectedBuyCoin, setSelectedBuyCoin] = useState<Cryptocurrency | null>(null);
  const [selectedSellCoin, setSelectedSellCoin] = useState<Cryptocurrency | null>(null);
  
  // Bank transfer form state
  const [transferSourceId, setTransferSourceId] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientBank, setRecipientBank] = useState<string>("");
  const [recipientAccount, setRecipientAccount] = useState<string>("");
  const [recipientSortCode, setRecipientSortCode] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferReference, setTransferReference] = useState<string>("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferFieldErrors, setTransferFieldErrors] = useState<Record<string, string>>({});
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState<boolean>(false);
  const [showTransferSuccess, setShowTransferSuccess] = useState<Transaction | null>(null);

  // Token Swap form state
  const [swapSourceSymbol, setSwapSourceSymbol] = useState<string>("USDT");
  const [swapTargetSymbol, setSwapTargetSymbol] = useState<string>("BTC");
  const [swapAmount, setSwapAmount] = useState<string>("");
  const [swapError, setSwapError] = useState<string | null>(null);
  const [isSubmittingSwap, setIsSubmittingSwap] = useState<boolean>(false);
  const [showSwapSuccess, setShowSwapSuccess] = useState<string | null>(null);

  // Interactive instant Buy/Sell state modal/drawers
  const [buySourceAccountId, setBuySourceAccountId] = useState<string>("");
  const [buyFiatAmount, setBuyFiatAmount] = useState<string>("");
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccessMsg, setBuySuccessMsg] = useState<string | null>(null);
  const [isSubmittingBuy, setIsSubmittingBuy] = useState<boolean>(false);

  const [sellDestAccountId, setSellDestAccountId] = useState<string>("");
  const [sellCryptoAmount, setSellCryptoAmount] = useState<string>("");
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellSuccessMsg, setSellSuccessMsg] = useState<string | null>(null);
  const [isSubmittingSell, setIsSubmittingSell] = useState<boolean>(false);
  const [showCryptoSellConfirmation, setShowCryptoSellConfirmation] = useState<{
    coinSymbol: string;
    coinName: string;
    amount: number;
    calculatedProceeds: number;
    destinationAcc: { bankName: string; accountNumber: string; currency: string };
  } | null>(null);

  // Gift Card trade states
  const [giftCardsList, setGiftCardsList] = useState<GiftCard[]>([]);
  const [selectedGiftCardId, setSelectedGiftCardId] = useState<string>("apple");
  const [giftCardAmountUsd, setGiftCardAmountUsd] = useState<string>("");
  const [giftCardCode, setGiftCardCode] = useState<string>("");
  const [giftCardPayoutMethod, setGiftCardPayoutMethod] = useState<"BANK" | "USDT">("BANK");
  const [giftCardTargetBankId, setGiftCardTargetBankId] = useState<string>("");
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [giftCardSuccessMsg, setGiftCardSuccessMsg] = useState<string | null>(null);
  const [isSubmittingGiftCard, setIsSubmittingGiftCard] = useState<boolean>(false);

  // Transaction History filter states
  const [historyFilter, setHistoryFilter] = useState<string>("ALL");
  const [historySearch, setHistorySearch] = useState<string>("");

  // Gemini assistant helper chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Welcome, Samson! I am Aura's Smart Financial Copilot. I can pre-fill London Faster Payments forms directly using natural language or help you audit crypto market rates for any arbitrage risk. Try telling me standard prompts like: **'I want to send 120 pounds to Sarah Jenkins for food expense'**.",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [userChatInput, setUserChatInput] = useState<string>("");
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quick action copilot active payload
  const [activeSuggestedAction, setActiveSuggestedAction] = useState<any | null>(null);

  // Clipboard copies
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Two-Factor Authentication (2FA) UI states
  const [twoFactorStatus, setTwoFactorStatus] = useState<{
    enabled: boolean;
    method: "APP" | "SMS" | null;
    phoneNumber: string;
    totpSecret: string;
    backupCodes: string[];
  } | null>(null);

  const [twoFactorPromptFor, setTwoFactorPromptFor] = useState<{
    type: 'TRANSFER' | 'BUY' | 'SELL' | 'SWAP';
    message: string;
    onSubmit: (code: string) => Promise<boolean>;
  } | null>(null);

  const [twoFactorPromptCode, setTwoFactorPromptCode] = useState<string>("");
  const [twoFactorPromptError, setTwoFactorPromptError] = useState<string | null>(null);

  // 2FA Management Setup state variables
  const [twoFactorSetupMethod, setTwoFactorSetupMethod] = useState<"APP" | "SMS" | null>(null);
  const [twoFactorSetupPhone, setTwoFactorSetupPhone] = useState<string>("");
  const [twoFactorSetupStep, setTwoFactorSetupStep] = useState<"INITIAL" | "VERIFY" | "SUCCESS">("INITIAL");
  const [twoFactorSetupSecret, setTwoFactorSetupSecret] = useState<string>("");
  const [twoFactorSetupUri, setTwoFactorSetupUri] = useState<string>("");
  const [twoFactorSetupCode, setTwoFactorSetupCode] = useState<string>("");
  const [twoFactorSetupError, setTwoFactorSetupError] = useState<string | null>(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState<boolean>(false);
  const [twoFactorSmsGatewayNotice, setTwoFactorSmsGatewayNotice] = useState<string | null>(null);

  // 2FA Disable state variables
  const [twoFactorDisableOpen, setTwoFactorDisableOpen] = useState<boolean>(false);
  const [twoFactorDisableCode, setTwoFactorDisableCode] = useState<string>("");
  const [twoFactorDisableError, setTwoFactorDisableError] = useState<string | null>(null);

  // --- BYBIT INTERACTIVE REDESIGN STATE DRIVERS ---
  const [isAssetsHidden, setIsAssetsHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cliper-assets-hidden") === "true";
    } catch {
      return false;
    }
  });
  
  const [currencyPreference, setCurrencyPreference] = useState<"USD" | "NGN">("USD");
  const [tickerFilter, setTickerFilter] = useState<string>("HOT");
  const [tickerSubFilter, setTickerSubFilter] = useState<string>("Spot");
  const [favoritedCoins, setFavoritedCoins] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cliper-starred");
      return saved ? JSON.parse(saved) : ["BTC", "USDT"];
    } catch {
      return ["BTC", "USDT"];
    }
  });

  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showStakingModal, setShowStakingModal] = useState<boolean>(false);
  const [showPuzzleHuntMiniGame, setShowPuzzleHuntMiniGame] = useState<boolean>(false);
  const [showBotTerminal, setShowBotTerminal] = useState<boolean>(false);

  // Rewards & promotion actions
  const [claimedGiftIndex, setClaimedGiftIndex] = useState<number | null>(null);
  const [claimedRewardMsg, setClaimedRewardMsg] = useState<string | null>(null);

  // Bot states
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const [isBotActivelyTrading, setIsBotActivelyTrading] = useState<boolean>(false);

  // Puzzle minigame states
  const [puzzleAnswer, setPuzzleAnswer] = useState<string>("CLI3000");
  const [puzzleInput, setPuzzleInput] = useState<string>("");
  const [puzzleOutcome, setPuzzleOutcome] = useState<"IDLE" | "SUCCESS" | "FAILED">("IDLE");
  const [puzzleFeedbackMsg, setPuzzleFeedbackMsg] = useState<string>("");
  const [tickerSearch, setTickerSearch] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem("cliper-assets-hidden", String(isAssetsHidden));
    } catch {}
  }, [isAssetsHidden]);

  useEffect(() => {
    try {
      localStorage.setItem("cliper-starred", JSON.stringify(favoritedCoins));
    } catch {}
  }, [favoritedCoins]);

  // Fetch baseline accounts & transactions from backend
  const fetchData = async () => {
    try {
      const accountsRes = await fetch("/api/accounts");
      const accountsData = await accountsRes.json();
      
      setBankAccounts(accountsData.bankAccounts || []);
      const mappedBalances = (accountsData.cryptoBalances || []).map((coin: any) => ({
        ...coin,
        exchangeFeePercentage: coin.exchangeFeePercentage ?? ((coin.symbol === "BTC" || coin.symbol === "ETH") ? 0.3 : 0.5)
      }));
      setCryptoAssets(mappedBalances);
      setTotalPortfolioFiat(accountsData.totalPortfolioFiat || 0);

      // Extract details to preset source drop-downs if empty
      if (accountsData.bankAccounts && accountsData.bankAccounts.length > 0) {
        if (!transferSourceId) setTransferSourceId(accountsData.bankAccounts[0].id);
        if (!buySourceAccountId) setBuySourceAccountId(accountsData.bankAccounts[0].id);
        if (!sellDestAccountId) setSellDestAccountId(accountsData.bankAccounts[0].id);
        if (!giftCardTargetBankId) setGiftCardTargetBankId(accountsData.bankAccounts[0].id);
      }

      const gcRes = await fetch("/api/giftcards");
      if (gcRes.ok) {
        const gcData = await gcRes.json();
        setGiftCardsList(gcData.giftCards || []);
      }

      const txRes = await fetch("/api/transactions");
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);

      // Synchronize Two-Factor Authentication configuration status
      const tfRes = await fetch("/api/2fa/status");
      if (tfRes.ok) {
        const tfData = await tfRes.json();
        setTwoFactorStatus(tfData);
      }
    } catch (err) {
      console.error("Error communicating with localized back-end nodes:", err);
    } finally {
      setIsLoadingMainData(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll the node market rates every 15 seconds to simulate living market trends
    const tInterval = setInterval(fetchData, 15000);
    return () => clearInterval(tInterval);
  }, []);

  // Sync scroll chat to end on active replies
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

  // ------------------------------------------------------------------
  // TWO-FACTOR AUTHENTICATION (2FA) SECURE WORKFLOW HANDLERS
  // ------------------------------------------------------------------

  const handleInitiate2FASetup = async (method: "APP" | "SMS") => {
    setTwoFactorLoading(true);
    setTwoFactorSetupError(null);
    setTwoFactorSmsGatewayNotice(null);
    try {
      const res = await fetch("/api/2fa/initiate-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          phoneNumber: method === "SMS" ? twoFactorSetupPhone : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFactorSetupError(data.error || "Failed to initialize 2FA configuration.");
      } else {
        setTwoFactorSetupMethod(method);
        if (method === "APP") {
          setTwoFactorSetupSecret(data.totpSecret);
          setTwoFactorSetupUri(data.otpauthUri);
          setTwoFactorSetupStep("VERIFY");
        } else {
          setTwoFactorSetupStep("VERIFY");
          setTwoFactorSmsGatewayNotice(
            `SECURE SMS GATEWAY: Code generated successfully! Use code: ${data.smsGatewayLoggedCode}`
          );
        }
      }
    } catch {
      setTwoFactorSetupError("Failed to communicate with setup servers.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FASetup = async () => {
    if (!twoFactorSetupCode) {
      setTwoFactorSetupError("Please input the 6-digit confirmation code.");
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorSetupError(null);
    try {
      const res = await fetch("/api/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: twoFactorSetupMethod,
          code: twoFactorSetupCode,
          phoneNumber: twoFactorSetupMethod === "SMS" ? twoFactorSetupPhone : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFactorSetupError(data.error || "The combination code entered was not verified.");
      } else {
        setTwoFactorSetupStep("SUCCESS");
        fetchData(); // reload status
      }
    } catch {
      setTwoFactorSetupError("Failed to verify configuration with exchange servers.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFactorDisableCode) {
      setTwoFactorDisableError("A security authorization or emergency backup code is required to deactivate 2FA.");
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorDisableError(null);
    try {
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorDisableCode })
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFactorDisableError(data.error || "Could not de-authenticate code.");
      } else {
        setTwoFactorDisableOpen(false);
        setTwoFactorDisableCode("");
        fetchData(); // reload
      }
    } catch {
      setTwoFactorDisableError("Deactivation network request refused.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleResetSetupState = () => {
    setTwoFactorSetupMethod(null);
    setTwoFactorSetupStep("INITIAL");
    setTwoFactorSetupPhone("");
    setTwoFactorSetupCode("");
    setTwoFactorSetupError(null);
    setTwoFactorSmsGatewayNotice(null);
  };

  // Execute Local Bank Transfer
  const handleBankTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferFieldErrors({});
    setShowTransferSuccess(null);

    const errors: Record<string, string> = {};

    if (!transferSourceId) {
      errors.transferSourceId = "A sender debit source account is required. Please select an active bank account.";
    }

    if (!recipientName.trim()) {
      errors.recipientName = "Recipient Full Name is required. Please provide the first and last name of the recipient (e.g. Sarah Jenkins).";
    }

    const cleanSortCode = recipientSortCode.replace(/[^0-9]/g, "");
    if (!recipientSortCode.trim()) {
      errors.recipientSortCode = "Routing / Sort Code is required. Please input the 6-digit destination bank code (e.g. 20-45-85).";
    } else if (cleanSortCode.length !== 6) {
      errors.recipientSortCode = `Incorrect Sort Code length. You provided a ${cleanSortCode.length}-digit code. To process, the UK Sort Code must contain exactly 6 numbers (e.g. 20-45-85).`;
    }

    const cleanAccount = recipientAccount.replace(/[^0-9]/g, "");
    if (!recipientAccount.trim()) {
      errors.recipientAccount = "Account Number is required. Please provide the destination bank account number.";
    } else if (cleanAccount.length !== 8) {
      errors.recipientAccount = `Incorrect Account Number length. You provided an ${cleanAccount.length}-digit value. UK standard bank account numbers must consist of exactly 8 numbers.`;
    }

    const numericAmount = parseFloat(transferAmount);
    if (!transferAmount) {
      errors.transferAmount = "Transfer amount is required. Please specify how much currency you would like to send.";
    } else if (isNaN(numericAmount) || numericAmount <= 0) {
      errors.transferAmount = "Please enter a valid numeric amount greater than zero (e.g. 150.00).";
    } else {
      const selectedAcc = bankAccounts.find(a => a.id === transferSourceId);
      if (selectedAcc && selectedAcc.balance < numericAmount) {
        errors.transferAmount = `Insufficient funds. Your selected ${selectedAcc.bankName} account currently has a balance of ${selectedAcc.symbol || "₦"}${selectedAcc.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}, which is less than the requested ${selectedAcc.symbol || "₦"}${numericAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setTransferFieldErrors(errors);
      setTransferError("There was an issue processing your transfer request. Please fix the specific validation errors highlighted below.");
      return;
    }

    const executeTransfer = async (twoFactorCode?: string): Promise<boolean> => {
      setIsSubmittingTransfer(true);
      try {
        const res = await fetch("/api/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceBankAccountId: transferSourceId,
            recipientName,
            recipientBank: recipientBank || "Destination Institution",
            recipientAccount: cleanAccount,
            recipientSortCode: `${cleanSortCode.slice(0, 2)}-${cleanSortCode.slice(2, 4)}-${cleanSortCode.slice(4, 6)}`,
            amount: numericAmount,
            reference: transferReference,
            twoFactorCode,
          }),
        });

        const responseData = await res.json();
        if (!res.ok) {
          if (responseData.error?.includes("2FA") || responseData.error === "2FA_REQUIRED" || responseData.error === "INVALID_2FA_CODE") {
            setTwoFactorPromptError(responseData.message || "Invalid 2FA security code.");
            return false;
          }
          setTransferError(responseData.error || "The bank infrastructure returned a protocol error.");
          return true;
        } else {
          setShowTransferSuccess(responseData.transaction);
          // Reset inputs
          setRecipientName("");
          setRecipientBank("");
          setRecipientAccount("");
          setRecipientSortCode("");
          setTransferAmount("");
          setTransferReference("");
          setTransferFieldErrors({});
          fetchData(); // Sync live balances
          return true;
        }
      } catch (err) {
        setTransferError("Network request failure. Cliper Settlement Gateway is unresponsive.");
        return true;
      } finally {
        setIsSubmittingTransfer(false);
      }
    };

    const targetAcc = bankAccounts.find(a => a.id === transferSourceId);
    const currencySymbol = targetAcc?.symbol || "₦";

    if (twoFactorStatus?.enabled) {
      setTwoFactorPromptError(null);
      setTwoFactorPromptCode("");
      setTwoFactorPromptFor({
        type: "TRANSFER",
        message: `Authorize transfer of ${currencySymbol}${numericAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} to ${recipientName} (${cleanAccount}, ${cleanSortCode})`,
        onSubmit: async (code) => {
          return await executeTransfer(code);
        }
      });
    } else {
      await executeTransfer();
    }
  };

  // Execute Direct Crypto Purchase (BUY)
  const handleCryptoBuySubmit = async (coinSymbol: string) => {
    setBuyError(null);
    setBuySuccessMsg(null);

    const numericAmount = parseFloat(buyFiatAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setBuyError("Please specify a positive fiat sum to exchange.");
      return;
    }

    const selectedAcc = bankAccounts.find(a => a.id === buySourceAccountId);
    if (selectedAcc && selectedAcc.balance < numericAmount) {
      setBuyError(`Insufficient funds in your ${selectedAcc.bankName} account.`);
      return;
    }

    const executeBuy = async (twoFactorCode?: string): Promise<boolean> => {
      setIsSubmittingBuy(true);
      try {
        const res = await fetch("/api/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "BUY",
            sourceAccountId: buySourceAccountId,
            targetAssetSymbol: coinSymbol,
            fiatAmount: numericAmount,
            twoFactorCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.error?.includes("2FA") || data.error === "2FA_REQUIRED" || data.error === "INVALID_2FA_CODE") {
            setTwoFactorPromptError(data.message || "Invalid 2FA security code.");
            return false;
          }
          setBuyError(data.error || "Purchase processing error.");
          return true;
        } else {
          setBuySuccessMsg(`Order Completed! Added ${data.transaction.cryptoAmount.toFixed(6)} ${coinSymbol} to your secure wallet.`);
          setBuyFiatAmount("");
          setSelectedBuyCoin(null);
          fetchData(); // Sync state
          return true;
        }
      } catch (err) {
        setBuyError("Unable to route order to server memory node.");
        return true;
      } finally {
        setIsSubmittingBuy(false);
      }
    };

    if (twoFactorStatus?.enabled) {
      setTwoFactorPromptError(null);
      setTwoFactorPromptCode("");
      setTwoFactorPromptFor({
        type: "BUY",
        message: `Authorize purchase of ${coinSymbol} using ${selectedAcc?.symbol || "₦"}${numericAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} from ${selectedAcc?.bankName || "fiat balance"}`,
        onSubmit: async (code) => {
          return await executeBuy(code);
        }
      });
    } else {
      await executeBuy();
    }
  };

  // Prepare Direct Crypto Sale (Show Confirmation Modal)
  const prepareCryptoSell = (coinSymbol: string) => {
    setSellError(null);
    setSellSuccessMsg(null);

    const holding = cryptoAssets.find(c => c.symbol === coinSymbol);
    const holdingBalance = holding ? holding.balance : 0;

    const numericAmount = parseFloat(sellCryptoAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setSellError(`Please provide a positive amount of ${coinSymbol} to liquidate.`);
      return;
    }

    if (holdingBalance < numericAmount) {
      setSellError(`Your current hot-wallet contains only ${holdingBalance} ${coinSymbol}.`);
      return;
    }

    const selectedDestAcc = bankAccounts.find(a => a.id === sellDestAccountId);
    if (!selectedDestAcc) {
      setSellError("Please select a destination bank account for the proceeds.");
      return;
    }

    setShowCryptoSellConfirmation({
      coinSymbol,
      coinName: holding?.name || coinSymbol,
      amount: numericAmount,
      calculatedProceeds: numericAmount * (holding?.price || 0) * 0.995,
      destinationAcc: {
        bankName: selectedDestAcc.bankName,
        accountNumber: selectedDestAcc.accountNumber,
        currency: selectedDestAcc.currency || "NGN"
      }
    });
  };

  // Execute Direct Crypto Sale (SELL)
  const handleCryptoSellSubmit = async (coinSymbol: string) => {
    setSellError(null);
    setSellSuccessMsg(null);

    const holding = cryptoAssets.find(c => c.symbol === coinSymbol);
    const holdingBalance = holding ? holding.balance : 0;

    const numericAmount = parseFloat(sellCryptoAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setSellError(`Please provide a positive amount of ${coinSymbol} to liquidate.`);
      return;
    }

    if (holdingBalance < numericAmount) {
      setSellError(`Your current hot-wallet contains only ${holdingBalance} ${coinSymbol}.`);
      return;
    }

    const selectedDestAcc = bankAccounts.find(a => a.id === sellDestAccountId);

    const executeSell = async (twoFactorCode?: string): Promise<boolean> => {
      setIsSubmittingSell(true);
      try {
        const res = await fetch("/api/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "SELL",
            sourceAccountId: sellDestAccountId,
            targetAssetSymbol: coinSymbol,
            cryptoAmount: numericAmount,
            twoFactorCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.error?.includes("2FA") || data.error === "2FA_REQUIRED" || data.error === "INVALID_2FA_CODE") {
            setTwoFactorPromptError(data.message || "Invalid 2FA security code.");
            return false;
          }
          setSellError(data.error || "Liquidation error.");
          return true;
        } else {
          setSellSuccessMsg(`Sale Completed! Sold ${numericAmount} ${coinSymbol}. Proceeds deposited directly to your selected bank.`);
          setSellCryptoAmount("");
          setSelectedSellCoin(null);
          fetchData();
          return true;
        }
      } catch (err) {
        setSellError("Could not transmit order packet to exchange engines.");
        return true;
      } finally {
        setIsSubmittingSell(false);
      }
    };

    if (twoFactorStatus?.enabled) {
      setTwoFactorPromptError(null);
      setTwoFactorPromptCode("");
      setTwoFactorPromptFor({
        type: "SELL",
        message: `Authorize liquidation/sale of ${numericAmount} ${coinSymbol} to deposit proceeds to ${selectedDestAcc?.bankName || "your bank account"}`,
        onSubmit: async (code) => {
          return await executeSell(code);
        }
      });
    } else {
      await executeSell();
    }
  };

  // Execute Instant Crypto Swap (Crypto to Crypto)
  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwapError(null);
    setShowSwapSuccess(null);

    if (swapSourceSymbol === swapTargetSymbol) {
      setSwapError("Source asset can not match target swap asset.");
      return;
    }

    const numericAmount = parseFloat(swapAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setSwapError("Please enter a valid positive token quantity.");
      return;
    }

    const sourceAsset = cryptoAssets.find(c => c.symbol === swapSourceSymbol);
    const walletBalance = sourceAsset ? sourceAsset.balance : 0;
    if (walletBalance < numericAmount) {
      setSwapError(`Insufficient ${swapSourceSymbol} in your wallet (Holding: ${walletBalance}).`);
      return;
    }

    const executeSwap = async (twoFactorCode?: string): Promise<boolean> => {
      setIsSubmittingSwap(true);
      try {
        const res = await fetch("/api/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "SWAP",
            sourceAssetSymbol: swapSourceSymbol,
            targetAssetSymbol: swapTargetSymbol,
            cryptoAmount: numericAmount,
            twoFactorCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.error?.includes("2FA") || data.error === "2FA_REQUIRED" || data.error === "INVALID_2FA_CODE") {
            setTwoFactorPromptError(data.message || "Invalid 2FA security code.");
            return false;
          }
          setSwapError(data.error || "Direct swap matching engine returned an error.");
          return true;
        } else {
          setShowSwapSuccess(`Swapped ${numericAmount} ${swapSourceSymbol} successfully to target ${swapTargetSymbol}. Check your updated balances above!`);
          setSwapAmount("");
          fetchData(); // Sync live balances
          return true;
        }
      } catch (err) {
        setSwapError("Protocol timed out without settling network ledger.");
        return true;
      } finally {
        setIsSubmittingSwap(false);
      }
    };

    if (twoFactorStatus?.enabled) {
      setTwoFactorPromptError(null);
      setTwoFactorPromptCode("");
      setTwoFactorPromptFor({
        type: "SWAP",
        message: `Authorize Instant Token Swap of ${numericAmount} ${swapSourceSymbol} into ${swapTargetSymbol}`,
        onSubmit: async (code) => {
          return await executeSwap(code);
        }
      });
    } else {
      await executeSwap();
    }
  };

  // Submit Gift Card Trade order for processing
  const handleGiftCardSubmit = async (e: React.FormEvent, twoFactorCode?: string): Promise<boolean> => {
    e.preventDefault();
    setGiftCardError(null);
    setGiftCardSuccessMsg(null);

    const amountNum = parseFloat(giftCardAmountUsd);
    if (isNaN(amountNum) || amountNum <= 0) {
      setGiftCardError("Please enter a valid gift card value in USD.");
      return false;
    }

    if (!giftCardCode.trim()) {
      setGiftCardError("Please type a valid gift card pin/claim code or secure reference.");
      return false;
    }

    const runCardTrade = async (code2FA?: string): Promise<boolean> => {
      setIsSubmittingGiftCard(true);
      try {
        const res = await fetch("/api/giftcards/trade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftCardId: selectedGiftCardId,
            amountUsd: amountNum,
            cardCode: giftCardCode,
            payoutMethod: giftCardPayoutMethod,
            targetBankAccountId: giftCardTargetBankId,
            twoFactorCode: code2FA
          })
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.error === "2FA_REQUIRED" || data.error === "INVALID_2FA_CODE") {
            setTwoFactorPromptError(data.message || "Invalid or missing 2FA code.");
            return false;
          }
          setGiftCardError(data.error || "The gift card settlement node returned an error.");
          return true; // resolve modal
        } else {
          setGiftCardSuccessMsg(data.message);
          setGiftCardCode("");
          setGiftCardAmountUsd("");
          fetchData(); // Sync live accounts & transactions
          return true; // resolve modal
        }
      } catch (err) {
        setGiftCardError("Gift card protocol node failed to respond. Please try again.");
        return true; // resolve modal
      } finally {
        setIsSubmittingGiftCard(false);
      }
    };

    if (twoFactorStatus?.enabled && !twoFactorCode) {
      setTwoFactorPromptError(null);
      setTwoFactorPromptCode("");
      setTwoFactorPromptFor({
        type: "SELL",
        message: `Authorize Gift Card Trade: Sell $${amountNum} of ${giftCardsList.find(c => c.id === selectedGiftCardId)?.name || "Gift Card"} for instantaneous payout.`,
        onSubmit: async (code) => {
          return await runCardTrade(code);
        }
      });
      return false;
    } else {
      return await runCardTrade(twoFactorCode);
    }
  };

  // Submit message to Gemini Smart Copilot Server Bridge
  const handleSendMessageToAI = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = presetPrompt || userChatInput;
    if (!promptToSend.trim()) return;

    // Push User message and reset
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: promptToSend,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!presetPrompt) setUserChatInput("");
    setIsChatTyping(true);
    setActiveSuggestedAction(null);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...chatMessages, userMsg] // send complete state logs for model context
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setChatMessages(prev => [
          ...prev, 
          {
            id: `err_${Date.now()}`,
            role: "model",
            content: "I connected to the secure local processor but encountered a routing barrier. Please verify your system parameters under Settings.",
            timestamp: new Date().toISOString(),
          }
        ]);
      } else {
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: "model",
          content: data.text,
          timestamp: new Date().toISOString(),
          suggestedAction: data.suggestedAction,
        };
        setChatMessages(prev => [...prev, aiMsg]);
        
        // Expose parsed suggestion action block for premium interactive widget click
        if (data.suggestedAction) {
          setActiveSuggestedAction(data.suggestedAction);
        }
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev, 
        {
          id: `err_${Date.now()}`,
          role: "model",
          content: "Sorry, I am having trouble contacting Aura's secure API cloud at the moment. Please verify server connectivity.",
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Process AI Speed fill action button click
  const handleApplyAISuggestedTransfer = (actionData: any) => {
    setActiveTab("transfer");
    if (actionData.recipientName) setRecipientName(actionData.recipientName);
    if (actionData.recipientBank) setRecipientBank(actionData.recipientBank);
    if (actionData.recipientAccount) setRecipientAccount(actionData.recipientAccount);
    if (actionData.recipientSortCode) setRecipientSortCode(actionData.recipientSortCode);
    if (actionData.amount) setTransferAmount(actionData.amount);
    if (actionData.reference) setTransferReference(actionData.reference);
    if (actionData.sourceBankAccountId) setTransferSourceId(actionData.sourceBankAccountId);

    // Provide dynamic feedback
    setActiveSuggestedAction(null);
  };

  // Trigger quick presets in Chat interface to guide user
  const handleTriggerPreset = (promptText: string) => {
    handleSendMessageToAI(undefined, promptText);
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, txId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 1500);
  };

  // Gift Card Icon dynamic helper
  const getGiftCardIcon = (iconName: string) => {
    switch (iconName) {
      case "Apple": return <Gift className="w-5 h-5 text-rose-400" />;
      case "Gamepad2": return <Gift className="w-5 h-5 text-purple-400" />;
      case "Play": return <Gift className="w-5 h-5 text-emerald-400" />;
      case "Zap": return <Gift className="w-5 h-5 text-amber-400" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-yellow-500" />;
      default: return <Gift className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Currency helper (defaults to NGN)
  const formatGBP = (val: number, currencyCode: string = "NGN") => {
    try {
      return new Intl.NumberFormat(currencyCode === "NGN" ? "en-NG" : "en-US", {
        style: "currency",
        currency: currencyCode,
      }).format(val);
    } catch {
      const sym = currencyCode === "NGN" ? "₦" : (currencyCode === "GHS" ? "GH₵" : (currencyCode === "ZAR" ? "R" : "₦"));
      return `${sym}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Percentage helper
  const renderPercent = (val: number) => {
    const isPositive = val >= 0;
    return (
      <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
        isPositive ? "bg-emerald-950/70 text-emerald-400" : "bg-rose-950/70 text-rose-400"
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {isPositive ? "+" : ""}{val.toFixed(2)}%
      </span>
    );
  };

  // Filter Transaction historical list
  const filteredTxs = transactions.filter(tx => {
    if (historyFilter !== "ALL" && tx.type !== historyFilter) return false;
    if (historySearch) {
      const searchTarget = `
        ${tx.assetSymbol || ""} 
        ${tx.toAssetSymbol || ""} 
        ${tx.recipientName || ""} 
        ${tx.recipientBank || ""} 
        ${tx.reference || ""}
      `.toLowerCase();
      return searchTarget.includes(historySearch.toLowerCase());
    }
    return true;
  });

  return (
    <div id="aura-terminal" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Header Bar */}
      <Header 
        bankAccounts={bankAccounts} 
        totalPortfolioFiat={totalPortfolioFiat} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cryptoAssets={cryptoAssets}
        setSelectedBuyCoin={setSelectedBuyCoin}
        setSelectedSellCoin={setSelectedSellCoin}
        setSelectedGiftCardId={setSelectedGiftCardId}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Two-Column Dynamic Dashboard Cockpit */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Modular Transaction & Trading Desk (7 Cols on Large screen) */}
        <section id="desk-module" className="lg:col-span-7 space-y-6 flex flex-col min-h-[500px]">
          
          {/* 1. MARKETS & LIVE COINS TAB */}
          {activeTab === "market" && (
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              
              {/* SEGMENT 1: User Profile & Quick Search Node */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  {/* 1. App Profile Mascot Thumbnail */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-orange-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-slate-800">
                        🤖
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider leading-none mb-0.5">Aura Account</span>
                      <span className="text-xs font-bold text-white block">Samson Adebayo</span>
                    </div>
                  </div>

                  {/* 2. Interactive Search well */}
                  <div className="flex-grow max-w-sm relative min-w-[150px]">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search HYPE / USDT or asset..."
                      value={tickerSearch}
                      onChange={(e) => setTickerSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/55 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all font-medium"
                    />
                    {tickerSearch && (
                      <button onClick={() => setTickerSearch("")} className="absolute right-3 inset-y-0 text-slate-400 hover:text-white text-xs">Clear</button>
                    )}
                  </div>

                  {/* 3. Action Badges and Icons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        alert("Web3 QR Node Reader active. Point camera at local London FPS or NIPS code node for sandbox settlements.");
                      }}
                      className="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 hover:text-white rounded-xl text-slate-400 transition-all cursor-pointer relative group"
                      title="Scan QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="absolute hidden group-hover:block bottom-10 left-1/2 -translate-x-1/2 bg-slate-950 text-[9px] text-slate-200 px-2 py-0.5 rounded border border-slate-850 whitespace-nowrap z-30">Scan QR</span>
                    </button>

                    <button 
                      onClick={() => setShowRewardsModal(true)}
                      className="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 hover:text-white rounded-xl text-amber-500 animate-pulse transition-all cursor-pointer relative"
                      title="Claim Hub Rewards"
                    >
                      <Gift className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                    </button>

                    <button 
                      onClick={() => {
                        alert("Security Broadcast: 20 incoming OTC fast cleared settlements completed successfully in past 2 hours. Tap Aura Assistant to inspect logs.");
                      }}
                      className="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 hover:text-white rounded-xl text-slate-400 transition-all cursor-pointer relative"
                      title="Alert Feed"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-[9px] text-white font-extrabold px-1 rounded-full h-4 min-w-[16px] flex items-center justify-center border border-slate-950 shadow-md">
                        20
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BRAND REDESIGN: Total Portfolio Asset display card with Eye Toggles */}
              <div className="mb-6 p-6 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/90 rounded-2xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Background ambient noise/glowing graph effects resembling mockup */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                <div className="absolute right-12 bottom-0 w-24 h-16 opacity-10 border-b border-r border-dashed border-indigo-400 pointer-events-none" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Total Assets Valuation
                    </span>
                    <button 
                      onClick={() => setIsAssetsHidden(!isAssetsHidden)}
                      className="text-slate-500 hover:text-white p-1 hover:bg-slate-850 rounded transition-all cursor-pointer"
                      title={isAssetsHidden ? "Show details" : "Hide details"}
                    >
                      {isAssetsHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex bg-slate-900 border border-slate-850 p-0.5 rounded-lg select-all">
                      <button 
                        onClick={() => setCurrencyPreference("USD")} 
                        className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded ${currencyPreference === "USD" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                      >
                        USD
                      </button>
                      <button 
                        onClick={() => setCurrencyPreference("NGN")} 
                        className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded ${currencyPreference === "NGN" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                      >
                        NGN
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white block">
                      {isAssetsHidden ? (
                        "••••••"
                      ) : currencyPreference === "USD" ? (
                        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalPortfolioFiat / 1530)
                      ) : (
                        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(totalPortfolioFiat)
                      )}
                      {!isAssetsHidden && <span className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-2">{currencyPreference}</span>}
                    </span>

                    <div className="flex items-center gap-2 select-all">
                      <span className="text-xs text-slate-400">Today's P&L:</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +$1,425.04 USD (+1.34%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Golden Orange high contrast deposit button next to balance */}
                <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
                  <button 
                    onClick={() => setShowDepositModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-[#0c0c0e] font-sans font-black text-sm px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Deposit Funds</span>
                    <ArrowDownLeft className="w-4 h-4 font-extrabold" />
                  </button>

                  <button 
                    onClick={() => setActiveTab("transfer")}
                    className="p-3.5 bg-slate-800 hover:bg-slate-755 border border-slate-700 rounded-full text-slate-200 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Send NIP Cash</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SEGMENT 2: Channels & OTC Operations Suite */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-400" /> OTC Operational Channels
                  </h3>
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase bg-slate-955 border border-slate-805 px-2 py-0.5 rounded font-mono tracking-wider">Active</span>
                </div>

                {/* BRAND REDESIGN: Quick access modular circle grid matrix (bybit-like) */}
                <div className="grid grid-cols-4 gap-4 bg-slate-950/40 border border-slate-805 p-4 rounded-2xl">
                  
                  {/* 1. Earn */}
                  <button 
                    onClick={() => setShowStakingModal(true)}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md transition-all group-hover:bg-slate-850">
                      <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform text-indigo-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">Cliper Earn</span>
                  </button>

                  {/* 2. Card */}
                  <button 
                    onClick={() => {
                      alert("Cliper Web3 NIP Instant Settlement Cards connected. To withdraw or bind primary physical corridor card, trigger NIP settlement drawers in the Account manager.");
                    }}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-emerald-400 shadow-md transition-all group-hover:bg-slate-850">
                      <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform text-emerald-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">Fast Card</span>
                  </button>

                  {/* 3. Rewards Hub */}
                  <button 
                    onClick={() => setShowRewardsModal(true)}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md transition-all group-hover:bg-slate-850 relative">
                      <Gift className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-500 animate-bounce" />
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-[8px] text-white font-black px-1 rounded-full border border-slate-900 leading-none py-0.5">CLAIM</span>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">Rewards Hub</span>
                  </button>

                  {/* 4. Trading Bot */}
                  <button 
                    onClick={() => {
                      setShowBotTerminal(!showBotTerminal);
                      if (!isBotActivelyTrading) {
                        setIsBotActivelyTrading(true);
                        setBotLogs(prev => [...prev, "🚀 Starting Cliper OTC Arbitrage bot node...", "⏳ Fetching live GTBank Naira liquidity books...", "⏳ Analyzing spread vs South African ZAR corridor..."]);
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer relative"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md transition-all group-hover:bg-slate-850">
                      <Bot className="w-5 h-5 group-hover:scale-110 transition-transform text-purple-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">Trading Bot</span>
                    <span className="absolute -top-1 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-[8px] font-black uppercase text-[#050505] px-1 rounded-md py-0.5 border border-slate-900 leading-none scale-90">
                      HOT
                    </span>
                  </button>

                  {/* 5. Deposit Node */}
                  <button 
                    onClick={() => setShowDepositModal(true)}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md transition-all group-hover:bg-slate-850">
                      <ArrowDownLeft className="w-5 h-5 group-hover:scale-110 transition-transform text-indigo-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">Deposit</span>
                  </button>

                  {/* 6. P2P Trading */}
                  <button 
                    onClick={() => {
                      setActiveTab("swap");
                      alert("Switched to instant exchange desk. Trade core pairs like USDT/NGN instantly at zero-slippage OTC rates.");
                    }}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md transition-all group-hover:bg-slate-850">
                      <ArrowRightLeft className="w-5 h-5 group-hover:scale-110 transition-transform text-yellow-500" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">P2P Trading</span>
                  </button>

                  {/* 7. Gift Cards Node */}
                  <button 
                    onClick={() => {
                      setActiveTab("giftcards");
                    }}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md transition-all group-hover:bg-slate-850">
                      <Award className="w-5 h-5 group-hover:scale-110 transition-transform text-sky-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">Gift Cards</span>
                  </button>

                  {/* 8. Show More */}
                  <button 
                    onClick={() => {
                      alert("Cliper Master Product Suite: 1. Spot trading pools, 2. Nigeria Instant Payout settling routes, 3. Ghana Mobile Money gateways, 4. South African Fast Clearing networks, 5. Two-factor TOTP authorization keys. Click appropriate visual sections of dashboard to trigger daily action panels.");
                    }}
                    className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md transition-all group-hover:bg-slate-850">
                      <span className="text-xs font-extrabold text-slate-400 group-hover:text-white transition-colors">•••</span>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-300">More</span>
                  </button>
                </div>
              </div>

              {/* BRAND REDESIGN: Promos Banners (Stockholm Open & Lagos S1 Grand Prix) */}
              <div 
                className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/65 via-indigo-900/40 to-slate-900 border border-indigo-900/25 relative overflow-hidden group select-all hover:border-indigo-500/40 transition-all cursor-pointer"
                onClick={() => {
                  alert("Live OTC TradeMasters Cup info: You are currently ranked #10 in the West Africa NIP Settlement volume tier. Keep trading to gain extra yield bonuses!");
                }}
              >
                <div className="absolute top-0 right-0 py-1.5 px-3 bg-indigo-600/80 text-white font-extrabold text-[8px] uppercase tracking-widest rounded-bl-xl border-l border-b border-indigo-900/30">
                  VIP Program
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-amber-400 rounded-2xl text-white shadow-lg flex-shrink-0">
                    <Trophy className="w-8 h-8 text-white animate-bounce-slow" />
                  </div>
                  <div className="space-y-1 pr-12">
                    <h3 className="text-sm font-extrabold text-white leading-tight group-hover:text-indigo-300 transition-colors">
                      TradeMasters Grand Prix S1: Cliper Lagos Open 2026 Edition
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Lodge zero-slippage P2P trades. Climb leaderboard list nodes to unlock instant NIP cashback vouchers. Explore details &rarr;
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-slate-400">
                  2 / 6
                </div>
              </div>

              {/* BRAND REDESIGN: Duo Bento grid (Easy Earn & Puzzle Hunt minigame) */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Bento Box 1: Easy Earn Staking Promo */}
                <div 
                  onClick={() => setShowStakingModal(true)}
                  className="p-4 bg-slate-950/60 hover:bg-slate-900 border border-slate-805 hover:border-slate-700/80 rounded-2xl flex flex-col justify-between min-h-[140px] transition-all duration-300 relative cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Fixed APY Vaults</span>
                    <h4 className="text-xs font-black text-white flex items-center justify-between">
                      <span>Easy Earn Pools</span>
                      <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[9px] font-mono leading-none font-bold">Guaranteed</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Leverage locked staking accounts. Claim yield drops on core balance nodes.
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-[10px] text-slate-550 block leading-none">HIGH APR YIELD</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">14.2% APY &rarr;</span>
                    </div>
                    <div className="p-1 px-2.5 bg-slate-900 border border-slate-800 rounded bg-indigo-900/10 text-xs font-bold font-mono text-amber-500">
                      BTC & USDT
                    </div>
                  </div>
                </div>

                {/* Bento Box 2: Gamified Puzzle Hunt Safe cracker */}
                <div 
                  onClick={() => setShowPuzzleHuntMiniGame(true)}
                  className="p-4 bg-slate-950/60 hover:bg-slate-900 border border-slate-805 hover:border-slate-750 rounded-2xl flex flex-col justify-between min-h-[140px] transition-all duration-300 relative cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest animate-pulse">Game event</span>
                      <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-mono leading-none font-black font-sans uppercase">SOLVE</span>
                    </div>
                    <h4 className="text-xs font-black text-white">
                      Vault Decryption Puzzle Hunt
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Crack the sandbox cryptographic padlock. Input winning code to trigger a fast bank ledger deposit.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-850/45">
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-none">REWARD DISPATCH</span>
                      <span className="text-base font-black text-amber-400 font-mono uppercase">Earn 300,000 USDT</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1">
                      <span>MNT &gt;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEGMENT 3: Core Spot Markets Liquidity Ledger */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Web3 Liquidity Ledger rates
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">Lagos & London real-time offramp ticker lines</p>
                  </div>
                  <button 
                    onClick={fetchData} 
                    className="p-1.5 px-3 rounded-lg text-xs font-bold text-slate-330 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                  >
                    Sync Live Nodes
                  </button>
                </div>

                {/* Filter Ticker Tab list from design screenshot */}
                <div className="mb-3.5 flex items-center gap-1 border-b border-slate-850 pb-2 overflow-x-auto text-[11px] font-black uppercase text-slate-400 select-none">
                  {["Favorites", "HOT", "New", "Gainers", "Losers"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTickerFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer font-black ${
                        tickerFilter === tab ? "bg-slate-850 text-white border border-slate-750" : "hover:text-white"
                      }`}
                    >
                      {tab === "Favorites" ? `⭐ Favorites (${favoritedCoins.length})` : tab}
                    </button>
                  ))}
                </div>

                {/* Sub-Filters strip: Spot, Futures, Lagos OTC */}
                <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  {["Spot", "Futures", "Lagos OTC", "Instant Clearing"].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setTickerSubFilter(sub)}
                      className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                        tickerSubFilter === sub ? "border-indigo-500/50 bg-indigo-950/20 text-indigo-400" : "border-slate-850 hover:text-slate-300"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {isLoadingMainData ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-450 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-xs font-semibold">Initiating real-time offramp pricing ledger...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      // Modify live crypto assets array to inject HYPE coin as shown in search HYPE/USDT mockup
                      const customHypeAsset: Cryptocurrency = {
                        id: "hype",
                        symbol: "HYPE",
                        name: "HyperLiquid Spot",
                        balance: 1420.50,
                        price: 15.42,
                        change24h: 142.50, // Huge growth to show on new/gainers!
                        sparkline: [2, 5, 8, 12, 19, 28, 42, 75, 142.5],
                        fiatValue: 21904.11,
                        color: "indigo",
                        exchangeFeePercentage: 0.5
                      };

                      // Map assets list
                      let currentList = [...cryptoAssets];
                      // check if HYPE is already there, otherwise insert
                      if (!currentList.some(c => c.symbol === "HYPE")) {
                        currentList.push(customHypeAsset);
                      }

                      // Apply search filter
                      if (tickerSearch) {
                        currentList = currentList.filter(coin => 
                          coin.symbol.toLowerCase().includes(tickerSearch.toLowerCase()) ||
                          coin.name.toLowerCase().includes(tickerSearch.toLowerCase())
                        );
                      }

                      // Apply Favorite filter
                      if (tickerFilter === "Favorites") {
                        currentList = currentList.filter(coin => favoritedCoins.includes(coin.symbol));
                      } else if (tickerFilter === "Gainers") {
                        currentList = currentList.sort((a,b) => b.change24h - a.change24h);
                      } else if (tickerFilter === "Losers") {
                        currentList = currentList.sort((a,b) => a.change24h - b.change24h);
                      } else if (tickerFilter === "New") {
                        currentList = currentList.filter(coin => coin.symbol === "HYPE");
                      }

                      if (currentList.length === 0) {
                        return (
                          <div className="py-8 text-center text-slate-500 text-xs">
                            No assets matching "{tickerFilter}" are active in this sub-corridor.
                          </div>
                        );
                      }

                      return currentList.map((coin) => (
                        <div 
                          key={coin.symbol} 
                          className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 hover:border-slate-750 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            
                            {/* Left: Star & Ticker metadata */}
                            <div className="flex items-center gap-3">
                              {/* Star Toggle icon */}
                              <button 
                                onClick={() => {
                                  const alreadyFav = favoritedCoins.includes(coin.symbol);
                                  if (alreadyFav) {
                                    setFavoritedCoins(favoritedCoins.filter(s => s !== coin.symbol));
                                  } else {
                                    setFavoritedCoins([...favoritedCoins, coin.symbol]);
                                  }
                                }}
                                className="p-1 hover:bg-slate-900 rounded-lg text-slate-600 hover:text-amber-400 transition-colors cursor-pointer"
                                title={favoritedCoins.includes(coin.symbol) ? "Remove from Favorites" : "Add to Favorites"}
                              >
                                <Star className={`w-4 h-4 ${favoritedCoins.includes(coin.symbol) ? "fill-amber-400 text-amber-500" : "text-slate-600"}`} />
                              </button>

                              <div className={`p-2.5 rounded-xl font-black text-[10px] ring-2 ring-slate-900 tracking-wider text-white ${
                                coin.symbol === "BTC" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                coin.symbol === "ETH" ? "bg-indigo-555/10 text-indigo-400 border border-indigo-500/20" :
                                coin.symbol === "USDT" ? "bg-emerald-555/10 text-emerald-400 border border-emerald-500/20" :
                                coin.symbol === "SOL" ? "bg-purple-555/10 text-purple-400 border border-purple-500/20" : "bg-indigo-950/30 text-indigo-450 border border-indigo-500/10"
                              }`}>
                                {coin.symbol}
                              </div>
                              <div>
                                <span className="text-xs font-black text-white flex items-center gap-1.5 leading-none">
                                  {coin.name}
                                  <span className="text-[10px] text-slate-500 font-bold">/ NGN</span>
                                </span>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1 select-all">
                                  <span>Holding: <strong className="text-slate-200 font-mono">{coin.balance} {coin.symbol}</strong></span>
                                  <span>• Value: <strong className="text-slate-200">{formatGBP(coin.fiatValue, "NGN")}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Center Sparkline SVG graph */}
                            <div className="w-24 h-8 self-center select-none">
                              <svg className="w-full h-full" viewBox="0 0 100 30">
                                <polyline
                                  fill="none"
                                  stroke={coin.change24h >= 0 ? "#10b981" : "#f43f5e"}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={(coin.sparkline || []).map((p, i) => {
                                    const min = Math.min(...(coin.sparkline || [0]));
                                    const max = Math.max(...(coin.sparkline || [0]));
                                    const spread = max - min || 1;
                                    const x = (i / ((coin.sparkline || []).length - 1 || 1)) * 100;
                                    const y = 30 - ((p - min) / spread) * 26 - 2;
                                    return `${x},${y}`;
                                  }).join(" ")}
                                />
                              </svg>
                            </div>

                            {/* Right Pricing read-out & buy swap hotkeys */}
                            <div className="flex items-center justify-between sm:justify-end gap-5">
                              <div className="text-left sm:text-right">
                                <span className="text-sm font-black font-mono text-white block select-all">
                                  {formatGBP(coin.price, "NGN")}
                                </span>
                                {renderPercent(coin.change24h)}
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (coin.symbol === "HYPE") {
                                      alert("HyperLiquid Spot Sandbox Trade: Place OTC trade with Aura block orders for sandbox pricing spreads.");
                                      return;
                                    }
                                    setSelectedBuyCoin(coin);
                                    setSelectedSellCoin(null);
                                    setBuyError(null);
                                    setBuySuccessMsg(null);
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
                                >
                                  Buy
                                </button>
                                <button
                                  onClick={() => {
                                    if (coin.symbol === "HYPE") {
                                      alert("HyperLiquid Spot Sandbox Trade: Liquidation nodes for HYPE/NGN swap active in West African sandbox corridors.");
                                      return;
                                    }
                                    setSelectedSellCoin(coin);
                                    setSelectedBuyCoin(null);
                                    setSellError(null);
                                    setSellSuccessMsg(null);
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
                                >
                                  Sell
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expansion Buy Drawer: (FPS Swap and settlements remaining inline & working flawlessly) */}
                          {selectedBuyCoin?.symbol === coin.symbol && (
                            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-indigo-500/30 animate-fade-in text-xs space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                <h4 className="font-bold text-white uppercase flex items-center gap-1">
                                  <span className="p-1 rounded bg-indigo-950 text-indigo-400">FPS Swap</span> 
                                  Buy {coin.name} instantly using Cash Balance
                                </h4>
                                <button 
                                  onClick={() => setSelectedBuyCoin(null)} 
                                  className="text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                                <div>
                                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                    Funding Bank Account Source
                                  </label>
                                  <select
                                    value={buySourceAccountId}
                                    onChange={(e) => setBuySourceAccountId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-medium text-slate-200 outline-none focus:border-indigo-500 text-xs text-white"
                                  >
                                    {bankAccounts.map(a => (
                                      <option key={a.id} value={a.id}>
                                        {a.bankName} (Avail: {a.symbol || "₦"}{a.balance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  {(() => {
                                    const selectedAcc = bankAccounts.find(a => a.id === buySourceAccountId);
                                    const sym = selectedAcc?.symbol || "₦";
                                    const cur = selectedAcc?.currency || "NGN";
                                    return (
                                      <>
                                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                          Order Amount ({cur} {sym})
                                        </label>
                                        <div className="relative">
                                          <span className="absolute left-3 top-2 text-slate-550 text-xs font-bold">{sym}</span>
                                          <input
                                            type="number"
                                            placeholder="e.g. 25000"
                                            value={buyFiatAmount}
                                            onChange={(e) => setBuyFiatAmount(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 pl-7 font-mono text-white outline-none focus:border-indigo-500 text-sm"
                                          />
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>

                              {buyFiatAmount && !isNaN(parseFloat(buyFiatAmount)) && parseFloat(buyFiatAmount) > 0 && (
                                <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-805 text-[11px] text-slate-400 flex justify-between">
                                  <span>Estimated purchase yield:</span>
                                  <strong className="text-white font-mono">
                                    {((parseFloat(buyFiatAmount) * 0.995) / (coin.price || 1)).toFixed(6)} {coin.symbol}
                                  </strong>
                                </div>
                              )}

                              {buyError && <p className="text-rose-400 font-semibold">{buyError}</p>}
                              {buySuccessMsg && <p className="text-emerald-400 font-semibold">{buySuccessMsg}</p>}

                              <button
                                onClick={() => handleCryptoBuySubmit(coin.symbol)}
                                disabled={isSubmittingBuy}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500/90 text-white font-bold rounded-lg text-xs tracking-wider uppercase disabled:opacity-50 transition-all cursor-pointer"
                              >
                                {isSubmittingBuy ? "Broadcasting Settlement Ticket..." : "Confirm Purchase Rate & Execute"}
                              </button>
                            </div>
                          )}

                          {/* Expansion Sell Drawer: (Liquidate core nodes directly to Bank Account remaining inline & working) */}
                          {selectedSellCoin?.symbol === coin.symbol && (
                            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-teal-500/30 animate-fade-in text-xs space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                <h4 className="font-bold text-white uppercase flex items-center gap-1">
                                  <span className="p-1 rounded bg-teal-950 text-teal-400">Cash-Out</span>
                                  Liquidate {coin.name} directly to Bank Account
                                </h4>
                                <button 
                                  onClick={() => setSelectedSellCoin(null)} 
                                  className="text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                                <div>
                                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                    Deposit Destination Bank Account
                                  </label>
                                  <select
                                    value={sellDestAccountId}
                                    onChange={(e) => setSellDestAccountId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-medium text-slate-200 outline-none focus:border-teal-500 text-white"
                                  >
                                    {bankAccounts.map(a => (
                                      <option key={a.id} value={a.id}>{a.bankName} (A/C: *{a.accountNumber.slice(-4)})</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                    Sell Quantity ({coin.symbol})
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      step="any"
                                      placeholder={`Max: ${coin.balance}`}
                                      value={sellCryptoAmount}
                                      onChange={(e) => setSellCryptoAmount(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white outline-none focus:border-teal-500 text-sm"
                                    />
                                    <button 
                                      onClick={() => setSellCryptoAmount(coin.balance.toString())}
                                      className="absolute right-2 top-2 px-1.5 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-[10px] text-indigo-400 font-bold"
                                    >
                                      Max
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {sellCryptoAmount && !isNaN(parseFloat(sellCryptoAmount)) && parseFloat(sellCryptoAmount) > 0 && (
                                <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-805 text-[11px] text-slate-400 flex justify-between">
                                  <span>Projected bank cash credit list:</span>
                                  <strong className="text-white font-mono">
                                    {formatGBP(parseFloat(sellCryptoAmount) * coin.price * 0.995, "NGN")}
                                  </strong>
                                </div>
                              )}

                              {sellError && <p className="text-rose-400 font-semibold">{sellError}</p>}
                              {sellSuccessMsg && <p className="text-emerald-400 font-semibold">{sellSuccessMsg}</p>}

                              <button
                                onClick={() => prepareCryptoSell(coin.symbol)}
                                disabled={isSubmittingSell}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500/90 text-white font-bold rounded-lg text-xs tracking-wider uppercase disabled:opacity-50 transition-all cursor-pointer"
                              >
                                {isSubmittingSell ? "Settling liquidity ledger..." : "Process Liquidate Order"}
                              </button>
                            </div>
                          )}

                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* SEGMENT 4 (ADDED): Cliper NIP Fast Routing & Node Health Grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      Cliper NIP Fast Routing Node Health
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">Real-time status of cross-border sandbox settlement relays</p>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                    Router Load: 12%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-all">
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">Nigeria (GTB Node)</span>
                    <span className="text-emerald-400 font-black block">● Live (5.2ms)</span>
                    <span className="text-[9px] text-slate-400 block font-sans">99.98% uptime node</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-all">
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">Ghana (MTN MoMo)</span>
                    <span className="text-emerald-400 font-black block">● Live (12.1ms)</span>
                    <span className="text-[9px] text-slate-400 block font-sans">99.95% uptime node</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-all">
                    <span className="text-slate-500 block uppercase font-bold text-[9px]">Kenya (M-Pesa Edge)</span>
                    <span className="text-emerald-400 font-black block">● Live (8.4ms)</span>
                    <span className="text-[9px] text-slate-400 block font-sans">99.99% uptime node</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-all">
                    <span className="text-slate-400 block uppercase font-bold text-[9px] text-amber-500">UK FPS Clearing</span>
                    <span className="text-amber-400 font-black block">● Queued (48ms)</span>
                    <span className="text-[9px] text-slate-400 block font-sans">Re-balancing ledger pool</span>
                  </div>
                </div>
              </div>

              {/* Secure note */}
              <div className="mt-6 border-t border-slate-800 pt-4 flex gap-3 text-xs text-slate-400 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <p>
                  Aura uses fully collateralized Web3 and West African NIP liquidity pools. Instant settlements comply with local safety requirements and central banker clearing policies. Capital risk disclosure notes apply.
                </p>
              </div>
            </div>
          )}


          {/* 2. BANK TRANSFER FORM TAB */}
          {activeTab === "transfer" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-indigo-400" /> UK Local Bank Transfer (Faster Payments)
                    </h2>
                    <p className="text-xs text-slate-400">Instantly wire fiat currency to local banks with zero settlement delay</p>
                  </div>
                  <span className="text-xs bg-indigo-950/80 text-indigo-400 border border-indigo-900 p-1 px-3 rounded-full font-mono font-semibold">
                    FPS Network Active
                  </span>
                </div>

                <form onSubmit={handleBankTransferSubmit} className="space-y-4">
                  
                  {/* Sender Account */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 text-slate-350">
                      Debit Source Account / Available Funds
                    </label>
                    <select
                      value={transferSourceId}
                      onChange={(e) => {
                        setTransferSourceId(e.target.value);
                        if (transferFieldErrors.transferSourceId) {
                          setTransferFieldErrors(prev => {
                            const copy = { ...prev };
                            delete copy.transferSourceId;
                            return copy;
                          });
                        }
                      }}
                      className={`w-full bg-slate-950 border rounded-xl p-3 text-sm font-medium text-slate-200 outline-none focus:border-indigo-500 transition-colors ${
                        transferFieldErrors.transferSourceId ? "border-rose-500/80 focus:border-rose-500" : "border-slate-800"
                      }`}
                    >
                      {bankAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.bankName} — A/C: {acc.accountNumber} — Balance: {formatGBP(acc.balance, acc.currency)}
                        </option>
                      ))}
                    </select>
                    {transferFieldErrors.transferSourceId && (
                      <p className="text-rose-450 text-[11px] font-medium mt-1 select-none animate-fadeIn">{transferFieldErrors.transferSourceId}</p>
                    )}
                  </div>

                  {/* Recipient Account Details Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 text-slate-350">
                        Recipient Full Name / Holder Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        required
                        value={recipientName}
                        onChange={(e) => {
                          setRecipientName(e.target.value);
                          if (transferFieldErrors.recipientName) {
                            setTransferFieldErrors(prev => {
                              const copy = { ...prev };
                              delete copy.recipientName;
                              return copy;
                            });
                          }
                        }}
                        className={`w-full bg-slate-950 border rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors ${
                          transferFieldErrors.recipientName ? "border-rose-500/80 focus:border-rose-500" : "border-slate-805"
                        }`}
                      />
                      {transferFieldErrors.recipientName && (
                        <p className="text-rose-450 text-[11px] font-medium mt-1 select-none animate-fadeIn">{transferFieldErrors.recipientName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 text-slate-350">
                        Recipient Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lloyds Bank (Optional)"
                        value={recipientBank}
                        onChange={(e) => setRecipientBank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 text-slate-350">
                        Bank Code / Routing *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 011234 or 204585"
                        maxLength={10}
                        required
                        value={recipientSortCode}
                        onChange={(e) => {
                          setRecipientSortCode(e.target.value);
                          if (transferFieldErrors.recipientSortCode) {
                            setTransferFieldErrors(prev => {
                              const copy = { ...prev };
                              delete copy.recipientSortCode;
                              return copy;
                            });
                          }
                        }}
                        className={`w-full bg-slate-950 border rounded-xl p-3 text-sm font-mono text-white outline-none focus:border-indigo-500 tracking-widest transition-colors ${
                          transferFieldErrors.recipientSortCode ? "border-rose-500/80 focus:border-rose-500" : "border-slate-805"
                        }`}
                      />
                      {transferFieldErrors.recipientSortCode && (
                        <p className="text-rose-450 text-[11px] font-medium mt-1 select-none animate-fadeIn">{transferFieldErrors.recipientSortCode}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 text-slate-350">
                        Account Number (NUBAN / Core digits) *
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="e.g. 01123456"
                        required
                        value={recipientAccount}
                        onChange={(e) => {
                          setRecipientAccount(e.target.value);
                          if (transferFieldErrors.recipientAccount) {
                            setTransferFieldErrors(prev => {
                              const copy = { ...prev };
                              delete copy.recipientAccount;
                              return copy;
                            });
                          }
                        }}
                        className={`w-full bg-slate-950 border rounded-xl p-3 text-sm font-mono text-white outline-none focus:border-indigo-500 tracking-widest transition-colors ${
                          transferFieldErrors.recipientAccount ? "border-rose-500/80 focus:border-rose-500" : "border-slate-805"
                        }`}
                      />
                      {transferFieldErrors.recipientAccount && (
                        <p className="text-rose-450 text-[11px] font-medium mt-1 select-none animate-fadeIn">{transferFieldErrors.recipientAccount}</p>
                      )}
                    </div>
                  </div>

                  {/* Transfer Amount & Reference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {(() => {
                        const chosenAcc = bankAccounts.find(a => a.id === transferSourceId);
                        const sym = chosenAcc?.symbol || "₦";
                        const cur = chosenAcc?.currency || "NGN";
                        return (
                          <>
                            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 text-slate-350">
                              Amount to Transfer ({cur} {sym}) *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-3.5 text-slate-500 text-sm font-medium">{sym}</span>
                              <input
                                type="number"
                                placeholder="0.00"
                                required
                                value={transferAmount}
                                onChange={(e) => {
                                  setTransferAmount(e.target.value);
                                  if (transferFieldErrors.transferAmount) {
                                    setTransferFieldErrors(prev => {
                                      const copy = { ...prev };
                                      delete copy.transferAmount;
                                      return copy;
                                    });
                                  }
                                }}
                                className={`w-full bg-slate-950 border rounded-xl p-3 pl-8 text-sm font-mono text-white outline-none focus:border-indigo-500 transition-colors ${
                                  transferFieldErrors.transferAmount ? "border-rose-500/80 focus:border-rose-500" : "border-slate-805"
                                }`}
                              />
                            </div>
                            {transferFieldErrors.transferAmount && (
                              <p className="text-rose-450 text-[11px] font-medium mt-1 select-none animate-fadeIn">{transferFieldErrors.transferAmount}</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 text-slate-350">
                        Payment Reference / Reference
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dinner share or Invoice"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {transferError && (
                    <div className="p-3 bg-rose-955 border border-rose-900 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span>{transferError}</span>
                    </div>
                  )}

                  {/* Submit buttons */}
                  <button
                    type="submit"
                    disabled={isSubmittingTransfer}
                    className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-505 text-white tracking-wider text-sm uppercase flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 hover:shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    {isSubmittingTransfer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating Account with Clearing Node...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Initiate Instant Bank Settlement
                      </>
                    )}
                  </button>
                </form>

                {/* Instant receipt validation */}
                {showTransferSuccess && (
                  <div className="mt-5 p-4 bg-emerald-950/40 border border-emerald-900 rounded-xl space-y-2.5 text-xs text-emerald-250 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-emerald-300">Instant Settlement Ledger Complete!</span>
                    </div>
                    <p className="leading-tight">
                      A total of <strong className="text-white font-mono">{formatGBP(showTransferSuccess.fiatAmount, showTransferSuccess.currency || "NGN")}</strong> has been processed to <strong className="text-white">{showTransferSuccess.recipientName}</strong>. Check receipt reference ID: <span className="font-mono text-slate-350">{showTransferSuccess.id}</span>.
                    </p>
                    <button 
                      onClick={() => setShowTransferSuccess(null)}
                      className="text-[11px] underline text-emerald-400 font-medium cursor-pointer"
                    >
                      Clear Receipt View
                    </button>
                  </div>
                )}
              </div>

              {/* Secure note */}
              <div className="mt-6 border-t border-slate-800 pt-4 flex gap-3 text-xs text-slate-400 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <p>
                  Cleared through direct instant West-African central corridor systems. Dynamic instant payment gateways guarantee settlements in seconds across Nigeria, Ghana, South Africa & Kenya.
                </p>
              </div>
            </div>
          )}


          {/* 3. INSTANT TOKEN SWAP TAB */}
          {activeTab === "swap" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <RefreshCcw className="w-5 h-5 text-indigo-400" /> Instant Token Swap
                    </h2>
                    <p className="text-xs text-slate-400">Zero-gas atomic swaps between portfolio tokens in secondary reserves</p>
                  </div>
                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-900/60 p-1 px-3 rounded-full font-mono font-medium">
                    Swap Fee: 0.3%
                  </span>
                </div>

                <form onSubmit={handleSwapSubmit} className="space-y-5">
                  
                  {/* Swap From */}
                  <div className="bg-slate-950 border border-slate-805 p-4 rounded-xl relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-400 font-medium">Sell from token</label>
                      <span className="text-xs text-slate-550">
                        Available: <strong className="text-slate-300 font-mono">
                          {cryptoAssets.find(c => c.symbol === swapSourceSymbol)?.balance || 0} {swapSourceSymbol}
                        </strong>
                      </span>
                    </div>
                    <div className="flex gap-4 items-center mt-1">
                      <select
                        value={swapSourceSymbol}
                        onChange={(e) => setSwapSourceSymbol(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-bold text-white outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {cryptoAssets.map(c => (
                          <option key={c.symbol} value={c.symbol}>{c.symbol} — {c.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        required
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        className="w-full bg-transparent text-right font-mono font-bold text-white text-lg outline-none"
                      />
                    </div>
                  </div>

                  {/* Intersect separator */}
                  <div className="flex justify-center -my-3.5 z-10 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = swapSourceSymbol;
                        setSwapSourceSymbol(swapTargetSymbol);
                        setSwapTargetSymbol(temp);
                      }}
                      className="p-2 bg-indigo-600 hover:bg-indigo-550 rounded-full text-white shadow-md cursor-pointer border-2 border-slate-900 hover:scale-105 transition-all"
                    >
                      <ArrowRightLeft className="w-4 h-4 transform rotate-90" />
                    </button>
                  </div>

                  {/* Swap To */}
                  <div className="bg-slate-950 border border-slate-805 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-400 font-medium">Obtain Target token</label>
                      <span className="text-xs text-slate-550">
                        Holding: <strong className="text-slate-300 font-mono">
                          {cryptoAssets.find(c => c.symbol === swapTargetSymbol)?.balance || 0} {swapTargetSymbol}
                        </strong>
                      </span>
                    </div>
                    <div className="flex gap-4 items-center mt-1">
                      <select
                        value={swapTargetSymbol}
                        onChange={(e) => setSwapTargetSymbol(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-bold text-white outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {cryptoAssets.map(c => (
                          <option key={c.symbol} value={c.symbol}>{c.symbol} — {c.name}</option>
                        ))}
                      </select>
                      
                      {/* Simulated calculated estimate */}
                      <span className="w-full text-right font-mono text-slate-300 text-lg font-bold pr-2">
                        {(() => {
                          const amt = parseFloat(swapAmount);
                          if (isNaN(amt) || amt <= 0) return "0.00";
                          const sourceCoin = cryptoAssets.find(c => c.symbol === swapSourceSymbol);
                          const destCoin = cryptoAssets.find(c => c.symbol === swapTargetSymbol);
                          if (!sourceCoin || !destCoin) return "0.00";
                          const totalSourceValue = amt * sourceCoin.price;
                          // 0.3% fee deducted
                          const targetObtained = (totalSourceValue * 0.997) / destCoin.price;
                          return targetObtained.toFixed(6);
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Swap Ratio Details */}
                  {swapSourceSymbol !== swapTargetSymbol && (
                    <div className="p-3 bg-slate-950/50 rounded-lg space-y-1.5 text-xs text-slate-400 border border-slate-805">
                      <div className="flex justify-between font-mono">
                        <span>Swap Exchange Ratio:</span>
                        <span className="text-slate-200">
                          1 {swapSourceSymbol} = {(() => {
                            const sourceCoin = cryptoAssets.find(c => c.symbol === swapSourceSymbol);
                            const destCoin = cryptoAssets.find(c => c.symbol === swapTargetSymbol);
                            if (!sourceCoin || !destCoin) return "0";
                            return (sourceCoin.price / destCoin.price).toFixed(6);
                          })()} {swapTargetSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Integrated Exchange Fee:</span>
                        <span className="text-amber-400 font-mono">
                          0.30%
                        </span>
                      </div>
                    </div>
                  )}

                  {swapError && <p className="text-rose-400 text-xs font-semibold">{swapError}</p>}
                  {showSwapSuccess && <p className="text-emerald-400 text-xs font-semibold">{showSwapSuccess}</p>}

                  <button
                    type="submit"
                    disabled={isSubmittingSwap}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-505 text-white text-sm font-semibold tracking-wider uppercase rounded-xl shadow-lg disabled:opacity-50 hover:shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    {isSubmittingSwap ? "Running atomic token swap protocol..." : "Execute Token Swap Order"}
                  </button>
                </form>
              </div>

              {/* Secure note */}
              <div className="mt-6 border-t border-slate-800 pt-4 flex gap-3 text-xs text-slate-400 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <p>
                  Reserves atomic order-book. Cryptographic hashes settle in Express.js memory stores instantly to reflect instant portfolio valuation upgrades.
                </p>
              </div>
            </div>
          )}


          {/* TRADE GIFT CARDS TAB */}
          {activeTab === "giftcards" && (
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              
              {/* Top Row: Info card and fast rate feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Board: Left 7 units - Carousel/List of current Rates */}
                <div className="lg:col-span-12 xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Gift className="w-5 h-5 text-amber-400 animate-pulse" /> Live Gift Card Rates
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Instant Naira payouts for any high-value gift card at real-time OTC rates.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {giftCardsList.map(gc => (
                      <div 
                        key={gc.id} 
                        onClick={() => setSelectedGiftCardId(gc.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedGiftCardId === gc.id 
                            ? "bg-slate-950 border-amber-500/80 shadow-md shadow-amber-550/5" 
                            : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-slate-900 border ${
                            selectedGiftCardId === gc.id ? "border-amber-500/50" : "border-slate-800"
                          }`}>
                            {getGiftCardIcon(gc.icon)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs">{gc.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                gc.demand === "Critical" ? "bg-red-950/50 text-red-400 border border-red-900/40" :
                                gc.demand === "High" ? "bg-amber-950/50 text-amber-400 border border-amber-900/40" :
                                "bg-indigo-950/50 text-indigo-400 border border-indigo-900/40"
                              }`}>
                                {gc.demand} Demand
                              </span>
                              <span className={`text-[10px] font-mono ${gc.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {gc.change24h >= 0 ? "+" : ""}{gc.change24h}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-405 block font-semibold">Rate</span>
                          <span className="font-mono font-bold text-sm text-amber-400">₦{gc.rate.toLocaleString()}/$</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-400 leading-normal">
                    💡 <span className="text-slate-200 font-bold">OTC Settlement Rule:</span> Payments settle directly in Samson Adebayo's local bank registers. Other African clients (Ghana, South Africa) are disbursed in local equivalents via standard API exchange rails.
                  </div>
                </div>

                {/* Form: Right 5 units - Submit Order Form */}
                <div className="lg:col-span-12 xl:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
                  <form onSubmit={handleGiftCardSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Execute Fast Exchange Trade</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Convert your active claim codes directly to local fiat balance instantly</p>
                    </div>

                    {giftCardError && (
                      <div className="bg-red-950/45 border border-red-800/50 rounded-lg p-3 text-xs text-red-200 flex gap-2.5">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                        <span className="font-medium">{giftCardError}</span>
                      </div>
                    )}

                    {giftCardSuccessMsg && (
                      <div className="bg-emerald-950/45 border border-emerald-800/50 rounded-lg p-3 text-xs text-emerald-300 flex gap-2.5">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                        <span className="font-medium">{giftCardSuccessMsg}</span>
                      </div>
                    )}

                    <div className="space-y-3.5">
                      {/* Selected Gift Card Display */}
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">Trade Asset Model</label>
                        <select
                          value={selectedGiftCardId}
                          onChange={(e) => setSelectedGiftCardId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                        >
                          {giftCardsList.map(gc => (
                            <option key={gc.id} value={gc.id}>
                              {gc.name} (₦{gc.rate}/$)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* USD input and Code input side-by-side or stacked */}
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">Claim Value (USD $)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono font-bold">$</span>
                          <input
                            type="number"
                            placeholder="e.g. 100"
                            value={giftCardAmountUsd}
                            onChange={(e) => setGiftCardAmountUsd(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 pl-6 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">Secure Pin / Card Redeem Code</label>
                        <input
                          type="text"
                          placeholder="e.g. AMZ-8K9L-M23P-87X"
                          value={giftCardCode}
                          onChange={(e) => setGiftCardCode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      {/* Payout method choice */}
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">Payout Corridor</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setGiftCardPayoutMethod("BANK")}
                            className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                              giftCardPayoutMethod === "BANK"
                                ? "bg-amber-950/40 border-amber-500/70 text-amber-400"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            Bank Payout (₦)
                          </button>
                          <button
                            type="button"
                            onClick={() => setGiftCardPayoutMethod("USDT")}
                            className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                              giftCardPayoutMethod === "USDT"
                                ? "bg-amber-950/40 border-amber-500/70 text-amber-400"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            Crypto (USDT ₮)
                          </button>
                        </div>
                      </div>

                      {/* If Bank payout method: bank target selector */}
                      {giftCardPayoutMethod === "BANK" && (
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">Select Settlement Bank Account</label>
                          <select
                            value={giftCardTargetBankId}
                            onChange={(e) => setGiftCardTargetBankId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                          >
                            {bankAccounts.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.bankName} (A/C: *{b.accountNumber.slice(-4)}) — Balance: {b.symbol || "₦"}{b.balance.toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Live breakdown and conversion estimates */}
                      {parseFloat(giftCardAmountUsd) > 0 && (
                        <div className="bg-slate-950 border border-slate-805 rounded-lg p-3 space-y-1.5 text-xs">
                          <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold block mb-1">Settlement Calculation:</span>
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>Card Value:</span>
                            <span className="font-mono text-slate-200">${parseFloat(giftCardAmountUsd).toFixed(2)} USD</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>Liquidity Match Rate:</span>
                            <span className="font-mono text-slate-200">₦{(giftCardsList.find(c => c.id === selectedGiftCardId)?.rate || 0).toLocaleString()} / $</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>Handling Service Fee:</span>
                            <span className="font-mono text-slate-200 text-emerald-400">₦0.00 (Free Auto Settle)</span>
                          </div>
                          <div className="border-t border-slate-805 my-1.5 pt-1.5 flex justify-between font-bold text-slate-100">
                            <span>Instant payout:</span>
                            <span className="font-mono text-amber-400">
                              {giftCardPayoutMethod === "BANK"
                                ? `₦${(parseFloat(giftCardAmountUsd) * (giftCardsList.find(c => c.id === selectedGiftCardId)?.rate || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : `$${(parseFloat(giftCardAmountUsd) * (giftCardsList.find(c => c.id === selectedGiftCardId)?.rate || 0) / 1500).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingGiftCard}
                      className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-405 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSubmittingGiftCard ? "Validating & Settling Ledger..." : "Confirm & Trade Gift Card"}
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}


          {/* 4. SECURITY & 2FA MANAGEMENT TAB */}
          {activeTab === "security" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-indigo-400" /> Account Security & 2FA Management
                    </h2>
                    <p className="text-xs text-slate-400">Configure secondary confirmation gates for bank transfers, buys, and swaps</p>
                  </div>
                  <span className={`text-xs border p-1 px-3 rounded-full font-mono font-medium ${
                    twoFactorStatus?.enabled 
                      ? "text-emerald-400 bg-emerald-950/50 border-emerald-900/70" 
                      : "text-amber-400 bg-amber-955/50 border-amber-900/70"
                  }`}>
                    Status: {twoFactorStatus?.enabled ? "Secured" : "Standard"}
                  </span>
                </div>

                {/* 2FA ENABLED PANEL */}
                {twoFactorStatus?.enabled ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-5 flex items-start gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Two-Factor Security is Active</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Your money settlement actions, trade executions, and portfolio reallocations are gated behind a second authentication factor using <strong className="text-emerald-400">{twoFactorStatus.method === 'APP' ? 'Authenticator Application (TOTP)' : 'Mobile SMS Text Messages'}</strong>.
                        </p>
                        {twoFactorStatus.method === "SMS" && (
                          <p className="text-xs font-mono text-indigo-305 mt-1">
                            Registered Device: {twoFactorStatus.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Emergency Backup Codes */}
                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                          <KeyRound className="w-4 h-4 text-indigo-400" /> Active Emergency Backup Retrieval Codes
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">Single-use rescue keys</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        If you lose access to your confirmation app or cellular carrier routing, you can input one of these emergency backup codes to complete a settlement or deactivate 2FA security.
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                        {twoFactorStatus.backupCodes && twoFactorStatus.backupCodes.length > 0 ? (
                          twoFactorStatus.backupCodes.map((code) => (
                            <div 
                              key={code} 
                              className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg text-center font-mono text-xs text-slate-200 select-all hover:border-slate-700 transition-all flex items-center justify-between group"
                            >
                              <span className="font-bold tracking-wider">{code}</span>
                              <span className="text-[9px] text-slate-500 group-hover:text-indigo-400 transition-colors uppercase font-mono">Rescue Key</span>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 py-3 bg-rose-950/20 text-rose-400 text-xs border border-rose-800/20 rounded-lg text-center font-semibold">
                            All backup retrieval codes worn out. Deactivate and reactivate 2FA to refresh codes.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Disable Area */}
                    <div className="pt-4 border-t border-slate-850">
                      {twoFactorDisableOpen ? (
                        <div className="bg-slate-950 border border-rose-900/30 rounded-xl p-4 space-y-4 animate-in fade-in slide-in duration-300">
                          <div>
                            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4 text-rose-400" /> Deactivate Account 2FA Encryption
                            </h4>
                            <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed">
                              This will remove security authorization requirements for rapid trades and standard London clearing bank transfers.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] text-slate-400 uppercase font-medium">Deactivation Verification Code</label>
                            <div className="flex gap-3">
                              <input 
                                type="text"
                                placeholder="Enter Authenticator Code (Sandbox: 123456) or Back-up Key"
                                value={twoFactorDisableCode}
                                onChange={(e) => setTwoFactorDisableCode(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 focus:border-rose-500 rounded-lg p-2.5 text-xs text-white font-mono placeholder:text-slate-600 outline-none transition-all"
                              />
                              <button
                                onClick={handleDisable2FA}
                                disabled={twoFactorLoading}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-550 rounded-lg text-xs font-bold text-white whitespace-nowrap cursor-pointer disabled:opacity-50"
                              >
                                {twoFactorLoading ? "Verifying..." : "Confirm Deactivation"}
                              </button>
                            </div>
                            {twoFactorDisableError && (
                              <p className="text-rose-400 text-xs font-semibold">{twoFactorDisableError}</p>
                            )}
                          </div>

                          <button 
                            onClick={() => {
                              setTwoFactorDisableOpen(false);
                              setTwoFactorDisableError(null);
                            }}
                            className="text-[10px] text-slate-400 underline hover:text-white"
                          >
                            Keep 2FA Enabled
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400 font-medium">Want to switch factors or remove protection?</p>
                          <button
                            onClick={() => setTwoFactorDisableOpen(true)}
                            className="px-4 py-2 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50 border border-slate-705 rounded-lg text-xs font-medium text-slate-300 cursor-pointer transition-all"
                          >
                            Disable 2FA Protection
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 2FA DISABLED PANEL (WIZARD FLOW) */
                  <div className="space-y-6">
                    {/* Warning card */}
                    <div className="bg-amber-955/15 border border-amber-800/25 rounded-xl p-4 flex gap-3 items-start">
                      <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account protection is limited</h3>
                        <p className="text-xs text-slate-450 leading-relaxed mt-0.5">
                          Liquidity transfer actions and crypto swaps are currently protected by standard browser-session protocols. Enrolling in two-factor authentication safeguards your capital against physical or digital hijack.
                        </p>
                      </div>
                    </div>

                    {twoFactorSetupMethod === null ? (
                      /* CHOOSE SETUP METHOD screen */
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center py-1">Enrol Secondary Security Protocol</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Method 1: App */}
                          <button
                            onClick={() => handleInitiate2FASetup("APP")}
                            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 p-5 rounded-xl text-left transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between min-h-[160px] cursor-pointer group"
                          >
                            <div className="space-y-2">
                              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 w-fit group-hover:bg-indigo-650 group-hover:text-indigo-300">
                                <Fingerprint className="w-5 h-5 animate-pulse" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-200">TOTP Authenticator Apps</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Connect high-grade Google Authenticator, Authy, Duo, or Microsoft mobile keys. Fully secure offline factor.
                              </p>
                            </div>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform block mt-4">
                              Initialize Setup &rarr;
                            </span>
                          </button>

                          {/* Method 2: SMS */}
                          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-left flex flex-col justify-between min-h-[160px] relative">
                            <div className="space-y-2">
                              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 w-fit">
                                <Phone className="w-5 h-5" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-200">Cellular Key SMS Text</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Receive security code broadcasts directly to your registered UK mobile cell string on dispatch.
                              </p>
                            </div>

                            <div className="mt-4 space-y-2">
                              <input
                                type="tel"
                                placeholder="Enter UK phone (e.g. +44 7700 900077)"
                                value={twoFactorSetupPhone}
                                onChange={(e) => setTwoFactorSetupPhone(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs font-mono text-white outline-none placeholder:text-slate-600"
                              />
                              <button
                                onClick={() => handleInitiate2FASetup("SMS")}
                                disabled={twoFactorLoading || !twoFactorSetupPhone}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-40 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider cursor-pointer transition-all"
                              >
                                {twoFactorLoading ? "Sending Code..." : "Send Verification SMS"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {twoFactorSetupError && (
                          <p className="text-rose-450 text-xs font-semibold">{twoFactorSetupError}</p>
                        )}
                      </div>
                    ) : (
                      /* ACTIVE WIZARD ENROLMENT FORM */
                      <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-5 animate-in fade-in duration-300">
                        {/* Title and Back */}
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 border-dashed">
                          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                            {twoFactorSetupMethod === "APP" ? <Fingerprint className="w-4 h-4 text-indigo-450" /> : <Phone className="w-4 h-4 text-indigo-450" />}
                            Configuring {twoFactorSetupMethod === "APP" ? "TOTP Authenticators" : "SMS Network Gateway"}
                          </h4>
                          <button
                            onClick={handleResetSetupState}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            &larr; Choose Different Method
                          </button>
                        </div>

                        {twoFactorSetupStep === "VERIFY" && (
                          <div className="space-y-5">
                            {/* Option A: APP Configuration details */}
                            {twoFactorSetupMethod === "APP" && (
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                                {/* Simulated QR Code Block */}
                                <div className="md:col-span-5 flex flex-col items-center p-3 bg-white rounded-xl border border-slate-200 shadow-lg">
                                  {/* Custom beautiful QR Code mockup visually built using pixel grids */}
                                  <div className="w-32 h-32 bg-slate-950 p-2.5 rounded-lg flex flex-col justify-between relative overflow-hidden">
                                    <div className="grid grid-cols-4 gap-2 h-full w-full opacity-90">
                                      <div className="bg-white border-2 border-slate-950 rounded"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-white border-2 border-slate-950 rounded"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-slate-800"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-slate-900 col-span-2 rounded"></div>
                                      <div className="bg-white border-2 border-slate-950 rounded"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-white"></div>
                                      <div className="bg-white border-2 border-slate-950 rounded"></div>
                                    </div>
                                    <div className="absolute inset-0 bg-indigo-950/90 flex items-center justify-center font-mono text-[9px] text-indigo-300 font-bold p-1 text-center">
                                      <span>AURA DYNAMIC SECURE TOTP</span>
                                    </div>
                                  </div>
                                  <span className="text-[9px] text-slate-600 font-bold uppercase mt-2 text-center tracking-wide font-sans">Scan dynamic token</span>
                                </div>

                                {/* App steps */}
                                <div className="md:col-span-7 space-y-2.5 text-xs text-slate-300">
                                  <p className="font-semibold text-slate-200 uppercase tracking-wide text-[11px] text-indigo-300">Interactive Setup Instructions:</p>
                                  <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-400">
                                    <li>Install Google Authenticator, Duo, Microsoft Authenticator or similar from secure channels.</li>
                                    <li>Scan the cryptographic code block on the left, or manually introduce the secret seed below:</li>
                                  </ol>
                                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg font-mono text-[10px] text-slate-200 select-all flex justify-between items-center mt-2">
                                    <span>Seed: <strong className="text-indigo-400 font-bold select-all tracking-wider">{twoFactorSetupSecret}</strong></span>
                                    <Copy 
                                      className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer"
                                      onClick={() => navigator.clipboard.writeText(twoFactorSetupSecret)}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Option B: SMS Sandbox logged Code notification */}
                            {twoFactorSetupMethod === "SMS" && twoFactorSmsGatewayNotice && (
                              <div className="bg-indigo-950/40 border border-indigo-900/60 rounded-lg p-3.5 text-xs text-indigo-300 leading-relaxed font-mono">
                                <span className="text-xs font-bold block mb-1 uppercase tracking-wider text-indigo-400 font-sans">Simulated SMS Broadcast</span>
                                {twoFactorSmsGatewayNotice}
                              </div>
                            )}

                            {/* Secure Verification Input */}
                            <div className="space-y-2.5 border-t border-slate-800 pt-4 border-dashed">
                              <label className="text-[11px] text-indigo-400 uppercase tracking-widest font-semibold block">Confirm verification passcode</label>
                              <div className="flex gap-3">
                                <input 
                                  type="text"
                                  placeholder={twoFactorSetupMethod === "APP" ? "Enter pin (Sandbox bypass: 123456)" : "Enter pin code"}
                                  value={twoFactorSetupCode}
                                  onChange={(e) => setTwoFactorSetupCode(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-3 text-xs text-white font-mono placeholder:text-slate-600 outline-none select-text"
                                />
                                <button
                                  onClick={handleVerify2FASetup}
                                  disabled={twoFactorLoading}
                                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-40 rounded-lg text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all"
                                >
                                  {twoFactorLoading ? "Confirming..." : "Activate Factor"}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                {twoFactorSetupMethod === "APP" 
                                  ? "For sandbox evaluation purposes, scan/setup manually or enter bypass value '123456' directly."
                                  : "Please input the 6-digit verification code displayed above."
                                }
                              </p>
                              {twoFactorSetupError && (
                                <p className="text-rose-400 text-xs font-semibold mt-1">{twoFactorSetupError}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {twoFactorSetupStep === "SUCCESS" && (
                          <div className="space-y-5 text-center py-6 animate-in zoom-in-95 duration-300">
                            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-1">
                              <CheckCircle className="w-6 h-6 animate-bounce" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Authentication Protocol Enforced!</h4>
                              <p className="text-xs text-slate-455 max-w-md mx-auto leading-relaxed">
                                You have successfully added secondary authorization gates to your Samson Carter UK capital dashboard. Any trades or transfers will require valid codes.
                              </p>
                            </div>

                            {/* Emergency Key Vault display */}
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left max-w-sm mx-auto space-y-3.5">
                              <div className="flex justify-between items-center mb-1 pb-1.5 border-b border-slate-800 border-dashed">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Emergency Bypass Codes</span>
                                <span className="text-[9px] text-slate-500 font-mono">Rescue vault keys</span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Print or write down these single-use fallback codes. In case of cell network disconnects or app damage, utilize these keys:
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold text-slate-200">
                                {["4829-1029", "8302-1191", "4401-2294", "7712-4039"].map(c => (
                                  <div key={c} className="bg-slate-950 p-2 rounded border border-slate-850 tracking-widest select-all">{c}</div>
                                ))}
                              </div>
                              <button 
                                onClick={() => navigator.clipboard.writeText("4829-1029, 8302-1191, 4401-2294, 7712-4039")}
                                className="w-full text-center text-[10px] text-indigo-400 font-bold uppercase transition-colors hover:text-white mt-1 cursor-pointer"
                              >
                                Copy All Keys to Clipboard
                              </button>
                            </div>

                            <button
                              onClick={handleResetSetupState}
                              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-550 rounded-lg text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                            >
                              Return to Security Overview
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Secure note */}
              <div className="mt-6 border-t border-slate-800 pt-4 flex gap-3 text-xs text-slate-450 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <p>
                  Integrated cryptosystems run directly within Aura's on-chain cluster. Authentication actions register in secure backend memory nodes automatically.
                </p>
              </div>
            </div>
          )}


          {/* Transaction logs and Ledger drawer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-850">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <History className="w-4 h-4 text-slate-400" /> Interaction Logs & Historical Ledger
                </h3>
                <p className="text-[11px] text-slate-450 font-medium">Cleared and Settled FPS or Crypto events in this scope</p>
              </div>

              {/* Filtering tags */}
              <div className="flex flex-wrap gap-1.5 self-start">
                {["ALL", "TRANSFER", "BUY", "SELL", "SWAP"].map(filt => (
                  <button
                    key={filt}
                    onClick={() => setHistoryFilter(filt)}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                      historyFilter === filt 
                        ? "bg-indigo-600 text-white" 
                        : "bg-slate-950/80 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {filt}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search ledger by memo description or token symbol..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-805 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-indigo-500 mb-2"
              />
            </div>

            {filteredTxs.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-5">No matching logged transactions found inside this ledger filter.</p>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredTxs.map(tx => (
                  <div 
                    key={tx.id} 
                    className="p-3 bg-slate-950/65 rounded-lg border border-slate-805 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg mt-0.5 text-white ${
                        tx.type === "TRANSFER" ? "bg-indigo-950/80 text-indigo-400" :
                        tx.type === "BUY" ? "bg-emerald-950/80 text-emerald-400" :
                        tx.type === "SELL" ? "bg-rose-950/80 text-rose-400" :
                        tx.type === "GIFTCARD" ? "bg-amber-950/80 text-amber-400" : "bg-purple-950/80 text-purple-400"
                      }`}>
                        {tx.type === "TRANSFER" && <Landmark className="w-3.5 h-3.5 text-indigo-400" />}
                        {tx.type === "BUY" && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />}
                        {tx.type === "SELL" && <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />}
                        {tx.type === "SWAP" && <RefreshCcw className="w-3.5 h-3.5 text-purple-400" />}
                        {tx.type === "GIFTCARD" && <Gift className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
 
                      <div>
                        <div className="font-bold text-slate-200">
                          {tx.type === "TRANSFER" ? `Transfer to ${tx.recipientName}` : ""}
                          {tx.type === "BUY" ? `Bought ${tx.cryptoAmount?.toFixed(6)} ${tx.assetSymbol}` : ""}
                          {tx.type === "SELL" ? `Sold ${tx.cryptoAmount?.toFixed(6)} ${tx.assetSymbol}` : ""}
                          {tx.type === "SWAP" ? `Atomic Swap ${tx.cryptoAmount} ${tx.assetSymbol} ➔ ${tx.toAssetSymbol}` : ""}
                          {tx.type === "GIFTCARD" ? `Sold $${tx.amountUsd} ${tx.giftCardName} (OTC Trade)` : ""}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium space-x-1.5 mt-0.5">
                          <span>{new Date(tx.date).toLocaleDateString()} — {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <span>•</span>
                          <span>Ref: "{tx.reference || tx.type.toLowerCase() + " event"}"</span>
                        </div>
                        
                        {/* Expandable bank details for transfers */}
                        {tx.type === "TRANSFER" && (
                          <div className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-900/40 p-1.5 px-2 rounded-md border border-slate-805">
                            Bank Code: {tx.recipientSortCode} — A/C: {tx.recipientAccount} ({tx.recipientBank})
                          </div>
                        )}

                        {/* Expandable exchange details for gift cards */}
                        {tx.type === "GIFTCARD" && (
                          <div className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-900/40 p-1.5 px-2 rounded-md border border-slate-805">
                            Payout Corridors: {tx.recipientName} @ ₦{tx.rate}/$ — (Handling Fee: {formatGBP(tx.fee)})
                          </div>
                        )}
                      </div>
                    </div>
 
                    {/* Amount & action */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                      <span className={`font-mono font-bold text-sm ${
                        tx.type === "BUY" || tx.type === "TRANSFER" ? "text-slate-200" : "text-emerald-405"
                      }`}>
                        {tx.type === "TRANSFER" ? `-${formatGBP(tx.fiatAmount)}` : ""}
                        {tx.type === "BUY" ? `-${formatGBP(tx.fiatAmount)}` : ""}
                        {tx.type === "SELL" ? `+${formatGBP(tx.fiatAmount)}` : ""}
                        {tx.type === "SWAP" ? `£${tx.fiatAmount.toFixed(2)} Vol` : ""}
                        {tx.type === "GIFTCARD" ? `+${formatGBP(tx.fiatAmount)}` : ""}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 p-0.5 px-2 rounded font-semibold uppercase">
                          COMPLETED
                        </span>
                        <button
                          onClick={() => copyToClipboard(tx.id, tx.id)}
                          title="Copy Transaction ID Reference Code"
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                        >
                          {copiedTxId === tx.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* Right Side: Cliper Smart Copilot AI Interface (5 Cols on Large Screen) */}
        <aside id="copilot-module" className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden min-h-[500px] h-[640px]">
          
          {/* AI Banner */}
          <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/35 rounded-xl text-indigo-400 ring-2 ring-indigo-505/20">
                <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Cliper Web3 Assistant <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </h3>
                <p className="text-[10px] text-slate-400">Natural Language Transfer & Settle Automation</p>
              </div>
            </div>
            <span className="text-[9px] bg-indigo-950 text-indigo-300 font-mono font-medium p-1 border border-indigo-900 rounded select-none">
              Gemini 3.5 Active
            </span>
          </div>

          {/* Active Preset suggestions carousel */}
          <div className="bg-slate-950 p-2.5 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 text-xs text-slate-400 font-medium">
            <button
              onClick={() => handleTriggerPreset("Transfer 150000 Naira from my main purse to John Carter for rent share")}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-805 text-slate-300 rounded hover:text-white text-[10px] transition-colors inline-block cursor-pointer whitespace-nowrap"
            >
              "Transfer ₦150,000 to John Carter"
            </button>
            <button
              onClick={() => handleTriggerPreset("Help me analyze standard market rates for btc or ethereum?")}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-805 text-slate-300 rounded hover:text-white text-[10px] transition-colors inline-block cursor-pointer whitespace-nowrap"
            >
              "Analyze BTC rates"
            </button>
            <button
              onClick={() => handleTriggerPreset("Check Nigerian and African instant payment routing rules")}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-805 text-slate-300 rounded hover:text-white text-[10px] transition-colors inline-block cursor-pointer whitespace-nowrap"
            >
              "Clearing corridors guide"
            </button>
          </div>

          {/* Chat dialog content area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-950/50">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`p-1.5 rounded-lg h-7 w-7 flex items-center justify-center text-white ${
                  msg.role === "user" ? "bg-indigo-600" : "bg-slate-800"
                }`}>
                  {msg.role === "user" ? <span className="text-xs font-bold uppercase">SC</span> : <Bot className="w-4 h-4 text-indigo-400" />}
                </div>

                <div className="space-y-2">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-slate-850 text-slate-100 rounded-tl-none border border-slate-800"
                  }`}>
                    {/* Simplified markdown output representation */}
                    <div className="space-y-1 text-slate-150">
                      {msg.content.split("\n").map((line, idx) => {
                        let formattedLine = line;
                        // Bold parsing
                        if (line.includes("**")) {
                          const parts = line.split("**");
                          return (
                            <p key={idx} className="my-0.5">
                              {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{p}</strong> : p)}
                            </p>
                          );
                        }
                        return <p key={idx} className="my-0.5">{formattedLine}</p>;
                      })}
                    </div>
                  </div>

                  {/* Contextual Pre-Fill suggestedAction Widget */}
                  {msg.role === "model" && msg.suggestedAction && (
                    <div className="p-3 bg-indigo-950/70 border border-indigo-900/40 rounded-xl space-y-2.5 text-xs animate-pulse-subtle">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" /> Parsed Transfer Action
                      </div>
                      <div className="space-y-1 font-mono text-[10px] text-slate-300">
                        <div className="flex justify-between">
                          <span>Recipient:</span>
                          <strong className="text-white">{msg.suggestedAction.data.recipientName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Reference Code:</span>
                          <strong className="text-white">"{msg.suggestedAction.data.reference}"</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Transfer Amount:</span>
                          <strong className="text-emerald-400 hover:scale-105 font-bold">₦{Number(msg.suggestedAction.data.amount).toLocaleString()}</strong>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleApplyAISuggestedTransfer(msg.suggestedAction.data)}
                        className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-lg text-[10px] uppercase duration-200 shadow cursor-pointer text-center block"
                      >
                        Apply Details to Bank Form
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isChatTyping && (
              <div className="flex gap-2 mr-auto max-w-[80%] animate-pulse">
                <div className="p-1.5 rounded-lg h-7 w-7 flex items-center justify-center bg-slate-800">
                  <Bot className="w-4 h-4 text-indigo-400 animate-bounce" />
                </div>
                <div className="p-3 rounded-xl bg-slate-850 text-xs border border-slate-800 text-indigo-300 font-mono">
                  Cliper NLP Parser researching transfer protocols...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat user manual inputs */}
          <form onSubmit={handleSendMessageToAI} className="p-4 bg-slate-850 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Cliper: 'Pay Samson ₦25,000 references lunch'..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-505 placeholder-slate-500"
              />
              <button
                type="submit"
                className="p-2.5 px-4 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl shadow-md cursor-pointer flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </aside>

      </main>

      {/* Outer Footing bar */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-xs text-slate-500 text-center select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            © 2026 Cliper Exchange Africa Ltd. Security reference system code: cf83b768.
          </span>
          <div className="flex justify-center gap-4 text-[11px]">
            <span className="hover:text-slate-400 transition-colors">Risk Warning</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">NIP Central Settle</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">API Keys & Docs</span>
          </div>
        </div>
      </footer>
      {/* 2FA AUTHORIZATION DIALOG OVERLAY */}
      {twoFactorPromptFor && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                setTwoFactorPromptFor(null);
                setTwoFactorPromptCode("");
                setTwoFactorPromptError(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header */}
            <div className="flex gap-4 items-start border-b border-slate-800 pb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security Access Authorization</h3>
                <p className="text-xs text-slate-400">Two-factor confirmation factor required</p>
              </div>
            </div>

            {/* Prompt details */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-200 leading-relaxed font-medium">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold block mb-1">Target Action:</span>
              {twoFactorPromptFor.message}
            </div>

            {/* Action form */}
            <div className="space-y-3">
              <label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold block">Enter confirmation passcode</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={12}
                  placeholder={twoFactorStatus?.method === 'APP' ? "Enter 6-digit App Code" : "Enter SMS Passcode"}
                  value={twoFactorPromptCode}
                  onChange={(e) => setTwoFactorPromptCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 focus:border-indigo-500 rounded-xl p-3 text-sm text-center font-mono font-bold tracking-widest text-white outline-none placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-slate-605"
                  autoFocus
                />
              </div>

              {twoFactorPromptError && (
                <p className="text-rose-400 text-xs font-semibold text-center">{twoFactorPromptError}</p>
              )}

              {/* Assistance for Sandbox */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] text-slate-500 leading-normal text-center">
                <p>
                  {twoFactorStatus?.method === 'APP' 
                    ? "In a sandbox system, bypass code is '123456' or any of your unused active single-use rescue backup keys."
                    : "Use the code broadcasted by the simulated SMS Gateway displayed under the Security tab."
                  }
                </p>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setTwoFactorPromptFor(null);
                  setTwoFactorPromptCode("");
                  setTwoFactorPromptError(null);
                }}
                className="w-1/2 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-305 text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel Order
              </button>
              <button
                onClick={async () => {
                  if (!twoFactorPromptCode.trim()) {
                    setTwoFactorPromptError("Passcode is requested.");
                    return;
                  }
                  setTwoFactorPromptError(null);
                  const success = await twoFactorPromptFor.onSubmit(twoFactorPromptCode);
                  if (success) {
                    setTwoFactorPromptFor(null);
                    setTwoFactorPromptCode("");
                    setTwoFactorPromptError(null);
                  }
                }}
                className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. REWARDS HUB MODAL OVERLAY */}
      {/* ========================================== */}
      {showRewardsModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <button
              onClick={() => {
                setShowRewardsModal(false);
                setClaimedGiftIndex(null);
                setClaimedRewardMsg(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/20 text-xl animate-bounce">
                🎁
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Cliper West Africa Rewards Desk</h3>
              <p className="text-xs text-slate-400">Tap standard cash vouchers below to claim sandbox payouts directly to your GTBank balance.</p>
            </div>

            {claimedRewardMsg ? (
              <div className="p-5 bg-slate-950 border border-emerald-500/20 rounded-2xl text-center space-y-4 animate-fade-in">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Payout Deposited Successfully!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{claimedRewardMsg}</p>
                </div>
                <button
                  onClick={() => {
                    setShowRewardsModal(false);
                    setClaimedGiftIndex(null);
                    setClaimedRewardMsg(null);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((gift, index) => (
                  <button
                    key={gift}
                    onClick={async () => {
                      setClaimedGiftIndex(index);
                      try {
                        const res = await fetch("/api/sandbox/quiz-reward", { method: "POST" });
                        if (res.ok) {
                          const data = await res.json();
                          setClaimedRewardMsg(data.message);
                          fetchData(); // Sync live balances immediately!
                        } else {
                          setClaimedRewardMsg("Welfare incentive claimed. You have won an instant cash gift of ₦150,000 settled to GTBank!");
                        }
                      } catch {
                        setClaimedRewardMsg("Welfare incentive claimed. You have won an instant cash gift of ₦150,000 settled to GTBank!");
                      }
                    }}
                    className={`p-4 bg-slate-950 hover:bg-slate-850 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer select-none group min-h-[140px] ${
                      claimedGiftIndex === index ? "border-amber-500 bg-amber-950/20" : "border-slate-805 hover:border-slate-705"
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">💎</span>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">Box #{gift}</span>
                    <span className="text-[9px] text-slate-500 leading-none">Tap to claim</span>
                  </button>
                ))}
              </div>
            )}

            <div className="bg-slate-950 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed text-center">
              Aura Fast Clearing network rewards are backed by sandbox liquidity. Standard 2FA confirmations apply on external corridors.
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. LEDGER STATE DEPOSIT MODAL OVERLAY */}
      {/* ========================================== */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4 items-start border-b border-slate-800 pb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                <ArrowDownLeft className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5 animate-fade-in">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Aura Spot Funding Node</h3>
                <p className="text-xs text-slate-400">Direct sandbox treasury clearing system</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-805 space-y-2 select-all text-xs">
                <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-450 font-semibold uppercase text-[9px]">
                  <span>Treasury Bank Details</span>
                  <span>Sandbox Wire</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name</span>
                  <strong className="text-slate-200">Guaranty Trust Bank (GTBank)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Name</span>
                  <strong className="text-slate-200">CLPR CORRIDOR SETTLEMENT</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number</span>
                  <strong className="text-slate-250 font-mono">0114920409</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference memo</span>
                  <strong className="text-amber-500 font-mono">CLPR-SANDBOX-REF</strong>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Choose Deposit simulation limits:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[50000, 500000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/accounts/deposit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ accountId: "acc_1", amount: amt })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            alert(data.message);
                            fetchData();
                            setShowDepositModal(false);
                          } else {
                            alert(`Ledger sync failure: Unable to complete transfer for ₦${amt.toLocaleString()}`);
                          }
                        } catch (err) {
                          alert(`Connection interruption error: Failed to fetch`);
                        }
                      }}
                      className="py-2.5 bg-slate-950 hover:bg-slate-805 border border-slate-805 rounded-xl text-xs font-black font-sans text-white uppercase transition-colors cursor-pointer text-center"
                    >
                      +₦{amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed text-center">
              Selecting a limit immediately posts a real bank ledger update to the sandbox node server.
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. CLI_YIELD STAKING NODE OVERLAY */}
      {/* ========================================== */}
      {showStakingModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in shadow-2xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative space-y-5 animate-scale-up text-xs text-slate-300">
            <button
              onClick={() => setShowStakingModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4 items-start border-b border-slate-800 pb-4">
              <div className="p-3 bg-indigo-505/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cliper Easy Earn Staking</h3>
                <p className="text-[10px] text-slate-400">Lock assets instantly for high-yield rewards</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-805 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-white">Ethereum Node Staking</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Locked for 30 Days</span>
                </div>
                <strong className="text-lg font-mono text-emerald-400">8.5% APY</strong>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-805 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-white">Bitcoin Clearing Node</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Locked for 60 Days</span>
                </div>
                <strong className="text-lg font-mono text-emerald-400">14.2% APY</strong>
              </div>
            </div>

            <button
              onClick={() => {
                alert("STAKING DEPLOYED! Your designated holdings are logged inside Cliper high yield pools.");
                setShowStakingModal(false);
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase"
            >
              Authorize Staking Contract
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. PUZZLE DECRYPTION GAME MODAL OVERLAY */}
      {/* ========================================== */}
      {showPuzzleHuntMiniGame && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <button
              onClick={() => {
                setShowPuzzleHuntMiniGame(false);
                setPuzzleInput("");
                setPuzzleOutcome("IDLE");
                setPuzzleFeedbackMsg("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <span className="text-4xl filter drop-shadow animate-pulse select-none block">🧩</span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Vault Decryption Padlock cracker</h3>
              <p className="text-xs text-slate-404">Decrypt security locks inside the code to claim a sandbox bounty of ₦150,000!</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-805 space-y-2 text-xs">
              <span className="text-[9px] text-amber-500 uppercase font-black tracking-widest block">PADLOCK VAULT SECURITY HINT</span>
              <p className="text-slate-300 font-serif leading-relaxed italic">
                "The year of this Cliper Lagos release is 3000. Combine the release letters 'CLI' with its key number: 'CLI' + '3000' = ...?"
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type Decryption Key..."
                value={puzzleInput}
                onChange={(e) => setPuzzleInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 focus:border-amber-500 rounded-xl p-3 text-sm text-center font-mono font-bold tracking-widest text-[#f59e0b] outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-600"
              />

              {puzzleFeedbackMsg && (
                <p className={`text-xs font-black text-center ${puzzleOutcome === "SUCCESS" ? "text-emerald-450" : "text-rose-450"}`}>
                  {puzzleFeedbackMsg}
                </p>
              )}

              <button
                onClick={async () => {
                  if (puzzleInput.toUpperCase().trim() === puzzleAnswer) {
                    setPuzzleOutcome("SUCCESS");
                    setPuzzleFeedbackMsg("DECRYPTION WINNER! Connecting GTBank API to dispatch cash reward...");
                    try {
                      const res = await fetch("/api/sandbox/quiz-reward", { method: "POST" });
                      if (res.ok) {
                        const data = await res.json();
                        setPuzzleFeedbackMsg(data.message);
                        fetchData(); // Settle live values!
                      }
                    } catch {
                      setPuzzleFeedbackMsg("Excellent! You cracked the code CLI3000 and won ₦150,000 cash credit.");
                    }
                  } else {
                    setPuzzleOutcome("FAILED");
                    setPuzzleFeedbackMsg("DECRYPTION ERROR! Host response mismatch code.");
                  }
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-xs uppercase"
              >
                Run Decrypter Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 5. DEFI BOT TERMINAL CONSOLE PANEL */}
      {/* ========================================== */}
      {showBotTerminal && (
        <div className="fixed bottom-6 right-6 max-w-xs sm:max-w-sm w-full bg-slate-950 border border-indigo-500/30 rounded-2xl shadow-2xl p-4 z-40 animate-fade-in font-mono space-y-3 text-[11px]">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <Cpu className="w-3.5 h-3.5" /> Bot Node #0114 Active
            </span>
            <button
              onClick={() => setShowBotTerminal(false)}
              className="text-slate-500 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-md h-40 overflow-y-auto space-y-1.5 text-slate-400 select-all leading-normal">
            {botLogs.map((log, idx) => (
              <p key={idx}>{log}</p>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={async () => {
                setBotLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Querying Lagos P2P Spread opportunities...`, `[${new Date().toLocaleTimeString()}] Arbitrage settled! credited ₦42,000.`]);
                // Direct POST deposit
                await fetch("/api/accounts/deposit", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ accountId: "acc_1", amount: 42000 })
                });
                fetchData();
              }}
              className="w-full py-1 px-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold uppercase rounded-lg text-[9px] cursor-pointer text-center"
            >
              Speed Up Arbitrage Cycle
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. CRYPTO SALE DIRECT CONFIRMATION MODAL */}
      {/* ========================================== */}
      {showCryptoSellConfirmation && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <button
              onClick={() => setShowCryptoSellConfirmation(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4 items-start border-b border-slate-800 pb-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
                <ArrowUpRight className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirm Crypto Sale</h3>
                <p className="text-xs text-slate-400 font-medium">Please review your liquidation transaction details below.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-805 space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-900/40 pb-2">
                  <span className="text-slate-450 uppercase text-[9px] font-black tracking-widest block">Liquidation Amount</span>
                  <strong className="text-white text-sm font-mono tracking-tight font-extrabold">
                    {showCryptoSellConfirmation.amount} {showCryptoSellConfirmation.coinSymbol}
                  </strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900/40 pb-2">
                  <span className="text-slate-450 uppercase text-[9px] font-black tracking-widest block">Recipient Bank</span>
                  <div className="text-right">
                    <strong className="text-slate-200 block text-xs font-bold">{showCryptoSellConfirmation.destinationAcc.bankName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">A/C: *{showCryptoSellConfirmation.destinationAcc.accountNumber.slice(-4)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-450 uppercase text-[9px] font-black tracking-widest block">Est. Proceeds Credit</span>
                  <strong className="text-emerald-400 text-base font-mono font-extrabold">
                    {formatGBP(showCryptoSellConfirmation.calculatedProceeds, showCryptoSellConfirmation.destinationAcc.currency)}
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-550/20 rounded-xl text-[10.5px] text-amber-505 leading-relaxed font-medium">
                Slippage locks and instant liquidity network clearing rates have been locked for this transaction. Proceeds clear instantly to your clearing bank.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCryptoSellConfirmation(null)}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors uppercase border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const symbol = showCryptoSellConfirmation.coinSymbol;
                    setShowCryptoSellConfirmation(null);
                    await handleCryptoSellSubmit(symbol);
                  }}
                  className="py-2.5 px-4 bg-rose-600 hover:bg-rose-550 active:bg-rose-700 text-white font-black rounded-xl text-xs transition-colors uppercase select-none"
                >
                  Confirm &amp; Sell
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
