import React, { useRef } from 'react';
import { X, Printer, Barcode as BarcodeIcon, Tag, Package } from 'lucide-react';
import BarcodeSvg from './BarcodeSvg';
import { useAuth } from '../context/AuthContext';

const BarcodeLabelModal = ({ product, isOpen, onClose }) => {
  const { user } = useAuth();
  const printRef = useRef(null);

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Product Barcode Label</h3>
              <p className="text-xs text-slate-500">Printable inventory retail barcode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Label Printable Content Box */}
        <div className="p-6 flex flex-col items-center justify-center">
          <div
            ref={printRef}
            className="printable-barcode-label w-full max-w-xs border-2 border-dashed border-slate-300 rounded-xl p-5 bg-white shadow-sm text-center flex flex-col items-center space-y-3"
          >
            {/* Org Header */}
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 w-full">
              {user?.organization?.name || 'StockCloud Inventory'}
            </div>

            {/* Product Info */}
            <div>
              <h4 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-2">
                {product.name}
              </h4>
              <div className="flex items-center justify-center space-x-2 mt-1 text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            {/* SVG Barcode */}
            <div className="py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 w-full flex justify-center">
              <BarcodeSvg value={product.barcode || product.sku} width={2} height={60} showText={true} />
            </div>

            {/* Price Tag */}
            <div className="flex items-center justify-between w-full pt-2 border-t border-slate-100 px-2">
              <span className="text-xs text-slate-500 font-medium">RETAIL PRICE</span>
              <span className="text-xl font-extrabold text-red-600">
                ₹{Number(product.sellingPrice || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
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
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeLabelModal;
