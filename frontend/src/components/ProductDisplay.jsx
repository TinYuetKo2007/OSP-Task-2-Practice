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