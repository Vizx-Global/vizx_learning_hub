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

    return conversations.map(conv => this.formatConversation(conv));
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

  private formatConversation(conv: any) {
    return {
      ...conv,
      lastMessage: conv.messages?.[0] || null
    };
  }

  async createOrGetDirectConversation(user1Id: string, user2Id: string) {
    // Check if direct conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participants: {
          some: { userId: user1Id }
        }
      },
      include: {
        participants: true
      }
    });

    // Double check it's exactly these two
    if (existingConversation) {
      const allParticipants = await prisma.participant.findMany({
        where: { conversationId: existingConversation.id }
      });
      const ids = allParticipants.map(p => p.userId);
      if (ids.length === 2 && ids.includes(user1Id) && ids.includes(user2Id)) {
        const fullConv = await prisma.conversation.findUnique({
          where: { id: existingConversation.id },
          include: this.getConversationInclude() as any
        });
        return this.formatConversation(fullConv);
      }
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

    return this.formatConversation(newConv);
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
