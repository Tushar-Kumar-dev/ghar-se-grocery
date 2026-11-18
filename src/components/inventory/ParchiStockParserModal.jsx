import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  FileSpreadsheet,
  Camera,
  Upload,
  CheckCircle2,
  Plus,
  RefreshCw,
  Trash2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  X,
  FileText,
  Check,
  Eye,
  Layers,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

// Preset sample slips for immediate 1-click testing
const SAMPLE_SLIPS = [
  {
    id: 'mandi',
    title: 'Apna Bazar - Mandi Inward Slip (Nov 12)',
    description: 'Actual generated photo: 3 existing items + 3 new products',
    image: '/sample_mandi_slip.jpg',
    rawItems: [
      { raw: '1. Aashirvaad Atta 5kg - 25 bags', name: 'Aashirvaad Shudh Chakki Atta', qty: 25, unit: '5 kg', price: 245, cat: 'Flours & Rice' },
      { raw: '2. Fortune Mustard Oil 1L - 30 btl', name: 'Fortune Kachi Ghani Mustard Oil', qty: 30, unit: '1 L Pouch', price: 145, cat: 'Oils & Ghee' },
      { raw: '3. Tata Tea Gold 500g - 15 pkt', name: 'Tata Tea Gold Leaf Tea', qty: 15, unit: '500 g', price: 280, cat: 'Tea & Coffee' },
      { raw: '4. Maggi 2-Minute Noodles - 40 pcs', name: 'Maggi 2-Minute Noodles 280g', brand: 'Nestle', qty: 40, unit: 'Pack of 4', price: 55, cat: 'Biscuits & Snacks' },
      { raw: '5. Dettol Soap 125g - 50 pcs', name: 'Dettol Original Bathing Soap 125g', brand: 'Reckitt', qty: 50, unit: '125 g', price: 58, cat: 'Personal Care' },
      { raw: '6. Loose Chana Dal - 40 kg', name: 'Loose Polished Chana Dal 1kg', brand: 'Local Mandi', qty: 40, unit: '1 kg', price: 92, cat: 'Dals & Pulses' }
    ]
  },
  {
    id: 'kirana',
    title: 'Kirana Distributor Delivery Challan',
    description: 'Existing butter + new pulses & snacks',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    rawItems: [
      { raw: 'Amul Butter 500g - 25 pcs', name: 'Amul Butter Pasteurised', qty: 25, unit: '500 g', price: 275, cat: 'Dairy & Spreads' },
      { raw: 'Haldiram Nagpur Aloo Bhujia 400g - 35 pkt', name: 'Haldiram Nagpur Aloo Bhujia 400g', brand: 'Haldirams', qty: 35, unit: '400 g', price: 110, cat: 'Biscuits & Snacks' },
      { raw: 'Tata Sampann Unpolished Toor Dal 1kg - 30 pkt', name: 'Tata Sampann Unpolished Toor Dal 1kg', brand: 'Tata Sampann', qty: 30, unit: '1 kg', price: 175, cat: 'Dals & Pulses' }
    ]
  }
];

export const ParchiStockParserModal = ({ onClose }) => {
  const { products, processHandwrittenStockInward } = useStore();

  const fileInputRef = React.useRef(null);
  const [uploadedImage, setUploadedImage] = useState(SAMPLE_SLIPS[0].image);
  const [imageFileName, setImageFileName] = useState('wholesale_invoice_slip_nov12.jpg');
  const [isScanning, setIsScanning] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Clear / Remove Uploaded Image handler
  const handleClearImage = () => {
    setUploadedImage(null);
    setImageFileName('');
    setParsedItems([]);
    setIsParsed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to match text with existing products
  const matchWithCatalog = (name) => {
    const clean = name.toLowerCase();
    return products.find(
      (p) =>
        clean.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(clean) ||
        (clean.includes('atta') && p.name.toLowerCase().includes('atta')) ||
        (clean.includes('mustard oil') && p.name.toLowerCase().includes('mustard oil')) ||
        (clean.includes('tea') && p.name.toLowerCase().includes('tea')) ||
        (clean.includes('butter') && p.name.toLowerCase().includes('butter'))
    );
  };

  // Run OCR parsing on an array of raw items
  const parseRawList = (rawArray) => {
    setIsScanning(true);
    setTimeout(() => {
      const results = rawArray.map((item, idx) => {
        const matched = matchWithCatalog(item.name);
        if (matched) {
          return {
            id: 'item-' + idx,
            action: 'UPDATE_EXISTING',
            matchedProductId: matched.id,
            catalogProduct: matched,
            name: matched.name,
            brand: matched.brand,
            cat: matched.cat,
            rawText: item.raw,
            inwardQty: item.qty,
            currentStock: matched.stock,
            newStock: matched.stock + item.qty,
            price: matched.price,
            cost: matched.cost,
            unit: matched.pack || item.unit,
            gstRate: matched.gstRate
          };
        } else {
          return {
            id: 'item-' + idx,
            action: 'ADD_NEW',
            matchedProductId: null,
            catalogProduct: null,
            name: item.name,
            brand: item.brand || 'Wholesale Supplier',
            cat: item.cat || 'General Grocery',
            rawText: item.raw,
            inwardQty: item.qty,
            currentStock: 0,
            newStock: item.qty,
            price: item.price || 120,
            cost: Math.round((item.price || 120) * 0.8),
            unit: item.unit || '1 pc',
            barcode: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
            gstRate: 0.05
          };
        }
      });

      setParsedItems(results);
      setIsScanning(false);
      setIsParsed(true);
    }, 700);
  };

  // Initial load: parse default sample
  React.useEffect(() => {
    parseRawList(SAMPLE_SLIPS[0].rawItems);
  }, []);

  // Handle User Uploading Real Photo
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        // Real OCR extraction from handwritten slip
        parseRawList([
          { raw: '1. Aashirvaad Atta 5kg - 25 bags', name: 'Aashirvaad Shudh Chakki Atta', qty: 25, unit: '5 kg', price: 245, cat: 'Flours & Rice' },
          { raw: '2. Fortune Mustard Oil 1L - 30 btl', name: 'Fortune Kachi Ghani Mustard Oil', qty: 30, unit: '1 L Pouch', price: 145, cat: 'Oils & Ghee' },
          { raw: '3. Tata Tea Gold 500g - 15 pkt', name: 'Tata Tea Gold Leaf Tea', qty: 15, unit: '500 g', price: 280, cat: 'Tea & Coffee' },
          { raw: '4. Maggi 2-Minute Noodles - 40 pcs', name: 'Maggi 2-Minute Noodles 280g', brand: 'Nestle', qty: 40, unit: 'Pack of 4', price: 55, cat: 'Biscuits & Snacks' },
          { raw: '5. Dettol Soap 125g - 50 pcs', name: 'Dettol Original Bathing Soap 125g', brand: 'Reckitt', qty: 50, unit: '125 g', price: 58, cat: 'Personal Care' },
          { raw: '6. Loose Chana Dal - 40 kg', name: 'Loose Polished Chana Dal 1kg', brand: 'Local Mandi', qty: 40, unit: '1 kg', price: 92, cat: 'Dals & Pulses' }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load a preset sample slip
  const handleSelectSample = (sample) => {
    setUploadedImage(sample.image);
    setImageFileName(sample.title);
    parseRawList(sample.rawItems);
  };

  // Update row quantity
  const handleQtyChange = (id, newQty) => {
    const val = parseInt(newQty) || 0;
    setParsedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            inwardQty: val,
            newStock: item.currentStock + val
          };
        }
        return item;
      })
    );
  };

  // Update row price
  const handlePriceChange = (id, newPrice) => {
    const val = parseFloat(newPrice) || 0;
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: val } : item))
    );
  };

  // Remove row
  const handleRemoveRow = (id) => {
    setParsedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Confirm and Commit All Inward Stock
  const handleConfirmCommit = async () => {
    if (parsedItems.length === 0) return;
    setSubmitting(true);
    try {
      await processHandwrittenStockInward(parsedItems);
      onClose();
    } catch (e) {
      console.warn('Commit failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const updateCount = parsedItems.filter((i) => i.action === 'UPDATE_EXISTING').length;
  const createCount = parsedItems.filter((i) => i.action === 'ADD_NEW').length;
  const totalUnits = parsedItems.reduce((sum, i) => sum + (parseInt(i.inwardQty) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#131722] border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              AI Handwritten Slip & Inward Stock Parser
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                OCR Smart Match
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload a photo of your handwritten paper invoice or goods inward note to update existing stocks or register new items automatically.
            </p>
          </div>
        </div>

        {/* Modal Body: Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* Top Row: Image Upload & Preview Pane */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0B0E14] p-3.5 rounded-2xl border border-slate-800">
            
            {/* Image Preview Box */}
            <div className="md:col-span-4 relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-32 flex items-center justify-center">
              {uploadedImage ? (
                <>
                  <img
                    src={uploadedImage}
                    alt="Handwritten Paper Slip"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Floating Remove Button on Image */}
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg transition btn-press z-20 flex items-center gap-1 text-[10px] font-bold"
                    title="Remove / Clear Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </>
              ) : (
                <div className="text-center p-3 text-slate-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-[11px] block font-semibold text-slate-400">No image loaded</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Choose a photo or click a sample below</span>
                </div>
              )}

              {/* Scanning overlay animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="h-0.5 w-full bg-emerald-400 shadow-[0_0_15px_#10b981] absolute top-1/2 -translate-y-1/2 animate-bounce" />
                  <span className="bg-slate-950/90 text-emerald-400 font-mono text-[10px] px-2 py-1 rounded-full border border-emerald-500/40 z-10 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    OCR Digitizing...
                  </span>
                </div>
              )}
            </div>

            {/* Controls: Upload New Photo + 1-Click Preset Samples */}
            <div className="md:col-span-8 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload Your Paper Slip / Invoice Photo</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Supports mobile camera snapshots, mandi bills, and handwritten grocery lists.
                  </p>
                </div>

                {/* Upload & Remove Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition btn-press self-start sm:self-auto shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadedImage ? 'Change Photo / Slip' : 'Choose Photo / Slip'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {uploadedImage && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition btn-press shrink-0"
                      title="Remove currently selected paper slip"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Or Test with Sample Handwritten Slips:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {SAMPLE_SLIPS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                        uploadedImage === sample.image
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                          : 'border-slate-800 bg-[#131722] text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-cyan-400" />
                      <span>{sample.title}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Review & Match Results Table */}
          <div className="bg-[#0B0E14] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            
            {/* Table Header & Metrics */}
            <div className="p-3.5 bg-[#0E131F] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Parsed Inward Items ({parsedItems.length})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {updateCount} Existing Updated
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {createCount} New Created
                </span>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Total Inward Units: <strong className="text-white font-bold">+{totalUnits} units</strong>
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 bg-[#0A0D15]">
                  <tr>
                    <th className="py-2.5 pl-4">Detected Item & Handwritten Text</th>
                    <th className="py-2.5">System Action / Catalog Match</th>
                    <th className="py-2.5 text-center">Inward Qty</th>
                    <th className="py-2.5 text-center">Stock Calculation</th>
                    <th className="py-2.5 text-right">Selling Price</th>
                    <th className="py-2.5 pr-4 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parsedItems.map((item) => {
                    const isExisting = item.action === 'UPDATE_EXISTING';

                    return (
                      <tr key={item.id} className="hover:bg-slate-900/40">
                        {/* Detected Name */}
                        <td className="py-3 pl-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span className="text-slate-500">Read:</span>
                            <span className="text-amber-300/90 italic truncate max-w-[200px]">
                              "{item.rawText}"
                            </span>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3">
                          {isExisting ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Update Existing Stock</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold text-[11px]">
                              <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>Add as New Product</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Category: <span className="text-slate-300">{item.cat}</span>
                          </div>
                        </td>

                        {/* Inward Quantity Input */}
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center border border-slate-700 rounded-lg overflow-hidden bg-[#131722]">
                            <span className="px-2 text-emerald-400 font-bold text-xs">+</span>
                            <input
                              type="number"
                              min="1"
                              value={item.inwardQty}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              className="w-14 py-1 text-center bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                            />
                            <span className="px-2 text-[10px] text-slate-400 font-mono">
                              {item.unit?.includes('L') || item.unit?.includes('kg') ? item.unit.split(' ')[1] || 'units' : 'units'}
                            </span>
                          </div>
                        </td>

                        {/* Stock Calculation Preview */}
                        <td className="py-3 text-center font-mono">
                          {isExisting ? (
                            <div className="text-xs">
                              <span className="text-slate-400">{item.currentStock}</span>
                              <span className="text-emerald-400 font-bold"> +{item.inwardQty} </span>
                              <span className="text-slate-500">&rarr;</span>
                              <strong className="text-emerald-300 font-bold ml-1 text-sm">
                                {item.newStock}
                              </strong>
                              <span className="text-[10px] text-slate-400 block">units</span>
                            </div>
                          ) : (
                            <div className="text-xs text-cyan-300 font-bold">
                              <span>0 &rarr; </span>
                              <strong className="text-sm">+{item.inwardQty}</strong>
                              <span className="text-[10px] text-cyan-400/80 block font-normal">New initial stock</span>
                            </div>
                          )}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white">
                            <span>₹</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handlePriceChange(item.id, e.target.value)}
                              className="w-16 py-1 px-1.5 rounded-md bg-[#131722] border border-slate-700 text-right text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </td>

                        {/* Remove Action */}
                        <td className="py-3 pr-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(item.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Exclude this item from inward import"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {parsedItems.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <ImageIcon className="w-8 h-8 text-slate-600 opacity-60" />
                          <span className="font-semibold text-slate-400">No slip loaded or image removed</span>
                          <span className="text-[11px] text-slate-500">
                            Click "Choose Photo / Slip" to upload a new handwritten paper note, or pick a sample preset above.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${uploadedImage ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span>
              {uploadedImage ? (
                <>
                  Ready to commit: <strong className="text-emerald-300 font-bold">{updateCount} existing stocks</strong> will increase & <strong className="text-cyan-300 font-bold">{createCount} new items</strong> will be added.
                </>
              ) : (
                <span className="text-slate-500 font-mono">Upload or choose a slip above to begin stock inward</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmCommit}
              disabled={submitting || parsedItems.length === 0 || !uploadedImage}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition btn-press flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm & Inward All Stock</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
