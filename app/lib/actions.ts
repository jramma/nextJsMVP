'use server';
// Marcar que todas estas acciones son de servidor y por tanto no se
// ejecutarán en el cliente
import { z } from 'zod';
import { Invoice } from './definitions';
import { CreateInvoice } from '../ui/invoices/buttons';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
const createInvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['paid', 'pending']),
  date: z.string(),
});
const CreateInvoiceFormSchema = createInvoiceSchema.omit({
  id: true,
  date: true,
});

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoiceFormSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  ///redondear precio
  const amountInCents = amount * 100;

  // creamos fecha ano mes dia
  const [date] = new Date().toISOString().split('T');

  console.log({
    customerId,
    amount,
    status,
    date,
  });

  await sql`
    INSERT INTO invoices
        (customer_id, amount, status, date)
    VALUES
        (${customerId}, ${amountInCents}, ${status}, ${date})
`;

  revalidatePath('/dashboard/invoices');

  redirect('/dashboard/invoices');
}
