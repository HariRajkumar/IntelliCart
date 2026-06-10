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
      px-6
    "
    >
      <h1
        className="
        text-5xl
        font-bold
        mb-4
        text-text
      "
      >
        IntelliCart
      </h1>

      <p
        className="
        text-xl
        text-muted
      "
      >
        AI-Powered E-Commerce Platform
      </p>

      <Link
        to="/products"
        className="
        mt-8
        inline-flex
        items-center
        justify-center
        rounded-lg
        bg-primary
        px-6
        py-3
        text-white
        transition
        hover:bg-primary-hover
      "
      >
        Shop Now
      </Link>
    </div>
  );
};

export default Home;