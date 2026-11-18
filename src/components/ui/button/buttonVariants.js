export const buttonVariants = {
  unstyled: "",
  primary:
    "border border-[var(--customer-navy)] bg-[var(--customer-navy)] text-white shadow-sm hover:bg-[var(--customer-navy-dark)] hover:border-[var(--customer-navy-dark)]",

  secondary:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] text-[var(--customer-navy)] shadow-[0_4px_12px_rgba(212,161,47,0.2)] hover:bg-[var(--customer-gold-dark)] hover:border-[var(--customer-gold-dark)]",

  navy: "border border-[var(--customer-navy)] bg-[var(--customer-navy)] text-white shadow-sm hover:bg-[var(--customer-navy-dark)] hover:border-[var(--customer-navy-dark)]",

  gradient:
    "border border-transparent bg-gradient-to-r from-[var(--customer-gold-dark)] to-[var(--customer-gold)] text-[var(--customer-navy)] shadow-sm hover:shadow-md",

  primaryOutline:
    "border border-[var(--customer-navy)] bg-white text-[var(--customer-navy)] hover:bg-[var(--customer-navy)] hover:text-white",

  secondaryOutline:
    "border border-[var(--customer-gold)] bg-white text-[var(--customer-navy)] hover:bg-[var(--customer-gold-soft)] hover:border-[var(--customer-gold-dark)]",

  outline:
    "border border-[var(--customer-gold)] bg-white text-[var(--customer-navy)] hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-soft)]",

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

  google:
    "border border-border bg-white text-ink hover:border-border-strong hover:bg-gray-50 active:scale-[0.99]",

  headerGold:
    "border border-[#CE9F2D] bg-[#CE9F2D] text-[#03014D] hover:brightness-95 hover:shadow-md",

  headerIcon:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] text-white shadow-sm hover:bg-[var(--customer-gold-dark)] hover:border-[var(--customer-gold-dark)] active:bg-[#A97810]",

  headerIconOutlined:
    "border border-[#1B1D60]/20 bg-[#1B1D60]/5 text-[#1B1D60] hover:bg-[#CE9F2D]/15 hover:text-[#CE9F2D]",

  solidSmall:
    "border border-[var(--customer-navy)] bg-[var(--customer-navy)] text-white hover:border-[var(--customer-navy-dark)] hover:bg-[var(--customer-navy-dark)] shadow-sm",

  outlineSmall:
    "border border-[#18156D]/20 bg-white/70 text-[#3E4093] hover:bg-[#3E4093] hover:!text-white hover:border-[#3E4093] hover:shadow-md cursor-pointer",

  outlineSecondary:
    "border border-[var(--customer-gold)] bg-white text-[var(--customer-navy)] backdrop-blur hover:bg-[var(--customer-gold-soft)] hover:border-[var(--customer-gold-dark)] hover:shadow-sm",

  outlineLight:
    "border border-white/60 bg-transparent text-white hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold)]/10 hover:text-[var(--customer-gold)] active:border-[var(--customer-gold)] active:text-[var(--customer-gold)]",

  pill:
    "border border-transparent bg-[linear-gradient(#CE9F2D,#CE9F2D)] !text-white hover:!text-white hover:bg-[linear-gradient(#bd9025,#bd9025)] shadow-xs",

  ghostPill:
    "border border-[#CE9F2D4D] bg-[#CE9F2D4D] text-[#D6A323] hover:bg-black/60",

  continueShopping:
    "border border-[#18156D]/20 bg-white/70 text-[#3E4093] shadow-xs hover:bg-[#3E4093] hover:!text-white hover:border-[#3E4093] hover:shadow-md active:bg-[#2A2B66] active:!text-white cursor-pointer",

  textGold:
    "border-none bg-transparent p-0 text-left text-xs leading-[15px] text-[#CE9F2D] hover:text-[#B8860B]",

  textWhite:
    "border-none bg-transparent p-0 text-white hover:text-white/80",

  iconCircle:
    "border border-[#1B1D60] bg-[#1B1D600D] text-[#1B1D60] hover:border-[#1B1D60] hover:text-[#CE9F2D] focus:border-[#1B1D60] focus-visible:border-[#1B1D60] active:border-[#1B1D60]",

  bannerAction:
    "border border-white/70 bg-transparent text-white hover:bg-[#d9b15a] hover:border-[#d9b15a]",

  gold:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] text-white shadow-sm hover:bg-[var(--customer-gold-dark)] hover:border-[var(--customer-gold-dark)] active:bg-[#A97810]",

  goldOutline:
    "border border-[var(--customer-gold)] bg-white text-[var(--customer-gold)] shadow-sm hover:bg-[#FFF8E8] hover:text-[var(--customer-gold-dark)] active:bg-[#FFF1CC]",

  custom: "",

  contactChip:
    "border border-[#E0E4EE] bg-white text-[#171B3F] hover:border-[#D4A12F] hover:bg-[#FFFAEF] focus-visible:ring-[#D4A12F]/30",

  contactChipActive:
    "border border-[#D4A12F] bg-[#FFF7E7] text-[#171B65] shadow-[0_3px_10px_rgba(212,161,47,0.12)]",

  qtySoft:
    "border border-transparent bg-[#F1F0EB] text-[#1B1D60] hover:bg-[#F0E4C6] hover:text-[#03014D]",

  softGold:
    "border border-[#E7D9B8] bg-[#FFF8E7] text-[#1B1D60] hover:border-[#CE9F2D] hover:bg-[#F8E7BA] shadow-sm",

  qtyWhite:
    "border border-border/50 bg-white text-[#1B1D60] hover:border-[var(--customer-gold)] hover:bg-gold-soft hover:text-[#03014D] shadow-2xs",

  deliveryTrigger:
    "border border-[#1B1D60]/20 bg-[#F4F4F8] text-[#1B1D60] hover:border-[#1B1D60]/45 hover:bg-[#ECECF2]",
};

export default buttonVariants;
