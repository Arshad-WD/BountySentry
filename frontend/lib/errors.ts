export function isUserRejected(err: any): boolean {
    if (!err) return false;

    // Check top level code
    if (err.code === "ACTION_REJECTED" || err.code === 4001) return true;

    // Check nested info/error structures common in Ethers v6/MetaMask
    if (err.info?.error?.code === 4001) return true;
    if (err.error?.code === 4001) return true;

    // Check message and reason strings
    const msg = (err.message || "").toLowerCase();
    const reason = (err.reason || "").toLowerCase();

    return msg.includes("user rejected") ||
        msg.includes("user denied") ||
        reason.includes("rejected") ||
        reason.includes("denied");
}

export function handleTxError(err: any, fallbackMessage: string = "Transaction failed") {
    console.error("Transaction Error:", err);
    if (isUserRejected(err)) {
        alert("Transaction Cancelled: You rejected the request in your wallet.");
    } else {
        const message = err.reason || err.message || fallbackMessage;
        alert(`${fallbackMessage}: ${message}`);
    }
}
