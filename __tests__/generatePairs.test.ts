import generatePairs from "../utils/generatePairs";

describe('testing the util function for generating pairs', () =>{
    const mockApp: any = {
        client: {
            conversations: {

            }
        }
    };

    it('should pair an even numbered list', async () => {
        const evenList: string[] = ["rick", "morty", "summer", "beth"];
        const mockConversations: any = {
            members: jest.fn().mockReturnValue({ members: evenList })
        };
        mockApp.client.conversations = mockConversations;

        const actualList: string[][] = await generatePairs(mockApp);

        expect(actualList).toStrictEqual([["rick", "morty"], ["summer", "beth"]]);
        expect(mockConversations.members).toHaveBeenCalled();
    })
    it('should pair an odd numbered list', async () => {
        // gdi jerry smh
        const oddList: string[] = ["rick", "morty", "summer", "beth", "jerry"];
        const mockConversations: any = {
            members: jest.fn().mockReturnValue({ members: oddList })
        };
        mockApp.client.conversations = mockConversations;

        const actualList: string[][] = await generatePairs(mockApp);

        expect(actualList).toStrictEqual([["rick", "morty"], ["summer", "beth", "jerry"]]);
        expect(mockConversations.members).toHaveBeenCalled();
    })
    it('should pair an empty list', async () => {
        const emptyList: string[] = [];
        const mockConversations: any = {
            members: jest.fn().mockReturnValue({ members: emptyList })
        };
        mockApp.client.conversations = mockConversations;

        const actualList: string[][] = await generatePairs(mockApp);

        expect(actualList).toStrictEqual([]);
        expect(mockConversations.members).toHaveBeenCalled();
    })

    // this would never happen hopefully
    it('should pair a list with 1 member', async () => {
        // sorry jerry, not even the slack bot wants to talk to you
        const jerryList: string[] = ["jerry"];
        const mockConversations: any = {
            members: jest.fn().mockReturnValue({ members: jerryList })
        };
        mockApp.client.conversations = mockConversations;

        const actualList: string[][] = await generatePairs(mockApp);

        expect(actualList).toStrictEqual([]);
        expect(mockConversations.members).toHaveBeenCalled();
    })
})