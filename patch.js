const fs = require('fs');

const path = '/home/user/Desktop/curtomer/customer/src/modules/orders/pages/OrderListPage.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('useOrderPayment')) {
    content = content.replace(
        'import { ReviewModal } from "../components/OrderItemReview";',
        `import { ReviewModal } from "../components/OrderItemReview";\nimport { useOrderPayment } from "../controllers/actions/useOrderPayment";\nimport { useSelector } from "react-redux";\nimport { RefreshCw } from "lucide-react";\nimport Button from "../../../components/ui/buttons/Button";`
    );
}

content = content.replace(
    /const itemDetailPath = getOpaqueOrderPath\(id, \{[\s\S]*?\}\);/,
    `const itemDetailPath = getOpaqueOrderPath(id, {\n    query: itemId ? \`?orderItemId=\${encodeURIComponent(itemId)}\` : "",\n  });\n\n  const orderStatus = getOrderStatus(order);\n  const isPaymentPending = orderStatus === "pending_payment" || orderStatus === "payment_failed";\n\n  const userState = useSelector((s) => s.user?.current);\n  const { retrying, handleRetryPayment } = useOrderPayment({\n    orderId: id,\n    order,\n    userState,\n  });\n\n  const handleCardClick = (e) => {\n    if (isPaymentPending) {\n      e.preventDefault();\n      handleRetryPayment();\n    }\n  };`
);

content = content.replace(
    /<Link\s+to=\{itemDetailPath\}\s+className="/,
    `<Link\n        to={itemDetailPath}\n        onClick={handleCardClick}\n        className="`
);

content = content.replace(
    /\{isDeliveredOrderItem\(item\) && !item\.has_reviewed && !item\.is_reviewed && \([\s\S]*?\}\)\}/,
    `{isPaymentPending ? (
            <Button
              className="mt-3 flex w-full md:w-auto items-center justify-center gap-[6px] rounded-lg px-4 py-2 text-white h-9"
              loading={retrying}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRetryPayment();
              }}
            >
              <RefreshCw size={14} />
              <span className="text-[13px] font-semibold">Retry payment</span>
            </Button>
          ) : (
            isDeliveredOrderItem(item) && !item.has_reviewed && !item.is_reviewed && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onReviewClick) onReviewClick(item, order);
                }}
                className="mt-2 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#2564EB] transition hover:text-[#1d4ed8]"
              >
                <IoIosStar size={16} className="fill-[#2564EB]" /> Rate & Review Product
              </button>
            )
          )}`
);

fs.writeFileSync(path, content);
