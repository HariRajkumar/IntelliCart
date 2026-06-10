import {
  Link,
} from "react-router-dom";
import Card from "./ui/Card";

const ProductCard = ({
  product,
}) => {
  return (
    <Link to={`/products/${product.id}`}>
      <Card className="p-4 hover:-translate-y-1 transition">
        <img
          src={
            product.images?.[0]
              ? `${import.meta.env.VITE_BACKEND_URL}${product.images[0]}`
              : "https://placehold.co/400x300"
          }
          alt={product.name}
          className="w-full h-48 object-cover rounded"
        />

        <h2 className="text-xl font-semibold mt-3 text-text">
          {product.name}
        </h2>

        <p className="text-muted mt-2">
          {product.description}
        </p>

        <p className="font-bold text-lg mt-3 text-text">
          ₹{product.price}
        </p>

        <p className="text-sm text-muted">
          Stock: {product.stock}
        </p>
      </Card>
    </Link>
  );
};

export default ProductCard;