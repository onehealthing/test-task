import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { emails, EmailDirection } from '@/lib/schema';
import { desc, like, or, sql, inArray, eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();

    if (!body.to || !body.subject) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newEmail = await db.insert(emails).values({
      threadId: body.threadId || crypto.randomUUID(),
      from: body.from || 'user@example.com',
      to: body.to,
      cc: body.cc || null,
      bcc: body.bcc || null,
      subject: body.subject,
      content: body.content || '',
      isRead: body.isRead !== undefined ? body.isRead : true,
      isImportant: body.isImportant !== undefined ? body.isImportant : false,
      direction: body.direction || EmailDirection.OUTGOING,
    }).returning();

    return Response.json(newEmail[0]);
  } catch (error) {
    console.error('Error creating email:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<Response> {
  try {
    const { id } = await req.json();

    if (!id) {
      return Response.json({ error: 'Missing email ID' }, { status: 400 });
    }

    await db.update(emails)
      .set({ isDeleted: true })
      .where(eq(emails.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting email:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<Response> {
  try {
    const { id, action } = await req.json();

    if (!id) {
      return Response.json({ error: 'Missing email ID' }, { status: 400 });
    }

    if (action === 'restore') {
      await db.update(emails)
        .set({ isDeleted: false })
        .where(eq(emails.id, id));
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating email:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search');
  const filter = searchParams.get('filter') || 'inbox';

  try {
    let result;
    let filterCondition;

    if (filter === 'trash') {
      filterCondition = eq(emails.isDeleted, true);
    } else if (filter === 'sent') {
      filterCondition = and(
        eq(emails.direction, EmailDirection.OUTGOING),
        eq(emails.isDeleted, false),
      );
    } else if (filter === 'important') {
      filterCondition = and(
        eq(emails.isImportant, true),
        eq(emails.isDeleted, false),
      );
    } else {
      filterCondition = and(
        eq(emails.direction, EmailDirection.INCOMING),
        eq(emails.isDeleted, false),
      );
    }

    if (search) {
      const searchPattern = `%${search}%`;
      const searchCondition = or(
        like(emails.subject, searchPattern),
        like(emails.to, searchPattern),
        like(emails.cc, searchPattern),
        like(emails.bcc, searchPattern),
        like(emails.content, searchPattern),
      );

      const whereCondition = and(filterCondition, searchCondition);

      result = await db.select().from(emails).where(whereCondition).orderBy(desc(emails.createdAt));
    } else {
      if (filter === 'inbox') {
        const latestEmailIds = db
          .select({ maxId: sql`MAX(${emails.id})` })
          .from(emails)
          .where(filterCondition)
          .groupBy(emails.threadId);

        result = await db
          .select()
          .from(emails)
          .where(inArray(emails.id, latestEmailIds))
          .orderBy(desc(emails.createdAt));
      } else {
        result = await db
          .select()
          .from(emails)
          .where(filterCondition)
          .orderBy(desc(emails.createdAt));
      }
    }

    return Response.json(result);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
