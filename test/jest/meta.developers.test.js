import KloudlessSDK from '../../lib/kloudless'

let kloudless = new KloudlessSDK(process.env.API_KEY || 'your-api-key-here')

if (process.env.DEV_KEY)
    kloudless.setDeveloperKey(process.env.DEV_KEY)
if (process.env.API_HOST)
    kloudless.setHost(process.env.API_HOST, process.env.API_PORT || 443)
if (process.env.API_CA != null)
    kloudless.setCA(process.env.API_CA)

let developerId;

test('List developers', done => {
    kloudless.developers.list({}, function (err, res, response) {
        expect(err).toBe(null)

        expect(res.api).toBe('meta')
        expect(res.type).toBe('object_list')
        expect(res.objects.length > 0).toBe(true)
        developerId = res.objects[0].id
        done()
    })

})

let originalFirstName
let originalLastName
test('Get a developer', done => {
    kloudless.developers.get({
        developer_id: developerId
    }, function (err, res, response) {
        expect(err).toBe(null)

        expect(res.api).toBe('meta')
        expect(res.type).toBe('developer')
        originalFirstName = res.first_name
        originalLastName = res.last_name
        done()
    })
})
test('Update a developer', done => {
    kloudless.developers.update({
        developer_id: developerId,
        first_name: 'ChihHung',
        last_name: 'Chen'
    }, function (err, res, response) {
        expect(err).toBe(null)

        expect(res.first_name).toBe('ChihHung')
        expect(res.last_name).toBe('Chen')

        // update back
        kloudless.developers.update({
            developer_id: developerId,
            first_name: originalFirstName,
            last_name: originalLastName
        }, function (err, res, response) {
            expect(err).toBe(null)

            expect(res.first_name).toBe(originalFirstName)
            expect(res.last_name).toBe(originalLastName)
            done()
        })
    })
})
