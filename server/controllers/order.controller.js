import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartProduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

export async function CashOnDeliveryOrderController(req, res) {
  try {
    const userId = req.userId // auth middleware 
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body

    const payload = list_items.map(el => {
      return ({
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image
        },
        paymentId: "",
        payment_status: "PAGO CONTRA ENTREGA",
        delivery_address: addressId,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      })
    })

    const generatedOrder = await OrderModel.insertMany(payload)

    ///remove from the cart
    const removeCartItems = await CartProductModel.deleteMany({ userId: userId })
    const updateInUser = await UserModel.updateOne({ _id: userId }, { shopping_cart: [] })

    return res.json({
      message: "Pedido realizado con éxito.",
      error: false,
      success: true,
      data: generatedOrder
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
  const actualPrice = Number(price) - Number(discountAmout)
  return actualPrice
}

export async function paymentController(req, res) {
  try {
    const userId = req.userId // auth middleware 
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body

    const user = await UserModel.findById(userId)

    const line_items = list_items.map(item => {
      return {
        price_data: {
          currency: 'pen',
          product_data: {
            name: item.productId.name,
            images: item.productId.image,
            metadata: {
              productId: item.productId._id
            }
          },
          unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1
        },
        quantity: item.quantity
      }
    })

    const params = {
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success?locale=es`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel?locale=es`,
      locale: 'es'
    }

    const session = await Stripe.checkout.sessions.create(params)

    return res.status(200).json(session)

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


const getOrderProductItems = async ({
  lineItems,
  userId,
  addressId,
  paymentId,
  payment_status,
}) => {
  const productList = []

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product)

      const paylod = {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: product.metadata.productId,
        product_details: {
          name: product.name,
          image: product.images
        },
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: Number(item.amount_total / 100),
        totalAmt: Number(item.amount_total / 100),
      }

      productList.push(paylod)
    }
  }

  return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(req, res) {
  const event = req.body;
  const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

  console.log("event", event)

  // Manejar el evento
  switch (event.type) {
    case 'sesión de pago completada.':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
          lineItems: lineItems,
          userId: userId,
          addressId: session.metadata.addressId,
          paymentId: session.payment_intent,
          payment_status: session.payment_status,
        })

      const order = await OrderModel.insertMany(orderProduct)

      console.log(order)
      if (Boolean(order[0])) {
        const removeCartItems = await UserModel.findByIdAndUpdate(userId, {
          shopping_cart: []
        })
        const removeCartProductDB = await CartProductModel.deleteMany({ userId: userId })
      }
      break;
    default:
      console.log(`Tipo de evento no manejado ${event.type}`);
  }

  // Devuelve una respuesta (res) para reconocer la recepción del evento
  res.json({ received: true });
}


export async function getOrderDetailsController(req, res) {
  try {
    const userId = req.userId // order id

    const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).populate('delivery_address')

    return res.json({
      message: "lista de pedidos.",
      data: orderlist,
      error: false,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export async function getSalesReportController(req, res) {
  try {
    let { startDate, endDate } = req.query;

    let filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // 🔹 Verificar si los valores de fecha son válidos
    if ((startDate && isNaN(new Date(startDate))) || (endDate && isNaN(new Date(endDate)))) {
      return res.status(400).json({
        message: "Formato de fecha no válido. Usa YYYY-MM-DD.",
        error: true,
        success: false
      });
    }

    // 🔹 Optimización con aggregation y filtrado
    const salesReport = await OrderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmt" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // 🔹 Calcular totales
    const totalSales = salesReport.reduce((acc, item) => acc + item.totalSales, 0);
    const totalOrders = salesReport.reduce((acc, item) => acc + item.totalOrders, 0);

    return res.json({
      message: "Reporte de ventas generado exitosamente.",
      totalSales,
      totalOrders,
      salesByDate: salesReport,
      success: true,
      error: false
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error al obtener el reporte de ventas",
      error: true,
      success: false
    });
  }
}