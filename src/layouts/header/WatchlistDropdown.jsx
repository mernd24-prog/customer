import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

import DropdownHeader from "./DropdownHeader";
import { WatchlistItemCard } from "../../components/ecommerce";
import { Button } from "../../components/common";

export default function WatchlistDropdown({ title, items, onRemove }) {
  const navigate = useNavigate();

  return (
    <div className="w-[320px] overflow-hidden rounded-[var(--customer-radius)] border border-[var(--customer-border)] bg-white shadow-[var(--customer-shadow-strong)]">
      <DropdownHeader title={title} actionText="View all" actionPath="/watchlist" />

      <div className="max-h-[420px] overflow-y-auto">
        {items.length > 0 ? (
          items.map((product) => (
            <WatchlistItemCard
              key={product.id || product._id || product.productId}
              product={product}
              compact
              onRemove={onRemove}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-10">
            <Heart size={28} className="mb-3 text-[var(--customer-border-strong)]" aria-hidden="true" />
            <p className="text-center text-[13px] text-[var(--customer-muted)]">
              You are not watching any items yet.
            </p>
            <Button
              variant="gradient"
              rounded
              size="sm"
              label="Start shopping"
              className="mt-4 px-6"
              onClick={() => navigate("/")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
