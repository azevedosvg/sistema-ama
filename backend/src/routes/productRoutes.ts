import { Router } from "express";
import { products } from "../data/products";
import { Product } from "../types/product";
import { getProductStatus } from "../utils/getProductStatus";
import { getDaysToExpire } from "../utils/getDaysToExpire";
import { calculateRiskValue } from "../utils/calculateRiskValue";

const productRoutes = Router();

productRoutes.get("/products", (_request, response) => {
  const productsWithStatus = products.map((product) => {
    return {
      ...product,
      status: getProductStatus(product.expirationDate),
      daysToExpire: getDaysToExpire(product.expirationDate),
      riskValue: calculateRiskValue(product.quantity, product.unitCost),
    };
  });

  return response.json(productsWithStatus);
});

productRoutes.get("/products/:id", (request, response) => {
  const { id } = request.params;

  const product = products.find((product) => product.id === Number(id));

  if (!product) {
    return response.status(404).json({
      message: "Product not found",
    });
  }

  return response.json({
    ...product,
    status: getProductStatus(product.expirationDate),
    daysToExpire: getDaysToExpire(product.expirationDate),
    riskValue: calculateRiskValue(product.quantity, product.unitCost),
  });
});

productRoutes.post("/products", (request, response) => {
  const { name, category, quantity, unitCost, expirationDate } = request.body;
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

  if (!unitCost || unitCost <= 0) {
    return response.status(400).json({
      message: "Product unit cost must be greater than zero",
    });
  }

  const newProduct: Product = {
    id: products.length + 1,
    name,
    category,
    quantity,
    unitCost,
    expirationDate,
  };

  products.push(newProduct);

  return response.status(201).json(newProduct);
});

productRoutes.put("/products/:id", (request, response) => {
  const { id } = request.params;
  const { name, category, quantity, unitCost, expirationDate } = request.body;
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

  if (!unitCost || unitCost <= 0) {
    return response.status(400).json({
      message: "Product unit cost must be greater than zero",
    });
  }

  if (!expirationDate) {
    return response.status(400).json({
      message: "Product expiration date is required",
    });
  }

  const updatedProduct: Product = {
    id: Number(id),
    name,
    category,
    quantity,
    unitCost,
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
