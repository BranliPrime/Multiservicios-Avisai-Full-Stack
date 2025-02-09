import express from "express";
import axios from "axios";
import { config } from "dotenv";
config();

const router = express.Router();

router.post("/consulta-sunat", async (req, res) => {
  console.log("📩 Recibiendo petición:", req.body);

  const { documento, tipo } = req.body;
  if (!documento || !tipo) {
    console.log("⚠️ Faltan parámetros en la petición");
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const url = tipo === "dni"
      ? `https://api.apis.net.pe/v1/dni?numero=${documento}`
      : `https://api.apis.net.pe/v1/ruc?numero=${documento}`;

    console.log("🌎 Consultando API:", url);

    const response = await axios.get(url, {
      headers: { "Authorization": `Bearer ${process.env.SUNAT_API_KEY}` }
    });

    console.log("✅ Respuesta API:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error al consultar la SUNAT:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al consultar la SUNAT" });
  }
});


export default router;
