import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  Info,
  ShoppingCart,
  Trash2,
  Heart,
  TicketPercent,
  Truck,
} from "lucide-react";


import DynamicButton from "./button/button.jsx";
const TYPE_CONFIG = {
  success: {
    title: "Success",
    Icon: Check,
  },
  error: {
    title: "Something Went Wrong",
    Icon: AlertCircle,
  },
  warning: {
    title: "Attention needed",
    Icon: AlertTriangle,
  },
  info: {
    title: "Notice",
    Icon: Info,
  },
};

const TONE_ICON_MAP = {
  cart: ShoppingCart,
  wishlist: Heart,
  offer: TicketPercent,
  shipping: Truck,
  remove: Trash2,
  notification: Bell,
};

export default function CustomerToast({
  type = "info",
  title,
  message,
  actionLabel,
  onAction,
  tone,
}) {
  const baseConfig = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const ToneIcon = type === "success" ? null : TONE_ICON_MAP[tone];
  const Icon = ToneIcon || baseConfig.Icon;

  return (
    <div className={`customer-toast-card customer-toast-card--${type}`}>
      <div className="customer-toast-card__icon-wrap">
        <span className="customer-toast-card__icon">
          <Icon size={16} strokeWidth={2.4} />
        </span>
      </div>
      <div className="customer-toast-card__content">
        <p className="customer-toast-card__title">
          {title || baseConfig.title}
        </p>
        <p className="customer-toast-card__message">{message}</p>
        {actionLabel ? (
          <DynamicButton
            variant="link"
            className="customer-toast-card__action"
            onClick={onAction}
          >
            {actionLabel}
          </DynamicButton>
        ) : null}
      </div>
    </div>
  );
}
