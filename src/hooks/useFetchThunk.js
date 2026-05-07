import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useFetchThunk(thunk, arg, selector) {
  const dispatch = useDispatch();
  const state = useSelector(selector);
  const argRef = useRef(arg);
  const argKey = JSON.stringify(arg);

  argRef.current = arg;

  useEffect(() => {
    dispatch(thunk(argRef.current));
  }, [dispatch, thunk, argKey]);

  return state;
}

export default useFetchThunk;
