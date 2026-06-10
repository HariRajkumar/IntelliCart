import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { getProductById } from "../services/productService";

import { addToCart } from "../services/cartService";

import { getErrorMessage } from "../utils/errorHandler";

const ProductDetail = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);

  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await getProductById(id);

      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);

    try {
      await addToCart(product.id, quantity);

      toast.success("Added to cart");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-8">
      <div>
        <img
          src={
            product.images?.[0]
              ? `http://localhost:8000${product.images[0]}`
              : "https://placehold.co/800x600"
          }
          alt={product.name}
          className="w-full rounded-3xl"
        />
      </div>

      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-text">{product.name}</h1>

        <p className="text-muted mb-4">{product.description}</p>

        <p className="text-2xl font-bold text-text mb-4">₹{product.price}</p>

        <p className="text-text mb-4">Stock: {product.stock}</p>

        <Input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-24 mb-4"
        />

        <Button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="px-6 py-3"
        >
          {addingToCart ? "Adding..." : "Add To Cart"}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;
