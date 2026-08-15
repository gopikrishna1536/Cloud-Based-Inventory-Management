import React from 'react';
import { X, Printer, CheckCircle2, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReceiptModal = ({ sale, isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Sale Completed</h3>
              <p className="text-xs text-slate-500">Transaction processed successfully</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Container */}
        <div className="p-6">
          <div className="printable-receipt border border-slate-200 rounded-xl p-5 bg-slate-50/50 font-mono text-xs space-y-4 shadow-inner">
            {/* Org Title */}
            <div className="text-center pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-sm uppercase text-slate-900 font-sans tracking-wide">
                {user?.organization?.name || 'ABC Electronics'}
              </h4>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">SaaS Inventory Billing Receipt</p>
              <div className="mt-2 text-[10px] text-slate-400">
                Receipt #{sale._id || `SALE-${Date.now().toString().slice(-5)}`}
              </div>
              <div className="text-[10px] text-slate-400">{formattedDate}</div>
            </div>

            {/* Customer Info */}
            {sale.customer && (
              <div className="pb-2 border-b border-slate-200 text-slate-700">
                <span className="font-bold">Customer:</span> {sale.customer.name || 'Walk-in Customer'}
                {sale.customer.phone && <span className="block text-[11px] text-slate-500">Tel: {sale.customer.phone}</span>}
              </div>
            )}

            {/* Items Table */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 pb-1 border-b border-slate-200 text-[11px]">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/4 text-center">QTY x PRICE</span>
                <span className="w-1/4 text-right">TOTAL</span>
              </div>
              {sale.items &&
                sale.items.map((item, idx) => {
                  const pName = item.productId?.name || item.name || 'Product';
                  const qty = item.quantity || 1;
                  const price = item.sellingPrice || 0;
                  const itemTotal = qty * price;
                  return (
                    <div key={idx} className="flex justify-between text-slate-800 py-1">
                      <span className="w-1/2 truncate font-sans font-medium text-slate-900">{pName}</span>
                      <span className="w-1/4 text-center text-slate-600">
                        {qty} × ₹{price}
                      </span>
                      <span className="w-1/4 text-right font-bold text-slate-900">₹{itemTotal}</span>
                    </div>
                  );
                })}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-200 space-y-1 text-slate-700 font-sans">
              <div className="flex justify-between text-xs">
                <span>Subtotal</span>
                <span>₹{sale.subtotal || sale.totalAmount}</span>
              </div>
              {Boolean(sale.tax) && (
                <div className="flex justify-between text-xs">
                  <span>Tax</span>
                  <span>₹{sale.tax}</span>
                </div>
              )}
              {Boolean(sale.discount) && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{sale.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Amount</span>
                <span className="text-red-600">₹{sale.totalAmount}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-200 font-sans">
              Thank you for shopping with us!
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-500/20 hover:bg-red-700 transition-all flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
