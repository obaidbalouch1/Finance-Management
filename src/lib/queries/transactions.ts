import type { PrismaClient } from "@prisma/client"

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

type BalanceEffectInput = {
  accountId: string
  type: "INCOME" | "EXPENSE"
  amount: number
}

function signedAmount(input: BalanceEffectInput) {
  return input.type === "INCOME" ? input.amount : -input.amount
}

/** INCOME increases the account balance, EXPENSE decreases it. */
export async function applyBalanceEffect(tx: TxClient, input: BalanceEffectInput) {
  await tx.financialAccount.update({
    where: { id: input.accountId },
    data: { balance: { increment: signedAmount(input) } },
  })
}

/** Reverses a previously applied balance effect (used on update/delete). */
export async function reverseBalanceEffect(tx: TxClient, input: BalanceEffectInput) {
  await tx.financialAccount.update({
    where: { id: input.accountId },
    data: { balance: { decrement: signedAmount(input) } },
  })
}
