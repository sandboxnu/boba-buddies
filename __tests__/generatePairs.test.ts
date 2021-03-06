import {shiftByOne, generatePairs} from "../utils/generatePairs";

describe('testing the util function for generating pairs', () =>{
    const mockApp: any = {
        client: {
            conversations: {

            }
        }
    };
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    })

    it('should pair an even numbered list', async () => {
        const evenList: string[] = ["rick", "morty", "summer", "beth"];
        const mockConversations: any = {
            members: jest.fn().mockReturnValue({ members: evenList })
        };
        mockApp.client.conversations = mockConversations;

        const actualList: string[][] = await generatePairs(mockApp);

        expect(actualList).toHaveLength(2);
        expect(actualList[0]).toHaveLength(2);
        expect(actualList[1]).toHaveLength(2);

        // ensure all names are present
        evenList.forEach((s) => {
            expect(actualList[0].includes(s) || actualList[1].includes(s)).toBeTruthy();
        });

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

        expect(actualList).toHaveLength(2);
        expect(actualList[0]).toHaveLength(2);
        expect(actualList[1]).toHaveLength(3);

        // ensure all names are present
        oddList.forEach((s) => {
            expect(actualList[0].includes(s) || actualList[1].includes(s)).toBeTruthy();
        });
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
    it('should not pair a list with 1 member', async () => {
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

    it('should shift member by one',  () => {
        jest.mock('../utils/data/pairings.json', ()=>({
              "1": ["a", "b"],
              "2": ["c", "d"],
              "3": ["e", "f", "g"]
        }))

        const actualList = shiftByOne();

        expect(actualList).toStrictEqual([['c', 'b'], ['g', 'd', 'e'], ['a', 'f']])
    })
})
