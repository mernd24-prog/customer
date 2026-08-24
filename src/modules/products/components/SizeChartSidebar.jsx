import { X } from "lucide-react";
import { useEffect } from "react";

export default function SizeChartSidebar({ isOpen, onClose, productName }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] max-w-full bg-[#F5F8FB] z-[9999] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-white border-b border-border">
          <h2 className="text-lg sm:text-xl font-bold text-ink text-center w-full px-8">{productName || "Size Chart"}</h2>
          <button 
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gold-soft transition-colors"
          >
            <X size={20} className="text-gold-dark" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 sm:space-y-8">
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base text-center">
                <thead className="bg-gold-soft">
                  <tr>
                    <th className="py-3 px-3 sm:px-4 font-bold text-gold-dark border-b border-gold/20">Size</th>
                    <th className="py-3 px-3 sm:px-4 font-bold text-gold-dark border-b border-l border-gold/20">Chest/Bust</th>
                    <th className="py-3 px-3 sm:px-4 font-bold text-gold-dark border-b border-l border-gold/20">Brand Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { size: '3XL', chest: '46', brand: '3XL' },
                    { size: '4XL', chest: '48', brand: '4XL' },
                    { size: '5XL', chest: '50', brand: '5XL' },
                    { size: '6XL', chest: '52', brand: '6XL' },
                    { size: '7XL', chest: '54', brand: '7XL' },
                    { size: '8XL', chest: '56', brand: '8XL' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gold-soft/40 transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-bold text-gold-dark">{row.size}</td>
                      <td className="py-3 px-3 sm:px-4 text-[#4E4E4E] border-l border-border">{row.chest}</td>
                      <td className="py-3 px-3 sm:px-4 text-[#4E4E4E] border-l border-border">{row.brand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-5 bg-white p-4 sm:p-5 rounded-xl border border-border shadow-sm">
            <h3 className="font-bold text-ink text-base sm:text-lg">Measurement Guidelines</h3>
            
            <div className="text-[13px] sm:text-sm text-[#4E4E4E] leading-relaxed">
              <span className="font-bold text-ink">Women Kurta</span> Not sure about your kurta size? Follow these simple steps to figure it out: 
              <span className="font-bold text-ink"> Waist</span> - Measure at the slimmest part of natural waist above the naval. 
              <span className="font-bold text-ink"> Sleeve</span> - Measure from the shoulder seam to the cuff / hem along the outer arm. 
              <span className="font-bold text-ink"> Outseam</span> - Measure from the waistband to the bottom hem. 
              <span className="font-bold text-ink"> Shoulder</span> - Measure one shoulder tip to the other at the back. 
              <span className="font-bold text-ink"> Bust</span> - Measure around fullest part of the bust.
            </div>

            <div className="flex justify-center py-6 bg-gold-soft/30 rounded-lg border border-gold/20">
                <div className="relative w-[140px] h-[180px] flex flex-col items-center justify-center opacity-80">
                   {/* Shoulders */}
                   <div className="w-24 h-10 bg-gold-soft rounded-t-3xl border-b border-dashed border-gold/40 relative">
                      <span className="absolute -left-12 top-2 text-[11px] text-gold-dark font-medium">Bust</span>
                      <div className="absolute top-6 left-0 w-full h-[1px] border-b border-dashed border-gold/40"></div>
                   </div>
                   {/* Waist */}
                   <div className="w-20 h-14 bg-gold-soft relative">
                      <span className="absolute -left-14 top-4 text-[11px] text-gold-dark font-medium">Waist</span>
                      <div className="absolute top-8 left-0 w-full h-[1px] border-b border-dashed border-gold/40"></div>
                   </div>
                   {/* Hips */}
                   <div className="w-[104px] h-24 bg-gold-soft rounded-b-xl relative">
                      <span className="absolute -left-12 top-6 text-[11px] text-gold-dark font-medium">Hips</span>
                      <div className="absolute top-10 left-0 w-full h-[1px] border-b border-dashed border-gold/40"></div>
                   </div>
                </div>
            </div>

            <div className="text-[13px] sm:text-sm text-[#4E4E4E] leading-relaxed pb-2">
              <span className="font-bold text-ink">Men Kurta</span> Not sure about your kurta size? Follow these simple steps to figure it out: 
              <span className="font-bold text-ink"> Shoulder</span> - Measure the shoulder at the back, from edge to edge with arms relaxed on both sides. 
              <span className="font-bold text-ink"> Chest</span> - Measure around the body under the arms at the fullest part of the chest with a tape measure.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
