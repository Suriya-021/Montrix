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

  const formatCurrency = (amountInBase) => {
    if (isNaN(amountInBase) || amountInBase === null) return '$0.00';
    
    const rate = rates[currency] || 1;
    const convertedAmount = Number(amountInBase) * rate;
    
    let locale = 'en-US';
    if (currency === 'INR') locale = 'en-IN';
    else if (currency === 'EUR') locale = 'de-DE';
    else if (currency === 'GBP') locale = 'en-GB';
    else if (currency === 'JPY') locale = 'ja-JP';
    else if (currency === 'AUD') locale = 'en-AU';
    else if (currency === 'CAD') locale = 'en-CA';

    const isZeroDecimal = currency === 'JPY';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatCurrency, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
