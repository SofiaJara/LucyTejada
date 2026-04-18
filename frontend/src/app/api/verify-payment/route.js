import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function GET(request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe no está configurado correctamente' },
      { status: 500 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requerido' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total / 100, // Convertir de centavos a dólares
      metadata: session.metadata,
    });

  } catch (error) {
    console.error('Error al verificar sesión de Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Error al verificar el pago' },
      { status: 500 }
    );
  }
}
