/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Wallet, 
  Landmark, 
  RefreshCcw, 
  TrendingUp, 
  Info, 
  Lock, 
  Gift, 
  ChevronDown, 
  Check, 
  Coins, 
  ArrowRightLeft, 
  Sparkles, 
  Building, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { BankAccount, Cryptocurrency } from "../types";

interface HeaderProps {
  bankAccounts: BankAccount[];
  totalPortfolioFiat: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cryptoAssets: Cryptocurrency[];
  setSelectedBuyCoin: (coin: Cryptocurrency | null) => void;
  setSelectedSellCoin: (coin: Cryptocurrency | null) => void;
  setSelectedGiftCardId: (id: string) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export default function Header({
  bankAccounts,
  totalPortfolioFiat,
  activeTab,
  setActiveTab,
  cryptoAssets,
  setSelectedBuyCoin,
  setSelectedSellCoin,
  setSelectedGiftCardId,
  theme,
  setTheme,
}: HeaderProps) {
  // Dropdown menus states
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeChannelPrompt, setActiveChannelPrompt] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format currency helper
  const formatCurrency = (val: number, currency: string = "NGN", symbol: string = "₦") => {
    try {
      return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
        style: "currency",
        currency: currency,
      }).format(val);
    } catch {
      return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Detailed product structure for our Master Menu Bar
  const menuCategories = [
    {
      id: "crypto",
      label: "Crypto Trading Hub",
      tab: "market",
      icon: TrendingUp,
      badge: "OTC Core",
      description: "Buy/Sell major high-liquidity crypto assets instantly via local Naira rails",
      products: [
        { name: "Live Crypto Rates Index", action: "COIN_INDEX", desc: "View real-time ticker prices & charts", icon: Coins },
        { name: "Buy Bitcoin (BTC)", action: "BUY_BTC", desc: "Instant settlement with Local Bank accounts", icon: ArrowRightLeft },
        { name: "Buy Ethereum (ETH)", action: "BUY_ETH", desc: "Acquire ETH instantly via local NIP fast rail", icon: ArrowRightLeft },
        { name: "Buy Tether (USDT)", action: "BUY_USDT", desc: "Lock currency values in Web3 stablecoins", icon: ArrowRightLeft },
        { name: "Sell Bitcoin (BTC)", action: "SELL_BTC", desc: "Offramp BTC holdings to instant Cash payouts", icon: RefreshCcw },
        { name: "Sell Ethereum (ETH)", action: "SELL_ETH", desc: "Offramp ETH to NGN, GHS, or ZAR balances", icon: RefreshCcw },
        { name: "Sell Tether (USDT)", action: "SELL_USDT", desc: "Convert stablecoins to direct local yields", icon: RefreshCcw },
      ]
    },
    {
      id: "fiat",
      label: "Bank Transfer & Remittances",
      tab: "transfer",
      icon: Landmark,
      badge: "NIP Active",
      description: "Dispatch local fiat funds or mobile ledger equivalents across multiple countries",
      products: [
        { name: "Transfer to Local Bank Account", action: "TRANSFER_BANK", desc: "Fast NIP transfer to GTBank, Access Bank, standard bank", icon: Building },
        { name: "Remit to Ghana MTN MoMo", action: "TRANSFER_GHANA", desc: "Instant cross-border mobile money settlement", icon: Sparkles },
        { name: "Add Fast Local Ledger Node", action: "TRANSFER_BANK", desc: "Link secondary accounts for fast offramping", icon: Landmark }
      ]
    },
    {
      id: "giftcards",
      label: "OTC Gift Card Desks",
      tab: "giftcards",
      icon: Gift,
      badge: "₦ Payouts",
      description: "Redeem any international claim card code for instant cash or stablecoins",
      products: [
        { name: "Redeem Apple Gift Card", action: "GC_apple", desc: "Highest rate payout: ₦1,250/$", icon: Sparkles },
        { name: "Redeem Amazon Gift Card", action: "GC_amazon", desc: "Premium claim rate: ₦1,100/$", icon: Sparkles },
        { name: "Redeem Steam Wallet Codes", action: "GC_steam", desc: "Critical demand rate: ₦1,350/$", icon: Sparkles },
        { name: "Redeem Google Play Pins", action: "GC_googleplay", desc: "NIP payout rate: ₦1,150/$", icon: Sparkles },
        { name: "Redeem Razer Gold Pins", action: "GC_razer", desc: "Gamers premium corridor: ₦1,380/$", icon: Sparkles },
        { name: "Redeem Sephora claim codes", action: "GC_sephora", desc: "Direct wallet rate: ₦1,220/$", icon: Sparkles },
        { name: "Redeem Nordstrom Cards", action: "GC_nordstrom", desc: "Rapid offramp rate: ₦1,210/$", icon: Sparkles },
        { name: "Redeem eBay Online Cards", action: "GC_ebay", desc: "Fast verification rate: ₦1,180/$", icon: Sparkles },
      ]
    },
    {
      id: "swap",
      label: "Instant Token Swap",
      tab: "swap",
      icon: RefreshCcw,
      badge: "Free OTC",
      description: "Perform atomic digital swaps on cross-border Web3 token balances",
      products: [
        { name: "Atomic Token Swap", action: "SWAP_INDEX", desc: "Zero-slippage conversion between BTC, ETH, and USDT", icon: RefreshCcw }
      ]
    },
    {
      id: "security",
      label: "Secure Authentication",
      tab: "security",
      icon: Lock,
      badge: "2FA Active",
      description: "Configure multi-factor authorization and emergency lock features",
      products: [
        { name: "Google Authenticator 2FA", action: "SEC_2FA", desc: "Setup secure TOTP passcode generation", icon: Lock },
        { name: "Backup Recovery Codes", action: "SEC_LOGS", desc: "Download safety codes for account protection", icon: Lock }
      ]
    }
  ];

  // Handles dynamic state configurations when clicking any specific product menu item
  const handleProductSelect = (action: string, productName: string) => {
    setActiveChannelPrompt(`Routing selected service channel: "${productName}" — Ledger configured.`);
    setTimeout(() => {
      setActiveChannelPrompt(null);
    }, 4500);

    if (action === "COIN_INDEX") {
      setActiveTab("market");
      setSelectedBuyCoin(null);
      setSelectedSellCoin(null);
    } else if (action === "BUY_BTC") {
      setActiveTab("market");
      const btc = cryptoAssets.find(c => c.symbol === "BTC");
      if (btc) setSelectedBuyCoin(btc);
      setSelectedSellCoin(null);
    } else if (action === "BUY_ETH") {
      setActiveTab("market");
      const eth = cryptoAssets.find(c => c.symbol === "ETH");
      if (eth) setSelectedBuyCoin(eth);
      setSelectedSellCoin(null);
    } else if (action === "BUY_USDT") {
      setActiveTab("market");
      const usdt = cryptoAssets.find(c => c.symbol === "USDT");
      if (usdt) setSelectedBuyCoin(usdt);
      setSelectedSellCoin(null);
    } else if (action === "SELL_BTC") {
      setActiveTab("market");
      const btc = cryptoAssets.find(c => c.symbol === "BTC");
      if (btc) setSelectedSellCoin(btc);
      setSelectedBuyCoin(null);
    } else if (action === "SELL_ETH") {
      setActiveTab("market");
      const eth = cryptoAssets.find(c => c.symbol === "ETH");
      if (eth) setSelectedSellCoin(eth);
      setSelectedBuyCoin(null);
    } else if (action === "SELL_USDT") {
      setActiveTab("market");
      const usdt = cryptoAssets.find(c => c.symbol === "USDT");
      if (usdt) setSelectedSellCoin(usdt);
      setSelectedBuyCoin(null);
    } else if (action === "TRANSFER_BANK" || action === "TRANSFER_GHANA") {
      setActiveTab("transfer");
    } else if (action.startsWith("GC_")) {
      setActiveTab("giftcards");
      const cardId = action.split("_")[1];
      setSelectedGiftCardId(cardId);
    } else if (action === "SWAP_INDEX") {
      setActiveTab("swap");
    } else if (action === "SEC_2FA" || action === "SEC_LOGS") {
      setActiveTab("security");
    }

    setOpenMenuId(null);
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-5 md:px-6">
        
        {/* Dynamic Service Activated Feedback Prompt */}
        {activeChannelPrompt && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-650/95 border border-indigo-500/50 rounded-full px-5 py-2 text-xs font-bold text-white shadow-xl flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{activeChannelPrompt}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Brand & Stats */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg ring-4 ring-indigo-500/10 text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Cliper <span className="text-indigo-400 font-semibold text-lg">Exchange</span>
              </h1>
              <p className="text-xs text-slate-400">Nigerian-based Secure Cross-Border Web3 Ledger</p>
            </div>
          </div>

          {/* Right side options: Theme Toggle & Current Portfolio Valuation */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-3 bg-slate-800/60 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/35 rounded-xl text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md select-none"
              title={`Switch to ${theme === "light" ? "Dark Theme" : "Light Theme"}`}
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold leading-none hidden sm:inline">Dark Theme</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <span className="text-xs font-bold leading-none hidden sm:inline">Light Theme</span>
                </>
              )}
            </button>

            {/* Current Portfolio Valuation */}
            <div className="bg-slate-800/60 rounded-xl px-5 py-3 border border-slate-700 flex items-center gap-4 hover:border-indigo-500/30 transition-all">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Total Portfolio Asset Value
                </span>
                <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
                  {formatCurrency(totalPortfolioFiat, "NGN", "₦")}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-xs text-slate-400 space-y-0.5 max-w-[170px]">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-medium border-b border-slate-700 pb-0.5">
                  <Info className="w-3 h-3 text-indigo-400" /> Web3 Status
                </span>
                <span className="text-emerald-400 font-semibold text-[11px]">• Online & NIP Active</span>
                <p className="text-[10px] leading-tight text-slate-400">Instant settlements active for multiple corridors.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Accounts Overview Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl border transition-all duration-300 bg-slate-800/40 hover:bg-slate-850 border-slate-750 hover:border-indigo-500/40"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{acc.holderName}</h3>
                  <p className="text-[11px] text-indigo-300 font-medium line-clamp-1">{acc.bankName}</p>
                </div>
                <div className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold font-mono tracking-wider bg-slate-900 border border-slate-800 uppercase ${
                  acc.country === "Nigeria" ? "text-indigo-400" : "text-emerald-400"
                }`}>
                  {acc.country || "Nigeria"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 my-2.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-805">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Account No</span>
                  <span>{acc.accountNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Bank Code</span>
                  <span>{acc.sortCode}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mt-2 pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-505 font-medium">Balance</span>
                <span className="text-md font-bold font-mono text-white">
                  {formatCurrency(acc.balance, acc.currency || "NGN", acc.symbol || "₦")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ----------------- INTERACTIVE PRODUCT MENU BAR ----------------- */}
        <div className="mt-6 border-t border-slate-800 pt-5 space-y-4" ref={dropdownRef}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-indigo-400 uppercase tracking-[0.2em] font-extrabold block">
              Cliper OTC Product Directory & Services Menu
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Corridor Ledger Protected
            </span>
          </div>

          {/* Desktop & Mobile Menu Bar grid */}
          <div className="flex flex-wrap gap-2.5">
            {menuCategories.map((category) => {
              const Icon = category.icon;
              const isDropdownOpen = openMenuId === category.id;
              const isTabActive = activeTab === category.tab;
              
              return (
                <div key={category.id} className="relative">
                  <button
                    onClick={() => setOpenMenuId(isDropdownOpen ? null : category.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                      isTabActive 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-650/10"
                        : "bg-slate-950/40 hover:bg-slate-850 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isTabActive ? "text-white" : "text-slate-400"}`} />
                    <span>{category.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold tracking-tight bg-slate-900 uppercase ${
                      isTabActive ? "bg-indigo-750 text-indigo-300" : "text-slate-400"
                    }`}>
                      {category.badge}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu Overlay Panel */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 w-[290px] sm:w-[340px] animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="mb-3 pb-2 border-b border-slate-800">
                        <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold block">Product Corridor</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{category.description}</p>
                      </div>

                      <div className="space-y-1 max-h-[290px] overflow-y-auto pr-1">
                        {category.products.map((p, idx) => {
                          const P_icon = p.icon || Coins;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleProductSelect(p.action, p.name)}
                              className="w-full text-left p-2.5 hover:bg-slate-950/90 rounded-xl transition-all flex items-center justify-between group border border-transparent hover:border-slate-800 cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-slate-950/50 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-900 border border-slate-850">
                                  <P_icon className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium group-hover:text-slate-300">
                                    {p.desc}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-405 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Immediate switch category shortcut */}
                      <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500">Fast Mode Navigation</span>
                        <button
                          onClick={() => {
                            setActiveTab(category.tab);
                            setOpenMenuId(null);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hover:border-slate-700"
                        >
                          Open Dashboard Tab
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Active Route Indicator Bar */}
          <div className="bg-slate-950 border border-slate-805 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Active Directory Protocol Channel:</span>
              <span className="font-bold text-slate-200 font-mono capitalize">
                {activeTab === "market" ? "Crypto Asset Markets, Spot Buy / Sell" : 
                 activeTab === "transfer" ? "Local NIP Banks & Mobile Money Ledger" : 
                 activeTab === "swap" ? "Atomic Token Swap Vault" : 
                 activeTab === "giftcards" ? "OTC International Gift Card Trade Desk" : "Secure Authentication Protocol"}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">●</span> Payout Status: <strong className="text-indigo-400">Instant</strong>
              </span>
              <span>Ledger Node: <strong className="text-slate-300 font-mono">CLI-3000-NIP</strong></span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
