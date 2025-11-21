const products = [
    {
        name: "Zoo Ticket",
        priceId: "price_1SW0yGCZTWpALhZBIDwcknTN",
    },
    {
        name: "Hotel Booking 1 Night",
        priceId: "price_1SW0z7CZTWpALhZBkD8FKV5z",
    },
];

export default function ProductDisplay({ name, priceId }) {
    return (
        <>
            { name }
            
            <form action="http://localhost:4000/create-checkout-session" method="POST">
                <input name="priceId" type="hidden" value={priceId} />
                <button type="submit">Buy</button>
            </form>
        
        </>
        
    )
}