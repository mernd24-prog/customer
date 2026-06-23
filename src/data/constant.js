import { BadgeCheck, RotateCcw, ShieldCheck } from "lucide-react";
import {
  Handshake,
  Mail,
  MapPin,
  Phone,
  ScrollText,
  Store,
  WalletCards,
} from "lucide-react";

export const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "newest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export const PAGE_SIZES = [12, 24, 48];

export const CANCEL_REASON_OPTIONS = [ 
    { value: "changed_mind", label: "Changed my mind" },
    { value: "ordered_by_mistake", label: "Ordered by mistake" },
    { value: "address_issue", label: "Address issue" },
    { value: "payment_issue", label: "Payment issue" },
    { value: "delivery_delay", label: "Delivery delay" },
    { value: "other", label: "Other" },
  ];

  export const BENEFITS = [
    {
      label: "Genuine Products",
      icon: BadgeCheck,
    },
    {
      label: "Secure Shopping",
      icon: ShieldCheck,
    },
    {
      label: "Hassle-free Returns",
      icon: RotateCcw,
    },
  ];

  export const SUPPORT_ICON_MAP = {
  general: ScrollText,
  brand: Handshake,
  partnership: Handshake,
  store: Store,
  retail: Store,
  customer: WalletCards,
  order: ScrollText,
  payment: WalletCards,
  return: Store,
  seller: Handshake,
};

export const CONTACT_ICON_MAP = {
  email: Mail,
  call: Phone,
  phone: Phone,
  address: MapPin,
  location: MapPin,
};


