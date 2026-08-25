import { useParams } from "react-router-dom";
import Seo from "../../../components/ui/Seo";
import OrderDetailPage from "./OrderDetailPage";
import OrderListPage from "./OrderListPage";

export default function OrdersPage({ detail = false, track = false }) {
  const { orderId } = useParams();
  
  if (detail || track) {
    return (
      <>
        <Seo 
          title={`Order ${orderId ? `Details - ${orderId}` : 'Details'} - Sam Global`} 
          metaDescription="View your order details and track its status." 
        />
        <OrderDetailPage orderId={orderId} track={track} />
      </>
    );
  }
  
  return (
    <>
      <Seo 
        title="My Orders - Sam Global" 
        metaDescription="View and manage all your past and current orders." 
      />
      <OrderListPage />
    </>
  );
}
