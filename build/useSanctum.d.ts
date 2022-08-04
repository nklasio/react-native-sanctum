import { ContextProps } from "./SanctumContext";
interface useSanctumReturn<T> extends ContextProps {
    user: T;
}
export default function useSanctum<T = null | any>(): useSanctumReturn<T>;
export {};
