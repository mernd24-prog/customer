import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useFetch(thunk, arg, selector) {
  const dispatch = useDispatch();
  const state = useSelector(selector);
  useEffect(() => {
    dispatch(thunk(arg));
  }, [dispatch, thunk, JSON.stringify(arg)]);
  return state;
}
