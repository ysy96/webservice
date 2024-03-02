const app = require("./app")
const supertest = require("supertest")
const request = supertest(app)


// Unit test
describe('GET /healthz', () => {
    it("should return a response", async () => {
        const response = await request.get("/healthz")
        expect(response.status).toBe(200)
    })
})