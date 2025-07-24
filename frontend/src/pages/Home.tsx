import React, { useState, useEffect } from 'react';

interface Transaction {
    _id: string;
    description: string;
    createdAt: string;
    amount: number;
    type: 'positive' | 'negative';
}
interface User {
    _id: string,
    firstName: string,
    lastName: string,
    balance: number
}

const BASE_URL = 'http://localhost:8085';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0000005e] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [userData, setUserData] = useState<User>({
        _id: "tfvcwiwboeeion",
        firstName: "",
        lastName: "",
        balance: 0
    })

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
    const [transactionError, setTransactionError] = useState<string | null>(null);

    const [showSendModal, setShowSendModal] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showPayBillModal, setShowPayBillModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);

    const [sendRecipient, setSendRecipient] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [sendMessage, setSendMessage] = useState('');

    const [receiveSender, setReceiveSender] = useState('');
    const [receiveAmount, setReceiveAmount] = useState('');
    const [receiveLoading, setReceiveLoading] = useState(false);
    const [receiveMessage, setReceiveMessage] = useState('');

    const [billBiller, setBillBiller] = useState('');
    const [billAccount, setBillAccount] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const [billLoading, setBillLoading] = useState(false);
    const [billMessage, setBillMessage] = useState('');

    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpMethod, setTopUpMethod] = useState('Card');
    const [topUpLoading, setTopUpLoading] = useState(false);
    const [topUpMessage, setTopUpMessage] = useState('');


    const fetchTransactions = async () => {
        setLoadingTransactions(true);
        setTransactionError(null);
        try {
            const response = await fetch(`${BASE_URL}/transactions/${localStorage.getItem("userID")}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const { transactions, user }: { transactions: Transaction[], user: User } = await response.json();
            setTransactions(transactions);
            setUserData(user)

        } catch (error: any) {
            setTransactionError(`Failed to fetch transactions: ${error.message}`);
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);


    const handleSendMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendLoading(true);
        setSendMessage('');
        try {
            const response = await fetch(`${BASE_URL}/transactions/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientEmail: sendRecipient, amount: parseFloat(sendAmount) }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send money.');
            }
            setSendMessage('Money sent successfully!');
            setSendRecipient('');
            setSendAmount('');
            fetchTransactions();
            setTimeout(() => setShowSendModal(false), 1500);
        } catch (error: any) {
            setSendMessage(`Error: ${error.message}`);
        } finally {
            setSendLoading(false);
        }
    };

    const handleReceiveMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        setReceiveLoading(true);
        setReceiveMessage('');
        try {
            const response = await fetch(`${BASE_URL}/transactions/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderEmail: receiveSender, amount: parseFloat(receiveAmount) }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to request money.');
            }
            setReceiveMessage('Money request sent successfully!');
            setReceiveSender('');
            setReceiveAmount('');
            fetchTransactions();
            setTimeout(() => setShowReceiveModal(false), 1500);
        } catch (error: any) {
            setReceiveMessage(`Error: ${error.message}`);
        } finally {
            setReceiveLoading(false);
        }
    };

    const handlePayBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setBillLoading(true);
        setBillMessage('');
        try {
            const response = await fetch(`${BASE_URL}/transactions/paybill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ biller: billBiller, accountNumber: billAccount, amount: parseFloat(billAmount) }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to pay bill.');
            }
            setBillMessage('Bill paid successfully!');
            setBillBiller('');
            setBillAccount('');
            setBillAmount('');
            fetchTransactions();
            setTimeout(() => setShowPayBillModal(false), 1500);
        } catch (error: any) {
            setBillMessage(`Error: ${error.message}`);
        } finally {
            setBillLoading(false);
        }
    };

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setTopUpLoading(true);
        setTopUpMessage('');
        try {
            const response = await fetch(`${BASE_URL}/transactions/topup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(topUpAmount), method: topUpMethod }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to top up.');
            }
            setTopUpMessage('Account topped up successfully!');
            setTopUpAmount('');
            setTopUpMethod('Card');
            fetchTransactions();
            setTimeout(() => setShowTopUpModal(false), 1500);
        } catch (error: any) {
            setTopUpMessage(`Error: ${error.message}`);
        } finally {
            setTopUpLoading(false);
        }
    };
    function formatDate(dateString: string): string {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);

        let dayOfWeek = '';
        let month = '';
        let dayOfMonth = '';
        let hour = '';
        let minute = '';

        for (const part of parts) {
            switch (part.type) {
                case 'weekday':
                    dayOfWeek = part.value;
                    break;
                case 'month':
                    month = part.value;
                    break;
                case 'day':
                    dayOfMonth = part.value;
                    break;
                case 'hour':
                    hour = part.value;
                    break;
                case 'minute':
                    minute = part.value;
                    break;
            }
        }

        return `${dayOfWeek}, ${month} ${dayOfMonth} at ${hour}:${minute}`;
    }

    return (
        <div className="min-h-screen  flex justify-center items-start">
            {/* Main E-Wallet Content Container */}
            <div className="w-full mx-auto rounded-lg shadow-xl flex flex-col min-h-[calc(100vh-2rem)]">

                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#6f66c7] to-[#d38de7] text-white p-5 flex justify-between items-center relative z-10  rounded-b-[20px] md:rounded-b-none">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👋</span>
                        <span className="font-semibold text-lg">Hi, {userData.firstName + " " + userData.lastName}!</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Info Icon */}
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        </svg>
                        {/* Notification Icon */}
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z" />
                        </svg>
                    </div>
                    {/* Subtle shadow for header */}
                    <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4/5 h-5 bg-black/10 rounded-full blur-md -z-10"></div>
                </div>

                {/* Balance Card Section */}
                <div className="bg-gradient-to-br from-[#3fccd6] to-[#94d5fa] text-white mx-5  p-6 rounded-2xl shadow-md relative z-50 mb-12 -mt-3">
                    <p className="text-sm opacity-80">Total Balance</p>
                    <h3 className="text-4xl font-bold mt-1">${userData.balance}</h3>
                    <div className="flex justify-between items-center text-sm mt-4">
                        <span>Account: **** 1234</span>
                        <span className="flex items-center gap-1">
                            {/* Secure Icon */}
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                            </svg>
                            Secure
                        </span>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="flex justify-around px-5 mt-[-20px] z-20">
                    {/* Action Button: Send */}
                    <div
                        className="flex flex-col items-center gap-2 text-gray-700 text-sm font-medium cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                        onClick={() => setShowSendModal(true)}
                    >
                        <div className="bg-gray-100 p-3 rounded-full text-[#6f66c7] shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className='h-6 w-6'><path d="M31 169C21.6 159.6 21.6 144.4 31 135.1L103 63C112.4 53.6 127.6 53.6 136.9 63C146.2 72.4 146.3 87.6 136.9 96.9L105.9 127.9L173.6 127.9L173.6 127.9L511.9 127.9C547.2 127.9 575.9 156.6 575.9 191.9L575.9 370.1L570.8 365C542.7 336.9 497.1 336.9 469 365C441.8 392.2 440.9 435.6 466.2 463.9L533.9 463.9L502.9 432.9C493.5 423.5 493.5 408.3 502.9 399C512.3 389.7 527.5 389.6 536.8 399L608.8 471C618.2 480.4 618.2 495.6 608.8 504.9L536.8 576.9C527.4 586.3 512.2 586.3 502.9 576.9C493.6 567.5 493.5 552.3 502.9 543L533.9 512L127.8 512C92.5 512 63.8 483.3 63.8 448L63.8 269.8L68.9 274.9C97 303 142.6 303 170.7 274.9C197.9 247.7 198.8 204.3 173.5 176L105.8 176L136.8 207C146.2 216.4 146.2 231.6 136.8 240.9C127.4 250.2 112.2 250.3 102.9 240.9L31 169zM416 320C416 267 373 224 320 224C267 224 224 267 224 320C224 373 267 416 320 416C373 416 416 373 416 320zM504 255.5C508.4 256 512 252.4 512 248L512 200C512 195.6 508.4 192 504 192L456 192C451.6 192 447.9 195.6 448.5 200C452.1 229 475.1 251.9 504 255.5zM136 384.5C131.6 384 128 387.6 128 392L128 440C128 444.4 131.6 448 136 448L184 448C188.4 448 192.1 444.4 191.5 440C187.9 411 164.9 388.1 136 384.5z" /></svg>
                        </div>
                        <span>Send</span>
                    </div>
                    {/* Action Button: Receive */}
                    <div
                        className="flex flex-col items-center gap-2 text-gray-700 text-sm font-medium cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                        onClick={() => setShowReceiveModal(true)}
                    >
                        <div className="bg-gray-100 p-3 rounded-full text-[#6f66c7] shadow-sm">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 11h-9V2c0-.55-.45-1-1-1s-1 .45-1 1v9H2c-.55 0-1 .45-1 1s.45 1 1 1h9v9c0 .55.45 1 1 1s1-.45 1-1v-9h9c.55 0 1-.45 1-1s-.45-1-1-1z" />
                            </svg>
                        </div>
                        <span>Receive</span>
                    </div>
                    {/* Action Button: Pay Bills */}
                    <div
                        className="flex flex-col items-center gap-2 text-gray-700 text-sm font-medium cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                        onClick={() => setShowPayBillModal(true)}
                    >
                        <div className="bg-gray-100 p-3 rounded-full text-[#6f66c7] shadow-sm">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </div>
                        <span>Pay Bills</span>
                    </div>
                    {/* Action Button: Top Up */}
                    <div
                        className="flex flex-col items-center gap-2 text-gray-700 text-sm font-medium cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                        onClick={() => setShowTopUpModal(true)}
                    >
                        <div className="bg-gray-100 p-3 rounded-full text-[#6f66c7] shadow-sm">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                            </svg>
                        </div>
                        <span>Top Up</span>
                    </div>
                </div>

                {/* Recent Transactions Section */}
                <div className="flex-grow p-5 overflow-y-auto bg-gray-50 rounded-b-lg mt-5">
                    <div className="flex items-center justify-between w-full">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 inline">Recent Transactions</h4>
                        <button
                            onClick={fetchTransactions}
                            className=" text-white rounded-md hover:opacity-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className='h-6  transform will-change-transform transition-all duration-500 active:rotate-[360deg]'
                                viewBox="0 0 640 640"><path d="M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z" /></svg>
                        </button>
                    </div>
                    {loadingTransactions ? (
                        <div className="text-center text-gray-500">Loading transactions...</div>
                    ) : transactionError ? (
                        <div className="text-center text-gray-800 bg-gray-200 p-3 rounded-md">{transactionError}</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center text-gray-500">No transactions found.</div>
                    ) : (
                        <div className="transaction-list">
                            {transactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center">
                                        <div className={`bg-gray-100 text-[#6f66c7] p-2 rounded-full text-lg mr-3`}>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                {
                                                    transaction.type == "positive" ?
                                                        <path d="M22 11h-9V2c0-.55-.45-1-1-1s-1 .45-1 1v9H2c-.55 0-1 .45-1 1s.45 1 1 1h9v9c0 .55.45 1 1 1s1-.45 1-1v-9h9c.55 0 1-.45 1-1s-.45-1-1-1z" />
                                                        :
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                                                }
                                            </svg>
                                        </div>
                                        <div className="transaction-details">
                                            <p className="font-medium text-gray-900">{transaction.description}</p>
                                            <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                                        </div>
                                    </div>
                                    <span className={`font-semibold ${transaction.type === 'positive' ? 'text-[#3fccd6]' : 'text-gray-800'}`}>
                                        {transaction.type === 'negative' && '-'}${Math.abs(transaction.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}


                </div>
            </div>

            {/* Send Money Modal */}
            <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Send Money">
                <form onSubmit={handleSendMoney} className="space-y-4">
                    {sendMessage && (
                        <div className={`p-3 rounded-md text-sm ${sendMessage.includes('Error') ? 'bg-gray-200 text-gray-800' : 'bg-[#94d5fa] text-[#6f66c7]'}`}>
                            {sendMessage}
                        </div>
                    )}
                    <div>
                        <label htmlFor="sendRecipient" className="block text-sm font-medium text-gray-700">Recipient Email</label>
                        <input
                            type="email"
                            id="sendRecipient"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={sendRecipient}
                            onChange={(e) => setSendRecipient(e.target.value)}
                            required
                            disabled={sendLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="sendAmount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            id="sendAmount"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            required
                            disabled={sendLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6f66c7] text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6f66c7] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={sendLoading}
                    >
                        {sendLoading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </Modal>

            {/* Receive Money Modal */}
            <Modal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} title="Request Money">
                <form onSubmit={handleReceiveMoney} className="space-y-4">
                    {receiveMessage && (
                        <div className={`p-3 rounded-md text-sm ${receiveMessage.includes('Error') ? 'bg-gray-200 text-gray-800' : 'bg-[#94d5fa] text-[#6f66c7]'}`}>
                            {receiveMessage}
                        </div>
                    )}
                    <div>
                        <label htmlFor="receiveSender" className="block text-sm font-medium text-gray-700">Sender Email (Optional)</label>
                        <input
                            type="email"
                            id="receiveSender"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={receiveSender}
                            onChange={(e) => setReceiveSender(e.target.value)}
                            disabled={receiveLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="receiveAmount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            id="receiveAmount"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={receiveAmount}
                            onChange={(e) => setReceiveAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            required
                            disabled={receiveLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6f66c7] text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6f66c7] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={receiveLoading}
                    >
                        {receiveLoading ? 'Requesting...' : 'Request'}
                    </button>
                </form>
            </Modal>

            {/* Pay Bill Modal */}
            <Modal isOpen={showPayBillModal} onClose={() => setShowPayBillModal(false)} title="Pay Bill">
                <form onSubmit={handlePayBill} className="space-y-4">
                    {billMessage && (
                        <div className={`p-3 rounded-md text-sm ${billMessage.includes('Error') ? 'bg-gray-200 text-gray-800' : 'bg-[#94d5fa] text-[#6f66c7]'}`}>
                            {billMessage}
                        </div>
                    )}
                    <div>
                        <label htmlFor="billBiller" className="block text-sm font-medium text-gray-700">Biller Name</label>
                        <input
                            type="text"
                            id="billBiller"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={billBiller}
                            onChange={(e) => setBillBiller(e.target.value)}
                            required
                            disabled={billLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="billAccount" className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input
                            type="text"
                            id="billAccount"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={billAccount}
                            onChange={(e) => setBillAccount(e.target.value)}
                            required
                            disabled={billLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="billAmount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            id="billAmount"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={billAmount}
                            onChange={(e) => setBillAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            required
                            disabled={billLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6f66c7] text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6f66c7] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={billLoading}
                    >
                        {billLoading ? 'Paying...' : 'Pay Bill'}
                    </button>
                </form>
            </Modal>

            {/* Top Up Modal */}
            <Modal isOpen={showTopUpModal} onClose={() => setShowTopUpModal(false)} title="Top Up Account">
                <form onSubmit={handleTopUp} className="space-y-4">
                    {topUpMessage && (
                        <div className={`p-3 rounded-md text-sm ${topUpMessage.includes('Error') ? 'bg-gray-200 text-gray-800' : 'bg-[#94d5fa] text-[#6f66c7]'}`}>
                            {topUpMessage}
                        </div>
                    )}
                    <div>
                        <label htmlFor="topUpAmount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            id="topUpAmount"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            required
                            disabled={topUpLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="topUpMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            id="topUpMethod"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                            value={topUpMethod}
                            onChange={(e) => setTopUpMethod(e.target.value)}
                            disabled={topUpLoading}
                        >
                            <option value="Card">Credit/Debit Card</option>
                            <option value="Bank">Bank Transfer</option>
                            <option value="MobileMoney">Mobile Money</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6f66c7] text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6f66c7] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={topUpLoading}
                    >
                        {topUpLoading ? 'Topping Up...' : 'Top Up'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default App;
