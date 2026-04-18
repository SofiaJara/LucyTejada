import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe no está configurado correctamente' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { reservaId, amount, currency = 'usd', reservaInfo } = body;

    if (!reservaId || !amount) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: reservaId y amount' },
        { status: 400 }
      );
    }

    // Crear sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Reserva de Vuelo #${reservaInfo?.codigo_reserva || reservaId}`,
              description: reservaInfo?.description || `Reserva para ${reservaInfo?.cantidad_viajeros || 1} pasajero(s)`,
              images: reservaInfo?.images || [],
            },
            unit_amount: Math.round(amount * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      metadata: {
        reserva_id: reservaId.toString(),
        codigo_reserva: reservaInfo?.codigo_reserva || '',
        cantidad_viajeros: reservaInfo?.cantidad_viajeros?.toString() || '1',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}&reserva_id=${reservaId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel?reserva_id=${reservaId}`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutos
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error al crear sesión de Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la sesión de pago' },
      { status: 500 }
    );
  }
}
