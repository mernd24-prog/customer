import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMarketplaceInvoices } from "../../../../features/tax/taxSlice";
import { downloadAuthDocument, getDocumentId } from "../../../../utils/downloadAuthDocument";
import { ORDER_API_ENDPOINTS } from "../../routes/apiRoutes";
import { endpoints } from "../../../../api/endpoints";
import { notify } from "../../../../utils/notify";
import {
  hasDeliveredSellerPackage,
  getOrderItemId,
  getCustomerPlatformFeeAmount
} from "../../../../utils/pages/orderUtils";

export function useOrderDocuments({ orderId, order, selectedOrderItem, visibleReturns, cancellations }) {
  const dispatch = useDispatch();
  const [invoices, setInvoices] = useState(null);
  const [, setInvoicesLoading] = useState(false);
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
      .catch(() => { })
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

  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);
  const customerInvoices = Array.isArray(invoices?.sellerInvoices)
    ? invoices.sellerInvoices
    : [];
  const orderReceipt = invoices?.orderInvoice || null;
  const relationInvoices = Array.isArray(order?.relations?.invoices)
    ? order.relations.invoices
    : [];
  const getInvoiceType = (invoice = {}) =>
    String(
      invoice.invoiceType || invoice.invoice_type || invoice.type || "",
    ).toLowerCase();
  const customerFeeInvoice =
    invoices?.customerFeeInvoice ||
    relationInvoices.find(
      (invoice) => getInvoiceType(invoice) === "platform_customer_fee",
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
      if (docSellerId) {
        const itemSellerId =
          selectedOrderItem.seller_id ||
          selectedOrderItem.sellerId ||
          selectedOrderItem.seller?.id ||
          selectedOrderItem.seller?._id;
        if (itemSellerId && String(docSellerId) !== String(itemSellerId)) {
          return false;
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
      };
    })
    .filter(Boolean);

  const cancellationReverseInvoices = cancellations
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
        title: "Seller tax invoice",
        subtitle: `${invoiceSellerName(invoice, index)} · ${invoiceItemSummary(invoice)}`,
        downloadPath: endpoints.tax.invoiceDownload(invoiceId),
        filename: `${invoice.invoice_number || invoice.invoiceNumber || `invoice-${index + 1}`}.pdf`,
      };
    }),
    !selectedOrderItem && orderReceipt && getDocumentId(orderReceipt)
      ? {
        id: getDocumentId(orderReceipt),
        title: "Order receipt",
        subtitle: "Marketplace payment summary",
        downloadPath: endpoints.tax.invoiceDownload(
          getDocumentId(orderReceipt),
        ),
        filename: `${orderReceipt.invoice_number || orderReceipt.invoiceNumber || `receipt-${orderId}`}.pdf`,
      }
      : null,
    customerFeeInvoice && getDocumentId(customerFeeInvoice)
      ? {
        id: getDocumentId(customerFeeInvoice),
        title: "Platform fee invoice",
        subtitle: "Marketplace tax invoice for platform fee",
        downloadPath: endpoints.tax.invoiceDownload(
          getDocumentId(customerFeeInvoice),
        ),
        filename: `${customerFeeInvoice.invoice_number || customerFeeInvoice.invoiceNumber || `platform-fee-${orderId}`}.pdf`,
      }
      : null,
    !customerFeeInvoice && customerPlatformFee > 0
      ? {
        id: `pending-platform-fee-${orderId}`,
        title: "Platform fee invoice",
        subtitle: "Will be available after payment document is generated.",
        pending: true,
      }
      : null,
    ...(selectedOrderItem ? [] : cancellationReverseInvoices),
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
    downloadableDocuments
  };
}
