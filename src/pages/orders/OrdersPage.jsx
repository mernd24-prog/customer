import { useParams } from "react-router-dom";
import OrderDetail from "./components/OrderDetail";
import OrderList from "./components/OrderList";

export default function OrdersPage({ detail = false, track = false }) {
  const { orderId } = useParams();
  
  if (detail || track) {
    return <OrderDetail orderId={orderId} track={track} />;
  }
  
  return <OrderList />;
}
