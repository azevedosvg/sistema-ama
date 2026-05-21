import { Router } from "express";

const productRoutes = Router();

const products = [
  {
    id: 1,
    name: "Leite Integral",
    category: "Laticínios",
    quantity: 20,
    expirationDate: "2026-06-10",
  },
  {
    id: 2,
    name: "Pão de Forma",
    category: "Padaria",
    quantity: 12,
    expirationDate: "2026-05-28",
  },
  {
    id: 3,
    name: "Iogurte Natural",
    category: "Laticínios",
    quantity: 8,
    expirationDate: "2026-05-24",
  },
];

productRoutes.get("/products", (request, response) => {
  return response.json(products);
});

productRoutes.get("/products/:id", (request, response) => {
  const { id } = request.params;

  const product = products.find((product) => product.id === Number(id));

  if (!product) {
    return response.status(404).json({
      message: "Product not found",
    });
  }

  return response.json(product);
});

productRoutes.post("/products", (request, response) => {
  const { name, category, quantity, expirationDate } = request.body;

  if (!name) {
    return response.status(400).json({
      message: "Product name is required",
    });
  }

  if (!category) {
    return response.status(400).json({
      message: "Product category is required",
    });
  }

  if (!quantity || quantity <= 0) {
    return response.status(400).json({
      message: "Product quantity must be greater than zero",
    });
  }

  if (!expirationDate) {
    return response.status(400).json({
      message: "Product expiration date is required",
    });
  }

  const newProduct = {
    id: products.length + 1,
    name,
    category,
    quantity,
    expirationDate,
  };

  products.push(newProduct);

  return response.status(201).json(newProduct);
});

productRoutes.put("/products/:id", (request, response) => {
  const { id } = request.params;
  const { name, category, quantity, expirationDate } = request.body;

  const productIndex = products.findIndex(
    (product) => product.id === Number(id),
  );

  if (productIndex === -1) {
    return response.status(404).json({
      message: "Product not found",
    });
  }

  if (!name) {
    return response.status(400).json({
      message: "Product name is required",
    });
  }

  if (!category) {
    return response.status(400).json({
      message: "Product category is required",
    });
  }

  if (!quantity || quantity <= 0) {
    return response.status(400).json({
      message: "Product quantity must be greater than zero",
    });
  }

  if (!expirationDate) {
    return response.status(400).json({
      message: "Product expiration date is required",
    });
  }

  const updatedProduct = {
    id: Number(id),
    name,
    category,
    quantity,
    expirationDate,
  };

  products[productIndex] = updatedProduct;

  return response.json(updatedProduct);
});

productRoutes.delete("/products/:id", (request, response) => {
  const { id } = request.params;

  const productIndex = products.findIndex(
    (product) => product.id === Number(id),
  );

  if (productIndex === -1) {
    return response.status(404).json({
      message: "Product not found",
    });
  }

  products.splice(productIndex, 1);

  return response.status(204).send();
});

export { productRoutes };
