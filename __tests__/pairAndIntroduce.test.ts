import { startConversations } from "../pairAndIntroduce";

describe('testing the startConversations function', () =>{
    const mockApp: any = {
        client: {
            conversations: {

            },
            chat: {

            }
        }
    };
it('should not pair for an empty list', async() => {
    const emptyList: string[] = [];
    const mockConversations: any = {
        members: jest.fn().mockReturnValue({ members: emptyList }),
        open: jest.fn()
    };
    mockApp.client.conversations = mockConversations;

    await startConversations(mockApp);

    expect(mockConversations.members).toHaveBeenCalled();
    expect(mockConversations.open).toHaveBeenCalledTimes(0);
})

it('should open a DM between all pairs and send an intro msg/icebreaker for an even number of people', async() => {
    const evenList: string[] = ["ryan", "vera", "sophie", "jia"];
    const mockConversations: any = {
        members: jest.fn().mockReturnValue({ members: evenList }),
        open: jest.fn().mockReturnValue({ok: true, channel: {id: "hahaha"}})
    };
    const mockChat: any = {
        postMessage: jest.fn()
    };  

    mockApp.client.conversations = mockConversations;
    mockApp.client.chat = mockChat;

    await startConversations(mockApp);

    expect(mockConversations.members).toHaveBeenCalled();
    expect(mockConversations.open).toHaveBeenCalledTimes(2);
    expect(mockChat.postMessage).toHaveBeenCalledTimes(4);
})

it('should open a DM between all pairs and send an intro msg/icebreaker for an odd number of people', async() => {
    const oddList: string[] = ["ryan", "vera", "sophie", "jia", "rick"];
    const mockConversations: any = {
        members: jest.fn().mockReturnValue({ members: oddList }),
        open: jest.fn().mockReturnValue({ok: true, channel: {id: "hahaha"}})
    };
    const mockChat: any = {
        postMessage: jest.fn()
    };  

    mockApp.client.conversations = mockConversations;
    mockApp.client.chat = mockChat;

    await startConversations(mockApp);

    expect(mockConversations.members).toHaveBeenCalled();
    expect(mockConversations.open).toHaveBeenCalledTimes(2);
    expect(mockChat.postMessage).toHaveBeenCalledTimes(4);
})

});