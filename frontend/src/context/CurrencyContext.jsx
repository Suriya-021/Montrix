import React, { createContext, useState, useEffect, useContext } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [rates, setRates] = useState({ INR: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch live market rates relative to INR
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/INR');
        const data = await response.json();
        if (data.rates) {
          setRates(data.rates);
        }
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const formatCurrency = (amountInINR) => {
    if (isNaN(amountInINR) || amountInINR === null) return '₹0';
    
    const rate = rates[currency] || 1;
    const convertedAmount = amountInINR * rate;
    
    let locale = 'en-IN';
    if (currency === 'USD') locale = 'en-US';
    else if (currency === 'EUR') locale = 'en-DE';
    else if (currency === 'GBP') locale = 'en-GB';
    else if (currency === 'JPY') locale = 'ja-JP';
    else if (currency === 'AUD') locale = 'en-AU';
    else if (currency === 'CAD') locale = 'en-CA';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatCurrency, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
