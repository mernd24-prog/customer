export const buttonVariants = {
  unstyled: "",
  primary:
    "border border-[var(--customer-navy)] bg-[var(--customer-navy)] text-white shadow-sm hover:bg-[var(--customer-navy-dark)] hover:border-[var(--customer-navy-dark)]",
  secondary:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] text-[var(--customer-navy)] shadow-[0_4px_12px_rgba(212,161,47,0.2)] hover:bg-[var(--customer-gold-dark)] hover:border-[var(--customer-gold-dark)]",
  softGold:
    "border border-[#CE9F2D] bg-[#FFF9EA] text-[#1B1D60] hover:bg-[#F8EDCF] hover:border-[#B5861F]",
  primaryOutline:
    "border border-[var(--customer-navy)] bg-white text-[var(--customer-navy)] hover:bg-[var(--customer-navy)] hover:text-white",
  secondaryOutline:
    "border border-[var(--customer-gold)] bg-white text-[var(--customer-navy)] hover:bg-[var(--customer-gold-soft)] hover:border-[var(--customer-gold-dark)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--customer-navy)] hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-gold-dark)]",
  whiteOutline:
    "border border-white/25 bg-white/10 text-white hover:bg-white/20 active:scale-[0.98]",
  iconNeutral:
    "border border-black/5 bg-white/90 text-[var(--customer-navy)] shadow-xs hover:bg-white hover:text-red-500",
  iconGhost:
    "border border-transparent bg-transparent text-gray hover:text-red-500 focus-visible:ring-gold/30",
  iconGold:
    "border border-transparent bg-gradient-to-r from-[#CE9F2D] to-[#B88200] text-white shadow-sm hover:brightness-105 active:scale-[0.98]",
  iconMuted:
    "border border-transparent bg-[#DCDAD2] text-white cursor-not-allowed",
  link:
    "border border-transparent bg-transparent p-0 text-[var(--customer-gold-dark)] hover:text-[var(--customer-gold-dark)] hover:underline",
  danger: "border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700",
};

export default buttonVariants;
