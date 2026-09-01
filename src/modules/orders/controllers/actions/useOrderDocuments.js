import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMarketplaceInvoices } from "../../../../features/tax/taxSlice";
import {
  downloadAuthDocument,
  getDocumentId,
} from "../../../../utils/downloadAuthDocument";
import { ORDER_API_ENDPOINTS } from "../../routes/apiRoutes";
import { endpoints } from "../../../../api/endpoints";
import { notify } from "../../../../utils/notify";
import {
  hasDeliveredSellerPackage,
  getOrderItemId,
  getCustomerPlatformFeeAmount,
  isDeliveredOrderItem,
} from "../../../../utils/pages/orderUtils";

export function useOrderDocuments({
  orderId,
  order,
  selectedOrderItem,
  visibleReturns,
  visibleCancellations,
}) {
  const dispatch = useDispatch();
  const [invoices, setInvoices] = useState(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setInvoices(null);
      return;
    }
    setInvoicesLoading(true);
    dispatch(fetchMarketplaceInvoices({ orderId }))
      .unwrap()
      .then((result) => setInvoices(result?.data || result))
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  }, [dispatch, orderId]);

  const handleDownload = async (apiPath, filename) => {
    setDownloadingId(apiPath);
    try {
      await downloadAuthDocument(apiPath, filename);
    } catch (error) {
      notify.error(
        error?.message || "Document download failed. Please try again.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const getInvoiceUrl = (order) =>
    order?.invoice_url ||
    order?.invoiceUrl ||
    order?.relations?.invoice?.url ||
    null;

  const relationInvoices = Array.isArray(order?.relations?.invoices)
    ? order.relations.invoices
    : [];

  const getInvoiceType = (invoice = {}) =>
    String(
      invoice.invoiceType || invoice.invoice_type || invoice.type || "",
    ).toLowerCase();

  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);
  const customerInvoices = Array.isArray(invoices?.sellerInvoices)
    ? invoices.sellerInvoices
    : [];

  // Fallback to relationInvoices if API response doesn't have orderInvoice or customerFeeInvoice
  const orderReceipt =
    invoices?.orderInvoice ||
    relationInvoices.find(
      (invoice) =>
        getInvoiceType(invoice) === "order_receipt" ||
        getInvoiceType(invoice) === "marketplace_receipt",
    ) ||
    null;

  const customerFeeInvoice =
    invoices?.customerFeeInvoice ||
    relationInvoices.find(
      (invoice) =>
        getInvoiceType(invoice) === "platform_customer_fee" ||
        getInvoiceType(invoice) === "platform_fee",
    ) ||
    null;

  const pendingSellerDocuments = invoices?.pendingSellerDocuments || [];

  const invoiceSellerName = (invoice, index) => {
    const metadata = invoice?.metadata || {};
    const seller = metadata.seller || {};
    const organization =
      metadata.organization || invoice?.organizationSnapshot || {};
    return (
      organization.legalBusinessName ||
      organization.displayName ||
      seller.legalBusinessName ||
      seller.businessName ||
      seller.displayName ||
      `Seller ${index + 1}`
    );
  };
  const invoiceItemSummary = (invoice) => {
    const coveredItems =
      invoice?.metadata?.items || invoice?.metadata?.lineItems || [];
    const titles = coveredItems
      .map((item) => item.productTitle || item.description)
      .filter(Boolean);
    if (!titles.length) return "Delivered seller items";
    if (titles.length === 1) return titles[0];
    return `${titles[0]} + ${titles.length - 1} more`;
  };

  const documentCoversSelectedItem = (document = {}) => {
    if (!selectedOrderItem) return true;
    const selectedItemId = getOrderItemId(selectedOrderItem);
    if (!selectedItemId) return true;
    const metadata = document.metadata || {};
    const coveredItems = [
      ...(Array.isArray(metadata.items) ? metadata.items : []),
      ...(Array.isArray(metadata.lineItems) ? metadata.lineItems : []),
    ];
    const explicitIds = [
      ...(Array.isArray(metadata.orderItemIds) ? metadata.orderItemIds : []),
      ...(Array.isArray(metadata.order_item_ids)
        ? metadata.order_item_ids
        : []),
    ].map(String);
    if (explicitIds.includes(selectedItemId)) return true;
    if (!coveredItems.length) {
      const docSellerId =
        document.sellerId ||
        document.seller_id ||
        metadata.sellerId ||
        metadata.seller_id ||
        metadata.seller?.id ||
        metadata.seller?._id;

      const itemSellerId =
        selectedOrderItem.seller_id ||
        selectedOrderItem.sellerId ||
        selectedOrderItem.seller?.id ||
        selectedOrderItem.seller?._id;

      if (docSellerId && itemSellerId) {
        if (String(docSellerId) !== String(itemSellerId)) {
          return false;
        }
      } else {
        // Fallback to name matching if IDs are missing
        const docSellerName =
          document.sellerName ||
          metadata.seller?.businessName ||
          metadata.seller?.displayName;

        if (docSellerName) {
          const fulfillmentGroups =
            order?.relations?.sellerFulfillmentGroups || [];
          const itemFulfillment = fulfillmentGroups.find(
            (g) => String(g.sellerId || g.seller_id) === String(itemSellerId),
          );
          const itemSellerName =
            itemFulfillment?.sellerName ||
            selectedOrderItem.sellerName ||
            selectedOrderItem.seller?.displayName ||
            selectedOrderItem.seller?.businessName;

          if (itemSellerName && docSellerName !== itemSellerName) {
            return false;
          }
        }
      }
      return true;
    }
    return coveredItems.some(
      (item) =>
        String(
          item.orderItemId || item.order_item_id || item.id || item._id || "",
        ) === selectedItemId,
    );
  };

  const visibleCustomerInvoices = selectedOrderItem
    ? customerInvoices.filter(documentCoversSelectedItem)
    : customerInvoices;
  const visiblePendingSellerDocuments = selectedOrderItem
    ? pendingSellerDocuments.filter(documentCoversSelectedItem)
    : pendingSellerDocuments;

  const returnReverseInvoices = visibleReturns
    .map((returnRequest) => {
      const creditNoteId =
        returnRequest.creditNoteId ||
        returnRequest.credit_note_id ||
        returnRequest.refund?.creditNoteId ||
        returnRequest.refund?.credit_note_id ||
        returnRequest.refund?.metadata?.creditNoteId ||
        returnRequest.refund?.metadata?.credit_note_id;
      if (!creditNoteId) return null;
      const returnNumber =
        returnRequest.returnNumber ||
        returnRequest.return_number ||
        returnRequest.id ||
        returnRequest._id;
      const downloadPath = endpoints.tax.creditNoteDownload(creditNoteId);
      return {
        id: creditNoteId,
        title: "Return reverse invoice",
        subtitle: `For return ${returnNumber}`,
        downloadPath,
        filename: `reverse-invoice-${returnNumber}.pdf`,
        type: "return_reverse",
        returnRequest,
      };
    })
    .filter(Boolean);

  const cancellationReverseInvoices = visibleCancellations
    .map((cancellation) => {
      const creditNoteId =
        cancellation.credit_note_id || cancellation.creditNoteId;
      if (!creditNoteId) return null;
      const cancellationNumber =
        cancellation.cancellation_number ||
        cancellation.cancellationNumber ||
        cancellation.id;
      const downloadPath = endpoints.tax.creditNoteDownload(creditNoteId);
      return {
        id: creditNoteId,
        title: "Cancellation reverse invoice",
        subtitle: `For cancellation ${cancellationNumber}`,
        downloadPath,
        filename: `reverse-invoice-${cancellationNumber}.pdf`,
        type: "cancellation_reverse",
        cancellation,
      };
    })
    .filter(Boolean);

  const customerPlatformFee = getCustomerPlatformFeeAmount(order);

  const downloadableDocuments = [
    ...visibleCustomerInvoices.map((invoice, index) => {
      const invoiceId = getDocumentId(invoice);
      if (!invoiceId) return null;
      return {
        id: invoiceId,
        title: "Tax invoice",
        subtitle: invoiceItemSummary(invoice),
        downloadPath: endpoints.tax.invoiceDownload(invoiceId),
        filename: `${invoice.invoice_number || invoice.invoiceNumber || `invoice-${index + 1}`}.pdf`,
        invoice,
        type: "tax_invoice",
      };
    }),
    ...visiblePendingSellerDocuments.map((doc, index) => ({
      id: `pending-${index}`,
      title: "Tax invoice",
      subtitle: "Generating invoice...",
      pending: true,
      type: "tax_invoice",
      invoice: doc,
    })),
    orderReceipt || orderId
      ? {
          id: getDocumentId(orderReceipt) || `receipt-${orderId}`,
          title: "Order receipt",
          subtitle: "Marketplace payment summary",
          downloadPath:
            orderReceipt && getDocumentId(orderReceipt)
              ? endpoints.tax.invoiceDownload(getDocumentId(orderReceipt))
              : endpoints.tax.invoice(orderId),
          filename: `${orderReceipt?.invoice_number || orderReceipt?.invoiceNumber || `receipt-${orderId}`}.pdf`,
          type: "order_receipt",
        }
      : null,
    ...cancellationReverseInvoices,
    ...returnReverseInvoices,
  ].filter(Boolean);

  return {
    invoices,
    downloadingId,
    setDownloadingId,
    handleDownload,
    getInvoiceUrl,
    invoiceDownloadAvailable,
    customerInvoices,
    orderReceipt,
    customerFeeInvoice,
    pendingSellerDocuments,
    visibleCustomerInvoices,
    visiblePendingSellerDocuments,
    downloadableDocuments,
    invoicesLoading,
  };
}
