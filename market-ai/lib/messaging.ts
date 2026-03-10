import { db } from "@/lib/db";

export async function getOrCreateConversation(participantIds: string[], propertyId?: string) {
  // Find existing conversation with these exact participants
  if (participantIds.length === 2) {
    const existing = await db.conversation.findFirst({
      where: {
        participants: {
          every: { userId: { in: participantIds } },
        },
        ...(propertyId ? { propertyId } : {}),
      },
      include: {
        participants: true,
      },
    });

    if (existing && existing.participants.length === participantIds.length) {
      return existing;
    }
  }

  // Create new conversation
  return db.conversation.create({
    data: {
      propertyId,
      participants: {
        create: participantIds.map((userId) => ({ userId })),
      },
    },
    include: { participants: true },
  });
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  // Verify sender is a participant
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant) throw new Error("Not a participant in this conversation");

  const [message] = await Promise.all([
    db.message.create({
      data: { conversationId, senderId, body },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}

export async function getConversationMessages(conversationId: string, userId: string, opts?: { limit?: number; before?: string }) {
  // Verify user is a participant
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) throw new Error("Not a participant in this conversation");

  return db.message.findMany({
    where: {
      conversationId,
      ...(opts?.before ? { createdAt: { lt: new Date(opts.before) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 50,
  });
}

export async function getUserConversations(userId: string) {
  const participations = await db.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return participations.map((p) => p.conversation);
}
