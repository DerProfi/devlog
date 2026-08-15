import * as utils from "./utils";

describe("formatDate", () => {
    it("should format date when given a string", () => {
        const date = "2026-01-01";
        const result = utils.formatDate(date);
        console.log("result:", result);

        expect(typeof result).toBe("string");
        expect(result).toBe("1. Jan. 2026");
    });

    it("should format date when given a valid date", () => {
        const date = new Date("2026-01-01");
        const result = utils.formatDate(date);

        expect(typeof result).toBe("string");
        expect(result).toBe("1. Jan. 2026");
    });
});

describe("getRelativeTime", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-10T12:00:00"));
    });

    afterEach(() => {
        vi.useRealTimers()
    });

    it("returns 'Today'", () => {
        const date = "2026-01-10";
        const result = utils.getRelativeTime(date);

        expect(typeof result).toBe("string");
        expect(result).toBe("Today");
    });
    it("returns 'Yesterday'", () => {
        const date = "2026-01-09";
        const result = utils.getRelativeTime(date);

        expect(typeof result).toBe("string");
        expect(result).toBe("Yesterday");
    });
    it("returns '?? days ago'", () => {
        const date = "2026-01-07";
        const result = utils.getRelativeTime(date);

        expect(typeof result).toBe("string");
        expect(result).toBe("3 days ago");
    });
    it("returns '?? weeks ago'", () => {
        const date = "2026-01-01";
        const result = utils.getRelativeTime(date);

        expect(typeof result).toBe("string");
        expect(result).toBe("1 weeks ago");
    });
    it("returns '?? months ago'", () => {
        const date = "2025-12-01";
        const result = utils.getRelativeTime(date);

        expect(typeof result).toBe("string");
        expect(result).toBe("1 months ago");
    });
});

describe("generateID", () => {
    it("returns a string", () => {
        const id = utils.generateId();

        expect(typeof id).toBe("string");
    });
    it("returns an id with at most 9 characters", () => {
        const id = utils.generateId();

        expect(id.length).toBeLessThanOrEqual(9);
    });
    it("returns a non-empty id", () => {
        const id = utils.generateId();

        expect(id).not.toBe("");
    });
    it("generates different ids", () => {
        const id1 = utils.generateId();
        const id2 = utils.generateId();

        expect(id1).not.toBe(id2);
    });
    it("generates an id from Math.rondom", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.123456789);

        const id = utils.generateId();

        expect(id).toBe("4fzzzxjyl");

        vi.restoreAllMocks();
    });
});

import { FaGrin, FaSmile, FaMeh, FaSadTear, FaFrown } from 'react-icons/fa';

describe("getMoodIcon", () => {
    it("returns FaGrin for mood >= 8", () => {
        expect(utils.getMoodIcon(8)).toBe(FaGrin);
        expect(utils.getMoodIcon(10)).toBe(FaGrin);
    });
    it("returns FaSmile for mood >= 6", () => {
        expect(utils.getMoodIcon(6)).toBe(FaSmile);
        expect(utils.getMoodIcon(7)).toBe(FaSmile);
    });
    it("returns FaMeh for mood >= 4", () => {
        expect(utils.getMoodIcon(4)).toBe(FaMeh);
        expect(utils.getMoodIcon(5)).toBe(FaMeh);
    });
    it("returns FaSadTear for mood >= 2", () => {
        expect(utils.getMoodIcon(2)).toBe(FaSadTear);
        expect(utils.getMoodIcon(3)).toBe(FaSadTear);
    });
    it("returns FaFrown for mood < 2", () => {
        expect(utils.getMoodIcon(1)).toBe(FaFrown);
        expect(utils.getMoodIcon(0)).toBe(FaFrown);
    });
});

describe("getMoodColor", () => {
    it("returns green for mood >= 8", () => {
        expect(utils.getMoodColor(8)).toBe("text-green-400");
        expect(utils.getMoodColor(10)).toBe("text-green-400");
    });
    it("returns blue for mood >= 6", () => {
        expect(utils.getMoodColor(6)).toBe("text-blue-400");
        expect(utils.getMoodColor(7)).toBe("text-blue-400");
    });
    it("returns yellow for mood >= 4", () => {
        expect(utils.getMoodColor(4)).toBe("text-yellow-400");
        expect(utils.getMoodColor(5)).toBe("text-yellow-400");
    });
    it("returns orange for mood >= 2", () => {
        expect(utils.getMoodColor(2)).toBe("text-orange-400");
        expect(utils.getMoodColor(3)).toBe("text-orange-400");
    });
    it("returns red for mood < 2", () => {
        expect(utils.getMoodColor(1)).toBe("text-red-400");
        expect(utils.getMoodColor(0)).toBe("text-red-400");
    });
});