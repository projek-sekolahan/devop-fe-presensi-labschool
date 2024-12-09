import apiXML from "./apiXML"; // Sesuaikan dengan path Anda
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks(); // Reset mock fetch untuk setiap pengujian
});

describe("apiXML class", () => {
    it("should fetch CSRF token successfully", async () => {
        const mockCsrf = { csrfHash: "mockCsrfToken123" };
        fetch.mockResponseOnce(JSON.stringify(mockCsrf));

        const csrfToken = await apiXML.getCsrf();
        expect(csrfToken).toBe(mockCsrf.csrfHash);
        expect(fetch).toHaveBeenCalledWith(
            "https://devop-sso.smalabschoolunesa1.sch.id/view/tokenGetCsrf",
            expect.any(Object)
        );
    });

    it("should handle POST request successfully", async () => {
        const mockResponse = "Success!";
        fetch.mockResponseOnce(mockResponse);

        const result = await apiXML.post("/test-endpoint", "key=value");
        expect(result).toBe(mockResponse);
        expect(fetch).toHaveBeenCalledWith(
            "https://devop-sso.smalabschoolunesa1.sch.id/test-endpoint",
            expect.any(Object)
        );
    });

    it("should timeout a request after specified time", async () => {
        fetch.mockImplementationOnce(() => new Promise(() => {})); // Mock delay
        await expect(
            apiXML.post("/test-timeout", "key=value", null, 100)
        ).rejects.toThrow("The user aborted a request.");
    });
});
