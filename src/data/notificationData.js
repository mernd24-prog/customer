const notificationData = {
  "order.created.v1": {
    icon: "/image/png/Order Confirmed.png",
    action: "View Order",
    actionPath: "/orders",
  },

  "order.status_updated.v1": {
    icon: "/image/png/Payment Successful.png",
    action: "View Details",
    actionPath: "/orders",
  },

  "invoice.generated.v1": {
    icon: "/image/png/Invoice Generated.png",
    action: "Download Invoice",
    actionPath: "/orders",
  },

  "order.paid.v1": {
    icon: "/image/png/Payment Successful.png",
    action: "View Details",
    actionPath: "/orders",
  },

  default: {
    icon: "/image/png/Store Announcement.png",
    action: "View Details",
    actionPath: "/orders",
  },
};

export default notificationData;