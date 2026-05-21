import express from "express";
import cors from "cors";
import { productRoutes } from "./routes/productRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
  return response.json({
    message: "Inventory System API is running",
  });
});

app.use(productRoutes);

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
