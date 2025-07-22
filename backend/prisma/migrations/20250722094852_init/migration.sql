-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_chat_id_fkey";

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
