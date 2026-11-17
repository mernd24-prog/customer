import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCartQuantityLimit, getReducedCartQuantity, rollbackCartQuantities } from "../src/utils/ecommerce/cartQuantity.js";

let response;
const context = {
  createAsyncThunk,
  createSlice,
  apiRequest: async () => {
    if (response instanceof Error) throw response;
    return response;
  },
};
vm.createContext(context);
const source = fs.readFileSync(new URL("../src/features/createApiSlice.js", import.meta.url), "utf8");
vm.runInContext(source.replace(/^import .*;$/gm, "").replace(/^export /gm, "") + "\nglobalThis.apiFactory = { createApiSlice, makeThunk };", context);
const { createApiSlice, makeThunk } = context.apiFactory;

for (const [name, actions] of [
  ["cart", ["updateCart"]],
  ["order", ["quoteOrder", "createOrder", "cancelOrder", "updateOrderStatus", "retryOrderPayment"]],
  ["returns", ["requestReturn", "disputeReturnQc"]],
  ["payment", ["initiatePayment", "verifyPayment"]],
]) {
  const load = makeThunk(`${name}/fetch`, { url: "/test" });
  const mutations = Object.fromEntries(actions.map(action => [action, makeThunk(`${name}/${action}`, { method: "post", url: "/test" })]));
  const slice = createApiSlice({ name, thunks: { load, ...mutations }, actionThunks: actions });
  const store = configureStore({ reducer: slice.reducer });
  const saved = { _id: "saved", items: [{ productId: "earrings", quantity: 2 }] };
  response = { data: saved };
  await store.dispatch(load()).unwrap();
  for (const mutation of Object.values(mutations)) {
    for (const message of ["Deal quantity limit is 2", "Only 1 item available", "Product unavailable", "Coupon expired", "Request cannot be completed", "Network timeout"]) {
      response = new Error(message);
      await assert.rejects(store.dispatch(mutation()).unwrap(), error => error === message);
      const state = store.getState();
      assert.equal(state.error, null, `${name}: action errors must not activate the full-page error state`);
      assert.equal(state.actionError, message);
      assert.equal(state.loading, false);
      assert.equal(state.actionLoading, false);
      assert.equal(state.current.items[0].quantity, 2, "failed request preserves saved quantities");
      store.dispatch(slice.actions.clearError());
      assert.equal(store.getState().actionError, null);
    }
  }
  response = new Error("Unable to load data");
  await assert.rejects(store.dispatch(load()).unwrap(), error => error === "Unable to load data");
  assert.equal(store.getState().error, "Unable to load data", "actual load failures remain visible");
  response = { data: saved };
  await store.dispatch(load()).unwrap();
  assert.equal(store.getState().error, null);
  assert.equal(store.getState().actionError, null);
}

assert.equal(getCartQuantityLimit({ deal: { maxQuantityPerOrder: 2 } }, 50), 2);
assert.equal(getCartQuantityLimit({ deal: { maxQuantityPerOrder: 2 } }, 1), 1);
assert.equal(getCartQuantityLimit({ deal: { maxQuantityPerOrder: 2 } }, 0), 0);
assert.equal(getCartQuantityLimit({ deal: { maxQuantityPerOrder: 2 } }), 2);
assert.equal(getCartQuantityLimit({ deal: { maxQuantityPerOrder: 0 } }, 20), 10);
assert.equal(getCartQuantityLimit({ deal: { maxQuantityPerOrder: "invalid" } }, 20), 10);
assert.equal(getCartQuantityLimit({ deal: { maxQuantityPerOrder: 20 } }, 30), 10);
assert.equal(getReducedCartQuantity(5, 2), 2, "saved quantity above a new deal cap can be corrected in one action");
assert.equal(getReducedCartQuantity(2, 2), 1);
assert.equal(getReducedCartQuantity(1, 0), 1, "out-of-stock lines retain their minimum quantity for removal");
assert.deepEqual(rollbackCartQuantities({ earrings: 3, bag: 2 }, { earrings: 3 }), { bag: 2 });
assert.deepEqual(rollbackCartQuantities({ earrings: 4, bag: 2 }, { earrings: 3 }), { earrings: 4, bag: 2 });
console.log("PASS: cart/order/return/payment action failures preserve content; load failures remain visible; deal/stock caps and optimistic rollback recover safely.");
