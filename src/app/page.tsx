import React from 'react';
import { desc, sql, inArray, eq, and } from 'drizzle-orm';
import { db } from '@/lib/database';
import { emails, EmailDirection } from '@/lib/schema';
import ClientPage from '@/app/client-page';

export default async function Home({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = 'inbox' } = await searchParams;

  let emailListDef;

  if (filter === 'trash') {
    emailListDef = await db
      .select()
      .from(emails)
      .where(eq(emails.isDeleted, true))
      .orderBy(desc(emails.createdAt));
  } else if (filter === 'sent') {
    emailListDef = await db
      .select()
      .from(emails)
      .where(and(
        eq(emails.direction, EmailDirection.OUTGOING),
        eq(emails.isDeleted, false),
      ))
      .orderBy(desc(emails.createdAt));
  } else if (filter === 'important') {
    emailListDef = await db
      .select()
      .from(emails)
      .where(and(
        eq(emails.isImportant, true),
        eq(emails.isDeleted, false),
      ))
      .orderBy(desc(emails.createdAt));
  } else {
    const latestEmailIds = db
      .select({ maxId: sql`MAX(${emails.id})` })
      .from(emails)
      .where(and(
        eq(emails.direction, EmailDirection.INCOMING),
        eq(emails.isDeleted, false),
      ))
      .groupBy(emails.threadId);

    emailListDef = await db
      .select()
      .from(emails)
      .where(inArray(emails.id, latestEmailIds))
      .orderBy(desc(emails.createdAt));
  }

  return (
    <ClientPage emails={emailListDef} currentFilter={filter} />
  );
}
