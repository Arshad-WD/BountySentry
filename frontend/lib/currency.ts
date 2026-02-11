/**
 * Simple mock currency utility for the V5 Protocol.
 * In a production app, this would fetch from a real-time price oracle like Chainlink.
 */

const MOCK_ETH_PRICE = 2650; // $2,650 per ETH

export const Currency = {
    toUSD: (ethAmount: string | number) => {
        const eth = typeof ethAmount === "string" ? parseFloat(ethAmount) : ethAmount;
        if (isNaN(eth)) return "$0.00";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(eth * MOCK_ETH_PRICE);
    },

    getExchangeRate: () => MOCK_ETH_PRICE
};
