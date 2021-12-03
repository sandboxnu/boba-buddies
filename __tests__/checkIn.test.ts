import { checkIn } from "../utils/checkIn";

describe('testing the util function for checking in on past pairings', () =>{
    const mockApp: any = {
        client: {
            conversations: {

            },
            chat: {

            }
        }
    };
    it('should send a good status message if non-bot messages exceed 0', async () => {
        const messageHistory = [{user: "Vera"}, {user: "Ryan"}];
        const mockConversations: any = {
            history: jest.fn().mockReturnValue({ messages: messageHistory }),
        };
        const mockChat: any = {
            postMessage: jest.fn().mockReturnValue({})
        };
        mockApp.client.conversations = mockConversations;
        mockApp.client.chat = mockChat;

        await checkIn(mockApp);

        expect(mockConversations.history).toHaveBeenCalled();
        expect(mockChat.postMessage).toHaveBeenCalledWith({channel: "test_channel", text: 'Thank you for talking to each other!!!'});
    })
    it('should send a bad status message if no non-bot messages were sent', async () => {
        const emptyHistory: string[] = [];
        const mockConversations: any = {
            history: jest.fn().mockReturnValue({ messages: emptyHistory }),
        };
        const mockChat: any = {
            postMessage: jest.fn().mockReturnValue({})
        };
        mockApp.client.conversations = mockConversations;
        mockApp.client.chat = mockChat;

        await checkIn(mockApp);

        expect(mockConversations.history).toHaveBeenCalled();
        expect(mockChat.postMessage).toHaveBeenCalledWith({channel: "test_channel", text: "SAY SOMETHING NOW <@Jia>!!"});
    })
})