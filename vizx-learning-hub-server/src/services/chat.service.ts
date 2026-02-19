import { PrismaClient, MessageType } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatService {
  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: this.getConversationInclude() as any,
      orderBy: { updatedAt: 'desc' },
    });

    // We need to calculate unread counts for EACH conversation for THIS specific user
    return Promise.all(conversations.map(conv => this.formatConversation(conv, userId)));
  }

  async getMessages(conversationId: string, limit = 50, cursor?: string) {
    return prisma.message.findMany({
      where: { conversationId },
      take: -limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            department: {
              select: { name: true }
            }
          },
        },
      },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string, type: MessageType = 'TEXT') {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            department: {
              select: { name: true }
            }
          },
        },
      },
    });

    // Update conversation updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
  
  async getConversationParticipants(conversationId: string) {
    return prisma.participant.findMany({
      where: { conversationId },
      select: { userId: true }
    });
  }

  // Helper with common includes for conversation
  private getConversationInclude() {
    return {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
              status: true,
              department: {
                select: { name: true }
              }
            }
          }
        }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }
    };
  }

  private async formatConversation(conv: any, userId: string) {
    const participant = conv.participants.find((p: any) => p.userId === userId);
    const lastReadAt = participant?.lastReadAt || new Date(0);

    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conv.id,
        senderId: { not: userId },
        createdAt: { gt: lastReadAt }
      }
    });

    return {
      ...conv,
      lastMessage: conv.messages?.[0] || null,
      unreadCount
    };
  }

  async createOrGetDirectConversation(user1Id: string, user2Id: string) {
    // Check if direct conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: user1Id } } },
          { participants: { some: { userId: user2Id } } }
        ]
      },
      include: this.getConversationInclude() as any
    });

    if (existingConversation) {
      return await this.formatConversation(existingConversation, user1Id);
    }

    // Create new conversation
    const newConv = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: user1Id },
            { userId: user2Id },
          ],
        },
      },
      include: this.getConversationInclude() as any,
    });

    return await this.formatConversation(newConv, user1Id);
  }

  async markAsRead(conversationId: string, userId: string) {
    return prisma.participant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    const participants = await prisma.participant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    let unreadCount = 0;
    for (const p of participants) {
      const lastMessage = p.conversation.messages[0];
      if (lastMessage && lastMessage.createdAt > p.lastReadAt) {
        unreadCount++;
      }
    }
    return unreadCount;
  }

  async deleteConversation(conversationId: string, userId: string) {
    // Check if user is participant
    const participant = await prisma.participant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId }
      }
    });

    if (!participant) {
      throw new Error('You are not a participant in this conversation');
    }

    // Full deletion
    return prisma.conversation.delete({
      where: { id: conversationId }
    });
  }
}
