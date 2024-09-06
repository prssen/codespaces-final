// TODO create server actions for CRUD operations on Transaction model

"use server";

// TODO: consider using these to call 'service layer' functions which interact with the DB,
// as in the 'developedbyed' video and here (https://react.dev/reference/react-dom/components/form#handle-form-submission-with-a-server-action)
// adds extra layer of indirection, decide if extra layer is necessary

export async function getTransactionById(id) {
    // From https://github.com/vercel/next.js/blob/canary/examples/next-forms/app/actions.ts
    // Can validate data here as well, before submitting to DB
    // E.g.
    /*
  const schema = z.object({
    todo: z.string().min(1),
  });
  const parse = schema.safeParse({
    todo: formData.get("todo"),
  });

  if (!parse.success) {
    return { message: "Failed to create todo" };
  }

  const data = parse.data;

  try {
    await sql`
      INSERT INTO todos (text)
      VALUES (${data.todo})
    `;

    revalidatePath("/");
    */
}

// Or is a class with functions better/possible?
export { remainingTransactions };
