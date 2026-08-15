import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode as BarcodeIcon,
  Camera,
  ShoppingCart,
  ArrowDownCircle,
  RotateCcw,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Package,
} from 'lucide-react';
import api from '../services/api';
import BarcodeSvg from '../components/BarcodeSvg';
import BarcodeLabelModal from '../components/BarcodeLabelModal';
import ReceiptModal from '../components/ReceiptModal';
import CameraScannerModal from '../components/CameraScannerModal';

const ScanPage = () => {
  const [scanMode, setScanMode] = useState('SALE'); // SALE, STOCK_IN, RETURN, ADJUSTMENT
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'warning', message: '' }
  const [scannedProduct, setScannedProduct] = useState(null);

  // Cart State for SALE Mode
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');

  // Form States for Stock In / Return / Adjustment
  const [formQty, setFormQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState('');

  // Modals
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const barcodeInputRef = useRef(null);

  useEffect(() => {
    // Keep focus on barcode input field for instant USB barcode scanner entry
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [scanMode]);

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleScanBarcode = async (codeToScan) => {
    const targetBarcode = (codeToScan || barcodeInput).trim();
    if (!targetBarcode) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await api.post('/scanner/scan', { barcode: targetBarcode, mode: scanMode });
      if (res.data.success) {
        const prod = res.data.product;
        setScannedProduct(prod);
        setFormQty(1);
        setAdjustReason('');
        showToast('success', `✓ Product found: ${prod.name}`);

        // If in SALE mode, automatically add to POS cart
        if (scanMode === 'SALE') {
          addToCart(prod);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Product not found for this barcode';
      setScannedProduct(null);
      showToast('error', `✕ ${msg}`);
    } finally {
      setLoading(false);
      setBarcodeInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanBarcode();
    }
  };

  // Cart operations for SALE mode
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === product.id || item._id === product._id);
      if (existingIdx > -1) {
        const existing = prevCart[existingIdx];
        const newQty = existing.quantity + 1;
        if (newQty > product.stock) {
          showToast('warning', `⚠ Cannot add more. Max stock available: ${product.stock}`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIdx] = { ...existing, quantity: newQty };
        return updated;
      } else {
        if (product.stock < 1) {
          showToast('warning', `⚠ Product '${product.name}' is Out of Stock!`);
          return prevCart;
        }
        return [...prevCart, { ...product, id: product.id || product._id, quantity: 1 }];
      }
    });
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId || item._id === productId) {
          if (newQty > item.stock) {
            showToast('warning', `⚠ Insufficient stock. Maximum available: ${item.stock}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId && item._id !== productId));
  };

  const calculateCartSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  };

  // Checkout Sale
  const handleCheckoutSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        customer: { name: customerName || 'Walk-in Customer', phone: customerPhone },
        items: cart.map((item) => ({
          productId: item.id || item._id,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
        })),
        discount: 0,
        tax: 0,
      };

      const res = await api.post('/sales', payload);
      if (res.data.success) {
        setLastSale(res.data.data);
        setCart([]);
        setScannedProduct(null);
        showToast('success', '✓ Sale completed successfully! Stock updated.');
        setShowReceiptModal(true);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to complete sale checkout');
    } finally {
      setLoading(false);
    }
  };

  // Process Stock In (PURCHASE)
  const handleConfirmStockIn = async () => {
    if (!scannedProduct || formQty <= 0) return;
    setLoading(true);
    try {
      const res = await api.post('/inventory/stock-in', {
        productId: scannedProduct.id || scannedProduct._id,
        quantity: Number(formQty),
      });
      if (res.data.success) {
        showToast('success', `✓ Stock In confirmed (+${formQty} units)`);
        setScannedProduct((prev) => (prev ? { ...prev, stock: prev.stock + Number(formQty) } : null));
        setFormQty(1);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to process Stock In');
    } finally {
      setLoading(false);
    }
  };

  // Process Return
  const handleConfirmReturn = async () => {
    if (!scannedProduct || formQty <= 0) return;
    setLoading(true);
    try {
      const res = await api.post('/inventory/adjust', {
        productId: scannedProduct.id || scannedProduct._id,
        type: 'RETURN',
        quantity: Number(formQty),
        reason: adjustReason || 'Customer Return via Barcode Scan',
      });
      if (res.data.success) {
        showToast('success', `✓ Product Return recorded (+${formQty} units)`);
        setScannedProduct((prev) => (prev ? { ...prev, stock: prev.stock + Number(formQty) } : null));
        setFormQty(1);
        setAdjustReason('');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to record Return');
    } finally {
      setLoading(false);
    }
  };

  // Process Adjustment
  const handleConfirmAdjustment = async () => {
    if (!scannedProduct) return;
    setLoading(true);
    try {
      const res = await api.post('/inventory/adjust', {
        productId: scannedProduct.id || scannedProduct._id,
        type: 'ADJUSTMENT',
        quantity: Number(formQty),
        reason: adjustReason || 'Manual Inventory Audit',
      });
      if (res.data.success) {
        const updatedStock = scannedProduct.stock + Number(formQty);
        showToast('success', `✓ Stock Adjustment saved! New Stock: ${updatedStock}`);
        setScannedProduct((prev) => (prev ? { ...prev, stock: updatedStock } : null));
        setFormQty(1);
        setAdjustReason('');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save stock adjustment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/20">
              <BarcodeIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Barcode Inventory Scanner</h1>
              <p className="text-sm text-slate-500">Scan barcodes for instant Sales, Stock-In, Returns, and Adjustments</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCameraModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
        >
          <Camera className="w-4 h-4" />
          <span>Open Camera Scanner</span>
        </button>
      </div>

      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl shadow-md border flex items-center justify-between transition-all duration-300 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedback.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-3 font-semibold text-sm">
            {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {feedback.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
            {feedback.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setScanMode('SALE')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            scanMode === 'SALE'
              ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>1. Sale Mode</span>
        </button>

        <button
          onClick={() => setScanMode('STOCK_IN')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            scanMode === 'STOCK_IN'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>2. Stock In</span>
        </button>

        <button
          onClick={() => setScanMode('RETURN')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            scanMode === 'RETURN'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>3. Return Mode</span>
        </button>

        <button
          onClick={() => setScanMode('ADJUSTMENT')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            scanMode === 'ADJUSTMENT'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>4. Adjustment</span>
        </button>
      </div>

      {/* Main Grid: Barcode Input & Scanner on Left, Action Panel/Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Barcode Reader & Product Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Barcode Input Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <label className="block text-sm font-extrabold text-slate-900">
              Scan or Enter Product Barcode
            </label>
            <div className="relative">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scan with USB Scanner or type barcode (e.g. 8901234567891)..."
                className="w-full pl-12 pr-28 py-3.5 border-2 border-slate-300 rounded-xl font-mono text-base font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50/50"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <BarcodeIcon className="w-5 h-5" />
              </div>
              <button
                onClick={() => handleScanBarcode()}
                disabled={loading || !barcodeInput.trim()}
                className="absolute right-2 top-2 bottom-2 px-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Find</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 flex items-center justify-between">
              <span>USB scanners automatically submit on scan.</span>
              <span className="font-semibold text-red-600">Active Mode: {scanMode}</span>
            </p>
          </div>

          {/* Scanned Product Details Card */}
          {scannedProduct ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-700">
                    {scannedProduct.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">{scannedProduct.name}</h3>
                  <p className="text-xs text-slate-500">SKU: {scannedProduct.sku}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-red-600">
                    ₹{Number(scannedProduct.sellingPrice).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>

              {/* Barcode & Printable Badge */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <BarcodeSvg value={scannedProduct.barcode || scannedProduct.sku} width={1.5} height={40} showText={false} />
                  <div>
                    <div className="font-mono text-xs font-bold text-slate-800">{scannedProduct.barcode}</div>
                    <div className="text-[10px] text-slate-500">CODE128 Format</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowLabelModal(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Label</span>
                </button>
              </div>

              {/* Stock Status Counters */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Current Stock</div>
                  <div
                    className={`text-lg font-extrabold ${
                      scannedProduct.stock === 0
                        ? 'text-red-600'
                        : scannedProduct.stock <= scannedProduct.reorderLevel
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {scannedProduct.stock} units
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Reorder Level</div>
                  <div className="text-lg font-extrabold text-slate-700">{scannedProduct.reorderLevel} units</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Status</div>
                  <div className="text-xs font-extrabold mt-1">
                    {scannedProduct.stock === 0 ? (
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">OUT OF STOCK</span>
                    ) : scannedProduct.stock <= scannedProduct.reorderLevel ? (
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">LOW STOCK</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">IN STOCK</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Form depending on Scan Mode */}
              {scanMode !== 'SALE' && (
                <div className="pt-4 border-t border-slate-100 space-y-4 bg-slate-50/50 p-4 rounded-xl">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                    <span>
                      {scanMode === 'STOCK_IN' && '📥 Confirm Stock In (Purchase Intake)'}
                      {scanMode === 'RETURN' && '↩ Record Customer Return'}
                      {scanMode === 'ADJUSTMENT' && '⚙ Manual Inventory Adjustment'}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {scanMode === 'ADJUSTMENT' ? 'Quantity (+/-)' : 'Quantity'}
                      </label>
                      <input
                        type="number"
                        value={formQty}
                        onChange={(e) => setFormQty(Number(e.target.value))}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {scanMode !== 'STOCK_IN' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
                        <input
                          type="text"
                          placeholder="e.g., Damaged item, Restock..."
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    {scanMode === 'STOCK_IN' && (
                      <button
                        onClick={handleConfirmStockIn}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                      >
                        Confirm Stock In (+{formQty})
                      </button>
                    )}
                    {scanMode === 'RETURN' && (
                      <button
                        onClick={handleConfirmReturn}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
                      >
                        Confirm Return (+{formQty})
                      </button>
                    )}
                    {scanMode === 'ADJUSTMENT' && (
                      <button
                        onClick={handleConfirmAdjustment}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all"
                      >
                        Confirm Adjustment ({formQty >= 0 ? `+${formQty}` : formQty})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center text-slate-400 space-y-3">
              <Package className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <div className="font-bold text-slate-600">No Product Scanned Yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Scan a barcode using your USB scanner or device camera to load product details and execute transactions.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: POS Shopping Cart for SALE mode */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">POS Sales Cart</h3>
                  <p className="text-xs text-slate-500">{cart.length} item(s) scanned</p>
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer Information Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+91..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                  Cart is empty. Scan barcodes to add products.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id || item._id}
                    className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between"
                  >
                    <div className="space-y-0.5 max-w-[160px]">
                      <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">₹{item.sellingPrice} each</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateCartQty(item.id || item._id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.id || item._id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-extrabold text-slate-900 w-16 text-right">
                        ₹{item.sellingPrice * item.quantity}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id || item._id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Summary */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span>₹{calculateCartSubtotal().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="text-red-600">₹{calculateCartSubtotal().toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={handleCheckoutSale}
                disabled={loading || cart.length === 0}
                className="w-full mt-4 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Complete Checkout & Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CameraScannerModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onScanSuccess={(code) => handleScanBarcode(code)}
      />

      <BarcodeLabelModal
        product={scannedProduct}
        isOpen={showLabelModal}
        onClose={() => setShowLabelModal(false)}
      />

      <ReceiptModal
        sale={lastSale}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
};

export default ScanPage;
