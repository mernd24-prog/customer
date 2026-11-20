
import { Link } from "react-router-dom";
import { Grid2X2 } from "lucide-react";
import Seo from "../components/ui/Seo";
import { EmptyState } from "../components/ui";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page Not Found ||| Sam Global"
        description="The page you're looking for doesn't exist."
        robots="noindex,follow"
      />

      <EmptyState
        illustration="box"
        title="404 - Page Not Found"
        description="We couldn't find the page you're looking for. It may have been moved or the link might be incorrect."
        actionLabel="Go to Home"
        onAction={() => (window.location.href = "/")}
      >
        
      </EmptyState>
    </>
  );
}
