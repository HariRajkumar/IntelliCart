import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="
      flex
      flex-col
      items-center
      justify-center
      min-h-[80vh]
    "
    >
      <h1
        className="
        text-5xl
        font-bold
        mb-4
      "
      >
        IntelliCart
      </h1>

      <p
        className="
        text-xl
        text-gray-600
      "
      >
        AI-Powered E-Commerce Platform
      </p>

      <Link
        to="/products"
        className="
        mt-8
        bg-black
        text-white
        px-6
        py-3
        rounded
      "
      >
        Shop Now
      </Link>
    </div>
  );
};

export default Home;