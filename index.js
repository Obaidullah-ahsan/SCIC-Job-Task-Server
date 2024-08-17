const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkk0rbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("SCIC_Task").collection("products");

    app.get("/products", async (req, res) => {
      try {
        // all things here
        const {
          page = 1,
          limit = 10,
          search = "",
          brand,
          category,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder = "asc",
        } = req.query;

        // Build the query object for filtering
        let query = {};

        if (search) {
          query.Product_Name = { $regex: search, $options: "i" };
        }
        if (brand) {
          query.Brand = brand;
        }
        if (category) {
          query.Category = category;
        }
        if (minPrice && maxPrice) {
          query.Price = {
            $gte: parseFloat(minPrice),
            $lte: parseFloat(maxPrice),
          };
        }
        
        // Sorting options
        let sortOptions = {};
        if (sortBy) {
          sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        } else {
          sortOptions["creationDate"] = -1;
        }

        // Pagination options
        const skip = (page - 1) * limit;

        const products = await productsCollection
          .find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        const totalProducts = await productsCollection.countDocuments(query);

        res.send({
          products,
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: parseInt(page),
        });
      } catch (error) {
        res.status(500).send({ message: "Error fetching products", error });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Audiophile is running....");
});

app.listen(port, () => {
  console.log(`Audiophile app listening on port ${port}`);
});
