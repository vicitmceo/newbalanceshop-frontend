import { useShop } from '../context/ShopContext.jsx';

export default function Toasts() {
    const { toasts } = useShop();
    return (
        <div className="toasts" aria-live="polite">
            {toasts.map((x) => (
                <div key={x.id} className={`toast toast-${x.type}`}>{x.message}</div>
            ))}
        </div>
    );
}
