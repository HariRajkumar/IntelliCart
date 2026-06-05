import {
  Link,
} from "react-router-dom";

const ProductCard = ({
  product,
}) => {
  return (
    <Link
        to={`/products/${product.id}`}
    >

        <div
        className="
        border
        rounded-lg
        p-4
        shadow-sm
        bg-white
        "
        >
        <img
            src={
            product.images?.[0]
                ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0]}`
                : "https://placehold.co/400x300"
            }
            alt={product.name}
            className="
            w-full
            h-48
            object-cover
            rounded
        "
        />

        <h2
            className="
            text-xl
            font-semibold
            mt-3
        "
        >
            {product.name}
        </h2>

        <p
            className="
            text-gray-600
            mt-2
        "
        >
            {product.description}
        </p>

        <p
            className="
            font-bold
            text-lg
            mt-3
        "
        >
            ₹{product.price}
        </p>

        <p
            className="
            text-sm
            text-gray-500
        "
        >
            Stock: {product.stock}
        </p>
        </div>
        
    </Link>
  );
};

export default ProductCard;