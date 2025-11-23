export default function ProductDisplay({ name, priceId }) {
    return (
        <div className="form-container">
            { name }
            
            <form action="http://localhost:4000/create-checkout-session" method="POST" className="form">
                <input name="priceId" type="hidden" value={priceId} />
                <button type="submit">Buy</button>
            </form>
        
        </div>
        
    )
}