import { useParams } from "react-router-dom";
import Seo from "../../components/ui/Seo";
import OrderDetail from "./components/OrderDetail";
import OrderList from "./components/OrderList";

export default function OrdersPage({ detail = false, track = false }) {
  const { orderId } = useParams();
  
  if (detail || track) {
    return (
      <>
        <Seo 
          title={`Order ${orderId ? `Details - ${orderId}` : 'Details'} - Sam Global`} 
          metaDescription="View your order details and track its status." 
        />
        <OrderDetail orderId={orderId} track={track} />
      </>
    );
  }
  
  return (
    <>
      <Seo 
        title="My Orders - Sam Global" 
        metaDescription="View and manage all your past and current orders." 
      />
      <OrderList />
    </>
  );
}
