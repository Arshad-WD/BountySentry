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

export type AddToastFn = (message: string, type?: "success" | "error" | "warning" | "info") => void;

export function handleTxError(err: any, fallbackMessage: string = "Transaction failed", addToast?: AddToastFn) {
    console.error("Transaction Error:", err);

    let message = fallbackMessage;
    let type: "error" | "warning" = "error";

    if (isUserRejected(err)) {
        message = "Transaction Cancelled: You rejected the request in your wallet.";
        type = "warning";
    } else {
        message = `${fallbackMessage}: ${err.reason || err.message || "Unknown error"}`;
    }

    if (addToast) {
        addToast(message, type);
    } else {
        // Fallback for non-React contexts or when hook is not available
        alert(message);
    }

    return message;
}
