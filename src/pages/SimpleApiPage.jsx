import Seo from "../components/common/Seo";
import ApiState from "../components/common/ApiState";
import { useFetch, itemsFrom } from "./customer/helpers";

export function SimpleApiPage({ title, selector, thunk, action }) {
  const state = useFetch(thunk, action?.arg, selector);
  const list = itemsFrom(state);

  return (
    <>
      <Seo title={`${title} | Sam Global`} />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">{title}</h1>
        <ApiState
          loading={state.loading}
          error={state.error}
          empty={!list.length && !state.current}
        >
          <div className="rounded-[12px] border border-border bg-white p-6">
            <pre className="overflow-x-auto font-mono text-xs text-muted">
              {JSON.stringify(list.length ? list : state.current, null, 2)}
            </pre>
          </div>
        </ApiState>
      </div>
    </>
  );
}
