const request = require('supertest')
const app = require('../server')



describe('Testing show profile', () => {
    beforeAll(done => {
        done()
    })

    afterAll(done => {
        done()
    })


    it('Should return error when querying user that doesn\'t exists', async () => {
        let fakeUsername = 'mary5555777'
        const res = await request(app)
            .post(`/public/profile/${fakeUsername}`)

        expect(res.statusCode).toEqual(400)

    })

    it('Should return error when querying "my profile" with a fake bearer token', async () => {

        let fakeToken = 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFhZmE4MTJiMTY5NzkxODBmYzc4MjA5ZWE3Y2NhYjkxZTY4NDM2NTkiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoibWFyeTU1NTUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vbWFyeWNsb3VkaW5hcnkvaW1hZ2UvdXBsb2FkL3YxNjQ3MTg4OTM4L21lbWV3YWxsZXQvbmV3X3VzZXIucG5nIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL21lbWV3YWxsZXQtMzBlMWEiLCJhdWQiOiJtZW1ld2FsbGV0LTMwZTFhIiwiYXV0aF90aW1lIjoxNjQ5OTYxNjg4LCJ1c2VyX2lkIjoiVmhFNTJ4ZEMxYWdNZmpVdGxYRjQweTRScTljMiIsInN1YiI6IlZoRTUyeGRDMWFnTWZqVXRsWEY0MHk0UnE5YzIiLCJpYXQiOjE2NDk5NjE2ODgsImV4cCI6MTY0OTk2NTI4OCwiZW1haWwiOiJtYXJ5NTU1NUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibWFyeTU1NTVAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.pOGEizkBAWgXjVuBLeYaxaKNGM01LCVLnhKe6eo67_wH9jq8nstxqXL9cKaSLZh8fD-tB2zX7gs2S6BvzjC59A5jb2eheg7N1u1QXOGO3kk-u5V6iwAHvNv6nMfCaRqom6_NWhg2kRPAURbfkOcBEtVYc4gsUvPTlrSlp6MX5mnds1Vs6LWABHWZOF92SSyID4VTK1rSVlE8bLjpEB6mxmf-1l5C5iaTc7a4yB8bRWJ9WWA92dRxkxHCEmE-EaOZfgvdrmv0eSqR4QjO7lPcsjnVmCO174bZXX7Yycn_G2nbwEiNTFotT2wHWBQVsQ1u0oCIY0LRmuJeTPumQ63enA'
        const res = await request(app)
            .post(`/account/profile/`)
            .set('Authorization', fakeToken)


        expect(res.statusCode).toEqual(401) //unauthorized

    }, 10000)
    // it('Should connect with Moralis API', async () => {
    //
    //     const res = await request(app)
    //         .post(`/public/moralis-test`)
    //
    //     expect(res.statusCode).toEqual(200)
    //     expect(res.body).toHaveProperty('nfts')
    //
    // }, 50000)
    it('Should get info of an account', async () => {
        let account = 'marytest1'
        const res = await request(app)
            .post(`/public/profile/${account}`)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('account')


    }, 10000)
})
